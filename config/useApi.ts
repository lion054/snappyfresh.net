/**
 * Snappy Fresh - React Hook for API
 * Custom hook for using the API in React components
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from './api';

/**
 * Hook for making API calls with loading and error states
 * @param {Function} apiFunction - The API function to call
 * @param {boolean} immediate - Whether to call the function immediately
 * @returns {Object} { data, loading, error, execute }
 */
export function useApi(apiFunction: any, immediate: boolean = false) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args: any[]) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, loading, error, execute };
}

/**
 * Hook for fetching products
 */
export function useProducts(immediate: boolean = true) {
  return useApi(() => apiClient.getProducts(), immediate);
}

/**
 * Hook for fetching a single product
 */
export function useProduct(itemCode: any) {
  return useApi(() => apiClient.getProduct(itemCode), !!itemCode);
}

/**
 * Hook for fetching categories
 */
export function useCategories(immediate: boolean = true) {
  return useApi(() => apiClient.getCategories(), immediate);
}

/**
 * Hook for fetching user orders
 */
export function useOrders(immediate: boolean = true) {
  return useApi(() => apiClient.getUserOrders(), immediate);
}

/**
 * Hook for fetching shops
 */
export function useShops(immediate: boolean = true) {
  return useApi(() => (apiClient as any).getShops(), immediate);
}

/**
 * Hook for fetching vendors
 */
export function useVendors(immediate: boolean = true) {
  return useApi(() => (apiClient as any).getVendors(), immediate);
}

/**
 * Hook for authentication
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          const profile = await apiClient.getProfile();
          setUser(profile);
        } catch (err: any) {
          setError(err.message);
          apiClient.clearToken();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: any, password: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.login(email, password);
      setUser(response.user || response);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  const register = async (userData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.register(userData);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: apiClient.isAuthenticated(),
    login,
    logout,
    register,
  };
}

export default apiClient;
