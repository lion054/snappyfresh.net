import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import apiClient from '../../config/api';
import { SHOWCASE_MODE, MOCK_VENDOR } from '../../lib/mockVendorData';

const VendorAuthContext = createContext<any>(null);

export function VendorAuthProvider({ children }: { children: ReactNode }) {
  const [vendor, setVendor] = useState<any>(
    SHOWCASE_MODE ? buildVendorFromSession(MOCK_VENDOR, '') : null
  );
  const [loading, setLoading] = useState(!SHOWCASE_MODE);

  // On mount, check for existing authenticated session.
  // getAuthUser() strips the token before localStorage storage, so re-attach
  // it from the in-memory cache (warm after SPA navigation) or the cookie fallback.
  useEffect(() => {
    if (SHOWCASE_MODE) return;
    try {
      const authUser = apiClient.getAuthUser();
      const token = apiClient.getToken() || authUser?.token;
      const isVendorSession =
        authUser?.supplier?.cardCode ||
        (authUser?.customer?.cardCode && authUser?.customer?.cardType === 'S');
      if (token && isVendorSession) {
        setVendor(buildVendorFromSession({ ...authUser, token }, ''));
      }
    } catch {}
    setLoading(false);
  }, []);

  const login = useCallback(async (email: any, password: any) => {
    try {
      const result = await (apiClient as any).login(email, password);
      if (!result?.token) {
        return { success: false, error: 'Login failed - no token received' };
      }
      const isVendor = result?.supplier?.cardCode ||
        (result?.customer?.cardCode && (!result.customer.cardType || result.customer.cardType === 'S'));
      if (!isVendor) {
        return { success: false, error: 'This account is not authorized as a vendor' };
      }
      setVendor(buildVendorFromSession(result, email));
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as any)?.message || 'Login failed' };
    }
  }, []);

  const logout = useCallback(() => {
    setVendor(null);
    (apiClient as any).logout?.();
  }, []);

  const forgotPassword = useCallback(async (email: any) => {
    try {
      await (apiClient as any).forgotPassword?.(email);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as any)?.message || 'Failed to send reset email' };
    }
  }, []);

  const resetPassword = useCallback(async (email: any, otp: any, newPassword: any, confirmPassword: any) => {
    try {
      await (apiClient as any).resetPassword?.(email, otp, newPassword, confirmPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as any)?.message || 'Failed to reset password' };
    }
  }, []);

  return (
    <VendorAuthContext.Provider value={{
      vendor,
      isAuthenticated: !!vendor,
      loading,
      login,
      logout,
      forgotPassword,
      resetPassword,
    }}>
      {children}
    </VendorAuthContext.Provider>
  );
}

export function useVendorAuth() {
  const ctx = useContext(VendorAuthContext);
  if (!ctx) throw new Error('useVendorAuth must be used within VendorAuthProvider');
  return ctx;
}

function getInitials(name: any) {
  if (!name) return 'V';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function buildVendorFromSession(authUser: any, fallbackEmail: string) {
  // Vendor sessions use `supplier`; customer portal sessions use `customer`
  const bp = authUser.supplier || authUser.customer || {};
  return {
    name: bp.cardName || bp.u_CardName || 'Vendor',
    email: bp.emailAddress || bp.email || authUser.externalUser?.userCode || fallbackEmail || '',
    phone: bp.phone1 || bp.phone || '',
    cardCode: bp.cardCode || bp.u_CardCode || '',
    initials: getInitials(bp.cardName || bp.u_CardName || 'V'),
    cardType: authUser.supplier ? 'S' : (bp.cardType || ''),
    session: authUser,
  };
}
