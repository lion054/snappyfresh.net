/**
 * Snappy Fresh - API Facade
 *
 * Re-exports all domain modules as a single unified client so that all existing
 * callers (`import apiClient from '../config/api'`) continue to work unchanged.
 *
 * Domain modules:
 *   apiTransport  — HTTP transport layer (tokens, session, get/post/put/delete)
 *   authApi       — auth, profile, business-partner, vendor endpoints
 *   productApi    — products, categories, search, upsells, delivery zones
 *   orderApi      — invoices, payments, scheduled orders
 */

import { apiTransport } from './apiTransport';
import { authApi } from './authApi';
import { productApi } from './productApi';
import { orderApi } from './orderApi';
import { vendorApi } from './vendorApi';

// Merge all domain APIs into a single object that preserves every method that
// callers currently access as `apiClient.<method>()`.
const apiClient = {
  // ---- Transport helpers (used directly by some callers) ----
  get baseURL() { return apiTransport.baseURL; },
  get authUrl() { return apiTransport.authUrl; },
  get siteUrl() { return apiTransport.siteUrl; },
  get returnUrl() { return apiTransport.returnUrl; },
  get companyName() { return apiTransport.companyName; },
  get title() { return apiTransport.title; },
  get currency() { return apiTransport.currency; },
  get innbucksInterval() { return apiTransport.innbucksInterval; },
  get pixelId() { return apiTransport.pixelId; },
  get gaMeasurementId() { return apiTransport.gaMeasurementId; },
  get sessionInitialized() { return apiTransport.sessionInitialized; },
  set sessionInitialized(v: boolean) { apiTransport.sessionInitialized = v; },
  get sessionPromise() { return apiTransport.sessionPromise; },
  set sessionPromise(v: Promise<any> | null) { apiTransport.sessionPromise = v; },
  get productCache() { return apiTransport.productCache; },
  set productCache(v: typeof apiTransport.productCache) { apiTransport.productCache = v; },

  getToken: (...args: Parameters<typeof apiTransport.getToken>) => apiTransport.getToken(...args),
  setToken: (...args: Parameters<typeof apiTransport.setToken>) => apiTransport.setToken(...args),
  getAuthUser: (...args: Parameters<typeof apiTransport.getAuthUser>) => apiTransport.getAuthUser(...args),
  saveAuthUser: (...args: Parameters<typeof apiTransport.saveAuthUser>) => apiTransport.saveAuthUser(...args),
  getTokenExpiryFromJwt: (...args: Parameters<typeof apiTransport.getTokenExpiryFromJwt>) => apiTransport.getTokenExpiryFromJwt(...args),
  clearToken: (...args: Parameters<typeof apiTransport.clearToken>) => apiTransport.clearToken(...args),
  isAuthenticated: (...args: Parameters<typeof apiTransport.isAuthenticated>) => apiTransport.isAuthenticated(...args),
  ensureSession: (...args: Parameters<typeof apiTransport.ensureSession>) => apiTransport.ensureSession(...args),
  buildHeaders: (...args: Parameters<typeof apiTransport.buildHeaders>) => apiTransport.buildHeaders(...args),
  handleResponse: (...args: Parameters<typeof apiTransport.handleResponse>) => apiTransport.handleResponse(...args),
  get: (...args: Parameters<typeof apiTransport.get>) => apiTransport.get(...args),
  post: (...args: Parameters<typeof apiTransport.post>) => apiTransport.post(...args),
  put: (...args: Parameters<typeof apiTransport.put>) => apiTransport.put(...args),
  delete: (...args: Parameters<typeof apiTransport.delete>) => apiTransport.delete(...args),

  // ---- Auth API ----
  ...authApi,

  // ---- Product API ----
  ...productApi,

  // ---- Order API ----
  ...orderApi,

  // ---- Vendor API ----
  ...vendorApi,
};

export default apiClient;
