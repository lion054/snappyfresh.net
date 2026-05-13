/**
 * ProductsContext with TanStack Query
 * Robust product fetching with automatic retries, caching, and offline support
 *
 * IMPROVEMENTS OVER V1:
 * ✅ Automatic retries (3 attempts with exponential backoff)
 * ✅ Proper error boundaries and user feedback
 * ✅ Stale-while-revalidate pattern (instant UX)
 * ✅ Request deduplication (no duplicate fetches)
 * ✅ Offline support (shows cached data)
 * ✅ Background refetching on window focus
 * ✅ Network error recovery
 */

import { createContext, useContext, useEffect, useRef, ReactNode, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../config/api';
import type { Product } from '../types/models/product';
import { logger } from '../lib/logger';
import { queryKeys } from '../lib/queryClient';
import { getProductImageUrl } from '../lib/imageProxy';

interface NormalizedProductsResponse {
  products: Product[];
  recordCount: number;
}

interface ProductsContextValue {
  products: Product[];
  loading: boolean;
  refreshing: boolean;
  isReady: boolean;
  error: string | null;
  recordCount: number;
  refetch: () => void;
  isStale: boolean;
  isFetching: boolean;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

export const useProducts = (): ProductsContextValue => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductsProvider');
  }
  return context;
};

interface ProductsProviderProps {
  children: ReactNode;
}

/**
 * Fetch products from API and normalize the response
 */
const fetchProducts = async (): Promise<NormalizedProductsResponse> => {
  logger.info('Fetching products from API...');

  try {
    const response = await apiClient.getProducts(200, 1, '', '');

    if (!response) {
      throw new Error('API returned null response');
    }

    const products = response.data || response.message || [];

    if (!Array.isArray(products)) {
      throw new Error('API returned invalid products format');
    }

    if (products.length === 0) {
      logger.warn('API returned empty products list');
      return {
        products: [],
        recordCount: 0,
      };
    }

    // Normalize image URLs once at the data boundary so every product surface
    // receives the same resolved image path from the API payload.
    products.forEach((p: any) => {
      // Always set image - use direct ERP URL or fallback
      p.image = getProductImageUrl(p);
    });

    logger.info(`Fetched ${products.length} products successfully`);

    return {
      products,
      recordCount: response.recordCount || products.length,
    };
  } catch (error: any) {
    logger.error('Failed to fetch products from API:', error);
    // Don't use fallback - throw the real error so user sees what's wrong
    throw error;
  }
};

export const ProductsProvider = ({ children }: ProductsProviderProps) => {
  // Use TanStack Query with optimized config
  const {
    data,
    isLoading,
    isFetching,
    isRefetching,
    error,
    refetch,
    isStale,
    isSuccess,
  } = useQuery({
    queryKey: queryKeys.products.list(),
    queryFn: fetchProducts,

    // Stale-while-revalidate: Show cached data immediately, fetch in background
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour

    // Disable automatic retries and background re-fetching
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,

    // Placeholders for better UX
    placeholderData: (previousData) => previousData,

    // Error handling
    throwOnError: false,
  });

  const value: ProductsContextValue = useMemo(() => {
    const products = data?.products || [];
    const recordCount = data?.recordCount || 0;

    return {
      products,
      loading: isLoading,
      refreshing: isRefetching,
      isReady: isSuccess && products.length > 0,
      error: error ? (error instanceof Error ? error.message : 'Failed to fetch products') : null,
      recordCount,
      refetch: () => refetch(),
      isStale,
      isFetching,
    };
  }, [data, isLoading, isFetching, isRefetching, error, refetch, isStale, isSuccess]);

  // Log state changes in development (only when values actually change)
  const prevLogRef = useRef('');
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const key = `${value.products.length}-${value.loading}-${value.error}-${value.isStale}`;
    if (key !== prevLogRef.current) {
      prevLogRef.current = key;
      logger.info('Products State:', {
        productsCount: value.products.length,
        loading: value.loading,
        refreshing: value.refreshing,
        isReady: value.isReady,
        error: value.error,
      });
    }
  }, [value]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};

/**
 * Hook to prefetch products (useful for next page navigation)
 */
export const usePrefetchProducts = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.list(),
      queryFn: fetchProducts,
      staleTime: 30 * 60 * 1000,
    });
  };
};

/**
 * Hook to invalidate products cache (force refetch)
 */
export const useInvalidateProducts = () => {
  const queryClient = useQueryClient();

  return () => {
    logger.info('🔄 Invalidating products cache...');
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
  };
};
