import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '../config/api';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import type { AuthContextValue } from '../types/contexts/auth';
import type { UserSession, RegisterPayload, BusinessPartner } from '../types/models/user';
import type { ApiResponse } from '../types/api/responses';
import { logger } from '../lib/logger';
import { queryKeys } from '../lib/queryClient';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Session check interval: 2 minutes
const SESSION_CHECK_INTERVAL = 2 * 60 * 1000;

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [businessPartners, setBusinessPartners] = useState<BusinessPartner[]>([]);
  const [loadingBusinessPartners, setLoadingBusinessPartners] = useState<boolean>(false);
  const [switchingProfile, setSwitchingProfile] = useState<boolean>(false);
  const router = useRouter();
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const logoutFlagRef = useRef<boolean>(false);
  const sessionWarningShownRef = useRef<boolean>(false);
  const userRef = useRef<UserSession | null>(null);

  /**
   * Check if token has expired
   */
  const isTokenExpired = useCallback((tokenExpiry?: string): boolean => {
    if (!tokenExpiry) return false;

    try {
      const expiryDate = new Date(tokenExpiry);
      const now = new Date();
      return expiryDate <= now;
    } catch (error) {
      logger.error('Error parsing token expiry:', error);
      return false;
    }
  }, []);

  /**
   * Check if token is approaching expiry (within 15 minutes)
   */
  const isTokenNearExpiry = useCallback((tokenExpiry?: string): boolean => {
    if (!tokenExpiry) return false;
    try {
      const expiryDate = new Date(tokenExpiry);
      const now = new Date();
      const fifteenMinutes = 15 * 60 * 1000;
      return expiryDate.getTime() - now.getTime() <= fifteenMinutes && expiryDate > now;
    } catch {
      return false;
    }
  }, []);

  /**
   * Initialize guest session if no user is logged in.
   * Aborts if a login happened while we were waiting.
   */
  const initializeGuestSession = useCallback(async (): Promise<void> => {
    try {
      logger.info('Initializing guest session');
      await apiClient.ensureSession();

      // Don't overwrite state if a real login happened while we were awaiting
      if (logoutFlagRef.current) {
        return;
      }

      const guestUser = apiClient.getAuthUser();
      if (guestUser) {
        setUser(guestUser);
        logger.info('Guest session initialized');
      }
    } catch (error) {
      logger.error('Failed to initialize guest session:', error);
    }
  }, []);

  /**
   * Handle token expiration - logout and notify user
   */
  const handleTokenExpired = useCallback((): void => {
    logger.info('Token expired - logging out');
    apiClient.clearToken();
    setUser(null);

    // Only show toast if user was actually logged in (not a guest)
    const wasAuthenticated = userRef.current && !userRef.current.customer?.isVisitor;
    if (wasAuthenticated) {
      toast.warning('Your session has expired. Please log in again.');
      router.push('/login');
    } else {
      // If guest session expired, silently re-initialize
      initializeGuestSession();
    }
  }, [router, initializeGuestSession]);

  /**
   * Check session validity
   */
  const checkSession = useCallback((): void => {
    const authUser = apiClient.getAuthUser();

    if (!authUser) {
      // No session at all - initialize guest session
      if (!loading) {
        initializeGuestSession();
      }
      return;
    }

    // Check if token has expired
    if (authUser.tokenExpiry && isTokenExpired(authUser.tokenExpiry)) {
      handleTokenExpired();
      return;
    }

    // Warn if session is near expiry (authenticated users only)
    if (
      authUser.tokenExpiry &&
      !authUser.customer?.isVisitor &&
      isTokenNearExpiry(authUser.tokenExpiry) &&
      !sessionWarningShownRef.current
    ) {
      sessionWarningShownRef.current = true;
      toast.warning(
        'Your session will expire soon. Please save your work and log in again to continue.',
        { autoClose: false, toastId: 'session-expiry-warning' }
      );
    }

    // Update user state if key fields changed (avoids costly JSON.stringify on every tick)
    const changed =
      authUser.token !== userRef.current?.token ||
      authUser.customer?.cardCode !== userRef.current?.customer?.cardCode ||
      authUser.tokenExpiry !== userRef.current?.tokenExpiry;
    if (changed) {
      setUser(authUser);
    }
  }, [loading, isTokenExpired, isTokenNearExpiry, handleTokenExpired, initializeGuestSession]);

  /**
   * Initialize session on mount
   */
  useEffect(() => {
    const initializeSession = async () => {
      logger.info('Initializing auth session');
      setLoading(true);

      try {
        // Check if we have an existing user session
        const authUser = apiClient.getAuthUser();

        if (authUser) {
          // Check if token is expired
          if (authUser.tokenExpiry && isTokenExpired(authUser.tokenExpiry)) {
            logger.info('Existing token expired');
            handleTokenExpired();
          } else {
            // Valid session exists
            setUser(authUser);
            logger.info('Existing session loaded:', {
              type: authUser.customer?.isVisitor ? 'guest' : 'authenticated',
              user: authUser.userName
            });

            // Notify cart to load the correct storage key for this user.
            // Without this, a full page reload would leave the cart reading
            // from the guest key even though the user is authenticated.
            if (authUser.customer?.cardCode) {
              window.dispatchEvent(new CustomEvent('auth:userChanged', {
                detail: { cardCode: authUser.customer.cardCode }
              }));
            }
          }
        } else {
          // No session - initialize guest session
          await initializeGuestSession();
        }
      } catch (error) {
        logger.error('Error initializing session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  /**
   * Keep userRef in sync with user state (for checkSession callback)
   */
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  /**
   * Fetch business partners when an authenticated user session is available.
   * Covers both fresh login and returning to the site with a stored session.
   */
  useEffect(() => {
    if (loading || !user || user.customer?.isVisitor) return;
    // Only fetch if we don't already have them (login flow sets them directly)
    if (businessPartners.length > 0) return;

    let cancelled = false;
    (async () => {
      try {
        setLoadingBusinessPartners(true);
        const partners = await (apiClient as any).getUserBusinessPartners();
        if (!cancelled) {
          setBusinessPartners(partners || []);
          logger.info(`Loaded ${partners?.length || 0} business partners (auto-fetch)`);
        }
      } catch (error: any) {
        if (!cancelled) {
          logger.error('Error auto-fetching business partners:', error);
          setBusinessPartners([]);
          if (error.status === 401 || error.status === 403) {
            handleProfileFetchError();
          }
        }
      } finally {
        if (!cancelled) setLoadingBusinessPartners(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?.customer?.cardCode]);

  /**
   * Set up periodic session checking
   */
  useEffect(() => {
    // Only check sessions when not loading
    if (loading) return;

    // Clear any existing interval
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
    }

    // Set up periodic check
    sessionCheckInterval.current = setInterval(() => {
      logger.debug('Periodic session check');
      checkSession();
    }, SESSION_CHECK_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
    };
  }, [loading, checkSession]);

  const login = async (email: string, password: string): Promise<ApiResponse<UserSession>> => {
    try {
      // Cancel any pending guest session init from a recent logout
      logoutFlagRef.current = false;
      sessionWarningShownRef.current = false;

      const response = await apiClient.login(email, password);
      setUser(response);
      logger.info('User logged in successfully:', response.userName);
      toast.success(`Welcome back, ${response.userName}!`);

      // Notify cart to switch storage key for this user
      window.dispatchEvent(new CustomEvent('auth:userChanged', {
        detail: { cardCode: response.customer?.cardCode }
      }));

      // Fetch business partners after successful login
      if (!response.customer?.isVisitor) {
        try {
          const partners = await (apiClient as any).getUserBusinessPartners();
          setBusinessPartners(partners || []);
          logger.info(`Loaded ${partners?.length || 0} business partners`);
        } catch (error) {
          logger.error('Error fetching business partners after login:', error);
        }
      }

      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      logger.error('Login failed:', errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData: RegisterPayload): Promise<ApiResponse<any>> => {
    const MAX_RETRIES = 2;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await apiClient.registerCompleteCustomer(userData);
        logger.info('Register endpoint responded:', response);

        if (response?.accountCreated) {
          return { success: true, data: response };
        }

        const message =
          response?.message ||
          response?.error ||
          response?.Message ||
          'Registration failed - account not created';

        logger.warn('Register endpoint did not create account:', message);

        const normalized = String(message).toLowerCase();
        if (normalized.includes('already exists') || normalized.includes('duplicate')) {
          return { success: false, error: message, errorCode: 'DUPLICATE_ACCOUNT' };
        }
        return { success: false, error: message, errorCode: 'UNKNOWN' };
      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'Registration failed';
        const statusCode = error?.status || error?.statusCode;
        logger.error(`Registration attempt ${attempt + 1} failed:`, errorMessage);

        // Early no-retry for duplicate email/phone errors
        const normalizedError = String(errorMessage).toLowerCase();
        if (normalizedError.includes('already exists') || normalizedError.includes('duplicate')) {
          return { success: false, error: errorMessage, errorCode: 'DUPLICATE_ACCOUNT' };
        }

        // Don't retry on client errors (400-level) - these are validation failures
        if (statusCode && statusCode >= 400 && statusCode < 500) {
          // Extract detailed error from API response
          const detailedError = error?.fullResponse?.message
            || error?.fullResponse?.Message
            || error?.fullResponse?.error
            || error?.response?.data?.message
            || error?.response?.data?.Message
            || errorMessage;
          logger.error('Client error response:', { statusCode, detailedError });
          return { success: false, error: detailedError, errorCode: 'VALIDATION_ERROR' };
        }

        // Retry on server errors (500-level) or network failures
        if (attempt < MAX_RETRIES) {
          logger.info(`Retrying registration in ${(attempt + 1) * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000));
          continue;
        }

        return { success: false, error: errorMessage, errorCode: 'NETWORK_OR_SERVER' };
      }
    }

    return { success: false, error: 'Registration failed after multiple attempts. Please try again.' };
  };

  const logout = (): void => {
    logger.info('User logging out');

    // Clear authentication
    apiClient.clearToken();
    setUser(null);
    setBusinessPartners([]);

    // Switch cart back to guest key
    window.dispatchEvent(new CustomEvent('auth:userChanged', { detail: { cardCode: undefined } }));

    // Show success message
    toast.info('You have been logged out successfully');

    // Redirect to home or login
    router.push('/');

    // Initialize guest session after logout — guarded by flag so a
    // concurrent login() can't be overwritten by the delayed guest init.
    logoutFlagRef.current = true;
    initializeGuestSession().finally(() => {
      logoutFlagRef.current = false;
    });
  };

  /**
   * Handle profile fetch failure - logout user and redirect to login
   * Called when profile details cannot be loaded (expired session, invalid token, etc.)
   */
  const handleProfileFetchError = useCallback((): void => {
    logger.warn('Profile fetch failed - logging out user');

    // Clear authentication
    apiClient.clearToken();
    setUser(null);
    setBusinessPartners([]);

    // Show error message and redirect to login
    toast.error('Your session has expired or profile could not be loaded. Please log in again.');
    router.push('/login');
  }, [router]);

  const forgotPassword = async (email: string): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.forgotPassword(email);
      logger.info('Password reset OTP sent');
      toast.success('Password reset code sent to your email');
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      logger.error('Forgot password failed:', errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.resetPassword(email, otp, newPassword, confirmPassword);
      logger.info('Password reset successful');
      toast.success('Password reset successful! Please log in with your new password.');
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      logger.error('Password reset failed:', errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Fetch business partners the user has access to
   */
  const refreshBusinessPartners = useCallback(async (): Promise<void> => {
    // Only fetch for authenticated users (not guests)
    if (!user || user.customer?.isVisitor) {
      setBusinessPartners([]);
      return;
    }

    try {
      setLoadingBusinessPartners(true);
      const partners = await (apiClient as any).getUserBusinessPartners();
      setBusinessPartners(partners || []);
      logger.info(`Loaded ${partners?.length || 0} business partners`);
    } catch (error: any) {
      logger.error('Error fetching business partners:', error);
      setBusinessPartners([]);

      // Check if this is an authentication error - if so, logout and redirect
      if (error.status === 401 || error.status === 403 || (error.message && (error.message.includes('unauthorized') || error.message.includes('expired') || error.message.includes('invalid')))) {
        logger.warn('Business partner fetch failed due to auth error - logging out user');
        handleProfileFetchError();
      }
    } finally {
      setLoadingBusinessPartners(false);
    }
  }, [user, handleProfileFetchError]);

  /**
   * Switch to a different business partner profile
   */
  const switchProfile = useCallback(async (cardCode: string): Promise<ApiResponse<UserSession>> => {
    if (switchingProfile) {
      return { success: false, error: 'Profile switch already in progress', message: 'Profile switch already in progress' };
    }

    try {
      setSwitchingProfile(true);
      logger.info(`Switching to business partner: ${cardCode}`);

      // Do NOT clear the token before switching — the switch endpoint
      // needs the current Bearer token for authorization.  It returns a
      // new token which switchBusinessPartner() saves automatically.
      const newSession = await (apiClient as any).switchBusinessPartner(cardCode);

      // Update user state with new session
      setUser(newSession);

      // Notify cart to switch storage key for new profile
      window.dispatchEvent(new CustomEvent('auth:userChanged', {
        detail: { cardCode: newSession.customer?.cardCode }
      }));

      // Invalidate ALL cached data — prices, products, everything
      // This forces a fresh fetch with the new account's pricing
      queryClient.removeQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });

      // Also clear the apiTransport product cache (in-memory)
      try {
        (apiClient as any).productCache = {
          products: null,
          expireDateTime: new Date(0),
          params: null,
        };
      } catch { /* ignore if structure differs */ }

      // Refresh business partners using the new session
      try {
        setLoadingBusinessPartners(true);
        const partners = await (apiClient as any).getUserBusinessPartners();
        setBusinessPartners(partners || []);
      } catch (bpError) {
        logger.error('Error refreshing business partners after switch:', bpError);
      } finally {
        setLoadingBusinessPartners(false);
      }

      toast.success(`Switched to ${newSession.customer?.cardName || 'new profile'}`);

      return { success: true, data: newSession, message: 'Profile switched successfully' };
    } catch (error: any) {
      logger.error('Error switching profile:', error);

      const errorMessage = error.message || 'Failed to switch profile';
      const status = error.status || error.statusCode;

      // Check if this is a permission/access denied error (user exists but no access)
      if (status === 403 || errorMessage.includes('do not have access')) {
        // Don't logout, just show error - user is still authenticated, just can't access this partner
        toast.error(errorMessage || 'You do not have access to this account');
        return { success: false, error: errorMessage, message: errorMessage };
      }

      // Check if this is a session expiration error
      if (status === 401 || errorMessage.includes('expired')) {
        handleProfileFetchError();
        return { success: false, error: 'Your session has expired. Please log in again.', message: 'Your session has expired. Please log in again.' };
      }

      // Other errors
      toast.error(errorMessage);
      return { success: false, error: errorMessage, message: errorMessage };
    } finally {
      setSwitchingProfile(false);
    }
  }, [switchingProfile, handleProfileFetchError]);

  const isAuthenticated = (): boolean => {
    return !!user && !user.customer?.isVisitor;
  };

  const isVisitor = (): boolean => {
    return user?.customer?.isVisitor === true;
  };

  // Memoize context value to prevent unnecessary re-renders
  // Recompute when user, loading, or business partners change
  const value: AuthContextValue = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    isAuthenticated: isAuthenticated(),
    isVisitor: isVisitor(),
    businessPartners,
    loadingBusinessPartners,
    switchingProfile,
    switchProfile,
    refreshBusinessPartners,
    handleProfileFetchError,
  }), [user, loading, businessPartners, loadingBusinessPartners, switchingProfile, switchProfile, refreshBusinessPartners, handleProfileFetchError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
