/**
 * TanStack Query Configuration
 * Centralized query client with optimized defaults for product fetching
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Cache configuration tiers for different data types
 * Organize by frequency of change, not by feature
 */
export const CACHE_TIERS = {
  // Stable: Product catalogs, categories (change infrequently)
  stable: {
    staleTime: 30 * 60 * 1000,  // 30 minutes
    gcTime: 60 * 60 * 1000,      // 1 hour
  },
  // Frequent: Recommendations, upsells (change moderately)
  frequent: {
    staleTime: 10 * 60 * 1000,   // 10 minutes
    gcTime: 30 * 60 * 1000,      // 30 minutes
  },
  // Realtime: Cart, user data (change constantly)
  realtime: {
    staleTime: 1 * 60 * 1000,    // 1 minute
    gcTime: 5 * 60 * 1000,       // 5 minutes
  },
  // Search: Query results (change per search, short retention)
  search: {
    staleTime: 5 * 60 * 1000,    // 5 minutes
    gcTime: 15 * 60 * 1000,      // 15 minutes
  },
};

/**
 * Factory function to create a new QueryClient instance
 * This ensures each component gets its own client and prevents HMR issues
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default to frequent tier (middle ground)
        staleTime: CACHE_TIERS.frequent.staleTime,
        gcTime: CACHE_TIERS.frequent.gcTime,

        // Disable automatic query retries to prevent repeated request loops
        retry: false,

        // Disable background refetching behaviors to avoid unexpected reloads
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,

        // Don't refetch on mount if data is fresh
        refetchOnMount: false,

        // Network mode: Continue showing cached data while offline
        networkMode: 'online',
      },
      mutations: {
        // Disable mutation retries to prevent repeated operations
        retry: false,
      },
    },
  });
}

/**
 * Query Keys - Centralized for consistency
 */
export const queryKeys = {
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.categories.lists(), filters] as const,
  },
  cart: {
    all: ['cart'] as const,
    current: () => [...queryKeys.cart.all, 'current'] as const,
  },
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },
  upsells: {
    all: ['upsells'] as const,
    list: (itemCode: string) => [...queryKeys.upsells.all, itemCode] as const,
  },
  crossSells: {
    all: ['crossSells'] as const,
    list: (itemCode: string) => [...queryKeys.crossSells.all, itemCode] as const,
  },
};
