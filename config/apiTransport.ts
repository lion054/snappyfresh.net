/**
 * Snappy Fresh - API Transport Layer
 * Contains the core HTTP client: token management, session handling, and raw HTTP verbs.
 */

import { secureStorage } from '../lib/secureStorage';
import { logger } from '../lib/logger';

/**
 * Retry configuration and utility
 */
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelayMs: 500,
  maxDelayMs: 5000,
  // Only retry transient failures (timeouts, rate limits, server errors)
  // Do NOT retry 401/403 (auth errors) - refreshing won't help
  retryableStatus: [408, 429, 500, 502, 503, 504],
};

/**
 * Calculate exponential backoff delay with jitter
 */
function getBackoffDelay(attempt: number): number {
  const exponentialDelay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 100;
  return Math.min(exponentialDelay + jitter, RETRY_CONFIG.maxDelayMs);
}

/**
 * Recursively convert PascalCase keys from SAP B1 API to camelCase.
 * This means downstream code can rely on camelCase only instead of
 * checking both `foo.DocTotal` and `foo.docTotal` everywhere.
 */
function toCamelCase(key: string): string {
  return key.charAt(0).toLowerCase() + key.slice(1);
}

function normalizeKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeKeys);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        toCamelCase(k),
        normalizeKeys(v),
      ])
    );
  }
  return value;
}

class ApiClient {
  baseURL: string;
  authUrl: string;
  siteUrl: string;
  returnUrl: string;
  companyName: string;
  title: string;
  currency: string;
  innbucksInterval: number;
  pixelId: string;
  gaMeasurementId: string;
  sessionInitialized: boolean;
  sessionPromise: Promise<any> | null;

  // Product cache copied from oldyomik implementation
  productCache: {
    expireDateTime: Date;
    params: any;
    products: any;
  };

  constructor() {
    // Validate critical environment variables
    if (!process.env['NEXT_PUBLIC_API_BASE_URL']) {
      logger.warn('NEXT_PUBLIC_API_BASE_URL is not set — using fallback. Set this in .env.local for production.');
    }

    this.baseURL = process.env['NEXT_PUBLIC_API_BASE_URL'] || 'https://yomilk.onaerp.africa:8092/api/';
    this.authUrl = process.env['NEXT_PUBLIC_API_BASE_URL'] || 'https://yomilk.onaerp.africa:8092/api/';
    this.siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] || 'https://snappyfresh.net/';
    this.returnUrl = process.env['NEXT_PUBLIC_RETURN_URL'] || 'https://snappyfresh.net/check-order';
    this.companyName = process.env['NEXT_PUBLIC_COMPANY_NAME'] || 'Yomilk';
    this.title = process.env['NEXT_PUBLIC_SITE_TITLE'] || 'Snappy Fresh';
    this.currency = process.env['NEXT_PUBLIC_CURRENCY'] || 'USD';
    this.innbucksInterval = parseInt(process.env['NEXT_PUBLIC_INNBUCKS_INTERVAL'] || '30000');
    this.pixelId = process.env['NEXT_PUBLIC_FB_PIXEL_ID'] || '';
    this.gaMeasurementId = process.env['NEXT_PUBLIC_GA_MEASUREMENT_ID'] || '';
    this.sessionInitialized = false;
    this.sessionPromise = null;

    this.productCache = {
      expireDateTime: new Date(0),
      params: null,
      products: null,
    };

    // Migrate from localStorage to secure storage on initialization
    if (typeof window !== 'undefined') {
      secureStorage.migrateFromLocalStorage();
    }
  }

  /**
   * Get authentication token from client-side cookie or in-memory SSR cache
   */
  getToken() {
    // SSR: use in-memory token if available
    if (this.cachedToken) {
      return this.cachedToken;
    }
    // Client: use secure storage
    if (typeof window !== 'undefined') {
      return secureStorage.getToken();
    }
    return null;
  }

  /**
   * Set authentication token in client-side cookie or in-memory SSR cache
   */
  setToken(token: string) {
    // Always cache in memory for SSR lifecycle
    this.cachedToken = token;
    // Client-side: also persist to secure storage
    if (typeof window !== 'undefined') {
      secureStorage.setToken(token);
    }
  }

  /**
   * In-memory token cache for SSR requests
   */
  private cachedToken: string | null = null;

  /**
   * Get auth user session
   */
  getAuthUser() {
    if (typeof window !== 'undefined') {
      return secureStorage.getUser();
    }
    return null;
  }

  /**
   * Save auth user session
   * Works both on server (SSR) and client - always cache token in memory
   */
  saveAuthUser(authData: Record<string, unknown> & { token?: string; tokenExpiry?: string; customer?: Record<string, unknown> }) {
    // Always cache token in memory for SSR and client
    if (authData.token) {
      if (!authData.tokenExpiry) {
        const tokenExpiry = this.getTokenExpiryFromJwt(authData.token);
        if (tokenExpiry) {
          authData.tokenExpiry = tokenExpiry;
        }
      }
      this.setToken(authData.token);
    }

    // Client-side: also save to secure storage
    if (typeof window !== 'undefined') {
      secureStorage.setUser(authData);
    }
  }

  /**
   * Derive token expiry from JWT (fallback when API does not provide tokenExpiry)
   */
  getTokenExpiryFromJwt(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
      if (!payload.exp) {
        return null;
      }
      return new Date(payload.exp * 1000).toISOString();
    } catch (error) {
      logger.error('Failed to parse JWT expiry:', error);
      return null;
    }
  }

  /**
   * Clear authentication token and session data
   */
  clearToken() {
    if (typeof window !== 'undefined') {
      secureStorage.clearAll();
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Check if the current token is expired by inspecting its JWT payload.
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
      if (!payload.exp) return false; // No expiry claim — assume valid
      return Date.now() >= payload.exp * 1000;
    } catch {
      // Malformed token — treat as expired
      return true;
    }
  }

  /**
   * Get or create cash customer session (guest session)
   * This allows users to browse and shop without logging in
   */
  async ensureSession() {
    // If we have a valid (non-expired) token, we're good
    if (this.isAuthenticated() && !this.isTokenExpired()) {
      return true;
    }

    // Token exists but is expired — clear it so we fetch a fresh one
    if (this.isAuthenticated() && this.isTokenExpired()) {
      logger.info('Session token expired — clearing stale session');
      this.clearToken();
      this.sessionInitialized = false;
    }

    // If a session is already being fetched, wait for it
    if (this.sessionPromise) {
      return this.sessionPromise;
    }

    this.sessionPromise = (async () => {
      try {
        logger.info('Getting Cash Customer Session (Guest Mode)');
        const response = await fetch(`${this.authUrl}Auths/CashCustomer/Session`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/html, */*',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to get guest session');
        }

        const data = await response.json();
        logger.info('Guest session response:', {
          hasToken: !!data.token,
          tokenLength: data.token ? String(data.token).length : 0,
          dataKeys: Object.keys(data),
        });

        if (data && data.token) {
          // Ensure guest sessions are marked as visitors
          if (!data.customer) {
            data.customer = {};
          }
          if (data.customer && data.customer.isVisitor === undefined) {
            data.customer.isVisitor = true;
          }

          this.saveAuthUser(data);
          this.sessionInitialized = true;
          logger.info('Guest session initialized successfully', {
            token: data.token.substring(0, 20) + '...',
          });
          return true;
        } else {
          logger.warn('Guest session response has no token:', data);
        }
      } catch (error) {
        // Stealth mode: log only in dev, silent fail in production
        if (process.env.NODE_ENV === 'development') {
          logger.error('Error getting guest session:', error);
        }
        // Continue anyway - some endpoints might not need auth
      } finally {
        this.sessionPromise = null;
      }

      return false;
    })();

    return this.sessionPromise;
  }

  /**
   * Build headers for API requests
   * Note: Do NOT send token to auth endpoints (like Auths/CashCustomer/Session)
   * Auth endpoints should be called without Authorization header
   */
  buildHeaders(endpoint?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'text/html, application/xhtml+xml, */*',
    };

    // Don't add token for auth endpoints
    const isAuthEndpoint = endpoint && (
      endpoint.includes('Auth') ||
      endpoint.includes('auth') ||
      endpoint.includes('Session')
    );

    const token = this.getToken();
    if (token && !isAuthEndpoint) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API response.
   * On 401 for guest sessions, automatically refresh and retry the request once.
   * But if a refreshed session is ALSO rejected with 401, fail fast (don't loop).
   */
  private lastRefreshTime: number = 0;
  private get isRecentlyRefreshed(): boolean {
    return Date.now() - this.lastRefreshTime < 1000; // Within 1 second
  }

  async handleResponse(response: Response, retryRequest?: () => Promise<Response>): Promise<any> {
    // Quick path for explicit 401 — clear session and try refresh before reading body
    if (response.status === 401) {
      // If we just refreshed in the last second and STILL got 401, auth is broken - fail fast
      if (this.isRecentlyRefreshed) {
        logger.error('Session refresh failed - API still rejecting with 401. Giving up.');
        throw new Error('Unauthorized - Session refresh did not help');
      }

      this.clearToken();
      this.sessionInitialized = false;

      if (retryRequest) {
        this.lastRefreshTime = Date.now();
        const refreshed = await this.ensureSession();
        if (refreshed) {
          logger.info('Session refreshed after 401 — retrying request');
          const retryResponse = await retryRequest();
          return this.handleResponse(retryResponse);
        }
      }

      throw new Error('Unauthorized - Session expired');
    }

    let rawText = '';
    try {
      rawText = await response.text();
    } catch (error) {
      logger.error('Failed to read response text:', error);
      throw new Error('Failed to read API response');
    }

    // Check if response is HTML (error page) instead of JSON
    const isHtml = rawText.trim().toLowerCase().startsWith('<!doctype') ||
                   rawText.trim().toLowerCase().startsWith('<html') ||
                   rawText.trim().startsWith('<');

    // Check if response looks like JSON
    const isJson = rawText.trim().startsWith('{') || rawText.trim().startsWith('[');

    if (!response.ok) {
      let errorBody: { message?: string; error?: string } = {};
      try {
        if (isJson) {
          errorBody = JSON.parse(rawText);
        } else {
          errorBody = { message: rawText || `HTTP Error ${response.status}` };
        }
      } catch (_err) {
        errorBody = { message: rawText || `HTTP Error ${response.status}` };
      }
      const message = errorBody.message || errorBody.error || `HTTP Error ${response.status}`;

      // Detect session expiry even when the server returns 500 instead of 401.
      // The API wraps auth errors in a 500 with messages like
      // "Invalid session or session already timeout. (401)"
      const lowerMsg = message.toLowerCase();
      const isSessionExpired =
        response.status === 401 ||
        lowerMsg.includes('session already timeout') ||
        lowerMsg.includes('invalid session') ||
        lowerMsg.includes('session expired') ||
        (lowerMsg.includes('(401)'));

      if (isSessionExpired && retryRequest) {
        logger.info('Session expired (detected from response body) — refreshing');
        this.clearToken();
        this.sessionInitialized = false;

        const refreshed = await this.ensureSession();
        if (refreshed) {
          logger.info('Session refreshed — retrying request');
          const retryResponse = await retryRequest();
          return this.handleResponse(retryResponse);
        }
      }

      const error = Object.assign(new Error(message), {
        status: response.status,
        rawText,
      });
      throw error;
    }

    // Response is OK (200-299) - now parse the body
    if (isHtml) {
      logger.error('API returned HTML instead of JSON:', {
        status: response.status,
        endpoint: response.url,
        firstChars: rawText.substring(0, 100),
      });
      throw new Error(`API endpoint returned HTML error page (Status: ${response.status}). Endpoint may not exist or may require different authentication.`);
    }

    if (!isJson) {
      logger.warn('API returned non-JSON response:', {
        status: response.status,
        endpoint: response.url,
        contentType: response.headers?.get('content-type'),
        firstChars: rawText.substring(0, 100),
      });
      // Try to parse anyway - if it's empty, return empty object
      if (rawText.trim().length === 0) {
        return {};
      }
    }

    try {
      const parsed = JSON.parse(rawText);
      return normalizeKeys(parsed);
    } catch (error) {
      logger.error('Failed to parse JSON response:', {
        error,
        responseText: rawText.substring(0, 200),
        endpoint: response.url,
      });
      throw new Error('Invalid JSON response from API - endpoint may be misconfigured');
    }
  }

  /**
   * Execute fetch with retry logic and exponential backoff
   */
  private async executeWithRetry(
    doFetch: () => Promise<Response>,
    endpoint: string,
    method: string
  ): Promise<any> {
    let lastError: any;

    for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
      try {
        const response = await Promise.race([
          doFetch(),
          new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error('API request timeout after 10s')), 10000)
          ),
        ]);

        // Check if response is retryable
        if (RETRY_CONFIG.retryableStatus.includes(response.status)) {
          if (attempt === RETRY_CONFIG.maxAttempts) {
            logger.error(`[${method} ${endpoint}] Server error after ${attempt} attempts:`, {
              status: response.status,
              attempt,
            });
            throw new Error(`API server error (${response.status}): ${response.statusText}`);
          }

          const delay = getBackoffDelay(attempt);
          logger.warn(`[${method} ${endpoint}] Retryable status ${response.status}, waiting ${delay}ms (attempt ${attempt}/${RETRY_CONFIG.maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        return await this.handleResponse(response, doFetch);
      } catch (error: any) {
        lastError = error;

        // Determine if error is retryable
        const isNetworkError = error.message.includes('fetch') || error.message.includes('timeout') || error.name === 'TypeError';
        const isRetryable = isNetworkError && attempt < RETRY_CONFIG.maxAttempts;

        if (isRetryable) {
          const delay = getBackoffDelay(attempt);
          logger.warn(`[${method} ${endpoint}] Network error, retrying in ${delay}ms (attempt ${attempt}/${RETRY_CONFIG.maxAttempts}):`, error.message);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // Non-retryable error or final attempt
        const errorMessage = error.message || String(error);
        logger.error(`[${method} ${endpoint}] Failed after ${attempt} attempt(s):`, {
          error: errorMessage,
          endpoint,
          method,
        });

        throw error;
      }
    }

    throw lastError || new Error('API request failed');
  }

  /**
   * Make a GET request with retry logic
   */
  async get(endpoint: string, params: Record<string, string> = {}, signal?: AbortSignal): Promise<any> {
    await this.ensureSession();

    let url = `${this.baseURL}${endpoint}`;

    if (Object.keys(params).length > 0) {
      url += `?${new URLSearchParams(params).toString()}`;
    }

    const doFetch = () => fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(endpoint),
      signal,
    });

    return this.executeWithRetry(doFetch, endpoint, 'GET');
  }

  /**
   * Make a POST request with retry logic
   */
  async post(endpoint: string, data: unknown = {}, signal?: AbortSignal): Promise<any> {
    // Don't ensure session for auth endpoints
    if (!endpoint.includes('Auth')) {
      await this.ensureSession();
    }

    const url = `${this.baseURL}${endpoint}`;

    const doFetch = () => fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(endpoint),
      body: JSON.stringify(data),
      signal,
    });

    return this.executeWithRetry(doFetch, endpoint, 'POST');
  }

  /**
   * Make a PUT request with retry logic
   */
  async put(endpoint: string, data: unknown = {}, signal?: AbortSignal): Promise<any> {
    await this.ensureSession();

    const url = `${this.baseURL}${endpoint}`;

    const doFetch = () => fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(endpoint),
      body: JSON.stringify(data),
      signal,
    });

    return this.executeWithRetry(doFetch, endpoint, 'PUT');
  }

  /**
   * Make a DELETE request with retry logic
   */
  async delete(endpoint: string, signal?: AbortSignal): Promise<any> {
    await this.ensureSession();

    const url = `${this.baseURL}${endpoint}`;

    const doFetch = () => fetch(url, {
      method: 'DELETE',
      headers: this.buildHeaders(endpoint),
      signal,
    });

    return this.executeWithRetry(doFetch, endpoint, 'DELETE');
  }
}

// Singleton — created once on first import
export const apiTransport = new ApiClient();
