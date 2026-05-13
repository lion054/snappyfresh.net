import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { logger } from '../lib/logger';

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  color?: string;
  condition?: string[];
  sizes?: string[];
  tags?: string[];
  vendor?: string[];
  rating?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest';
  inStock?: boolean;
}

interface FiltersContextValue {
  filters: ProductFilters;
  updateFilters: (newFilters: Partial<ProductFilters>) => void;
  updateCategory: (category: string) => void;
  updatePriceRange: (minPrice: number, maxPrice: number) => void;
  updateSortBy: (sortBy: ProductFilters['sortBy']) => void;
  updateRating?: (rating: number) => void;
  clearFilters: () => void;
  clearFilter: (filterKey: keyof ProductFilters) => void;
}

const FiltersContext = createContext<FiltersContextValue | undefined>(undefined);

export const useProductFilters = (): FiltersContextValue => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error('useProductFilters must be used within FiltersProvider');
  }
  return context;
};

interface FiltersProviderProps {
  children: ReactNode;
}

const initialFilters: ProductFilters = {
  category: '',
};

/** Parse URL query params into a ProductFilters object */
const filtersFromQuery = (query: Record<string, string | string[] | undefined>): ProductFilters => {
  const f: ProductFilters = {};
  const cat = query['category'];
  const sort = query['sortBy'];
  const min = query['minPrice'];
  const max = query['maxPrice'];
  const br = query['brand'];
  const stk = query['inStock'];

  if (cat && typeof cat === 'string') f.category = cat;
  if (sort && typeof sort === 'string') f.sortBy = sort as ProductFilters['sortBy'];
  if (min) f.minPrice = Number(min);
  if (max) f.maxPrice = Number(max);
  if (br && typeof br === 'string') f.brand = br;
  if (stk === 'true') f.inStock = true;
  return f;
};

/** Build query params object from filters (only non-empty values) */
const filtersToQuery = (filters: ProductFilters): Record<string, string> => {
  const q: Record<string, string> = {};
  const entries: [string, unknown][] = [
    ['category', filters.category],
    ['sortBy', filters.sortBy],
    ['minPrice', filters.minPrice],
    ['maxPrice', filters.maxPrice],
    ['brand', filters.brand],
    ['inStock', filters.inStock],
  ];
  for (const [key, val] of entries) {
    if (val !== undefined && val !== '' && val !== null) {
      q[key] = String(val);
    }
  }
  return q;
};

export const FiltersProvider = ({ children }: FiltersProviderProps) => {
  const router = useRouter();
  const isInitializedRef = useRef(false);
  const suppressUrlSyncRef = useRef(false);

  // Initialize filters from URL on mount
  const [filters, setFilters] = useState<ProductFilters>(() => {
    if (typeof window === 'undefined') return initialFilters;
    const params = new URLSearchParams(window.location.search);
    const query: Record<string, string> = {};
    params.forEach((v, k) => { query[k] = v; });
    const parsed = filtersFromQuery(query);
    return Object.keys(parsed).length > 0 ? parsed : initialFilters;
  });

  // Sync URL → state when browser back/forward or external query change
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      return;
    }
    if (suppressUrlSyncRef.current) {
      suppressUrlSyncRef.current = false;
      return;
    }
    const parsed = filtersFromQuery(router.query);
    setFilters(prev => {
      const next = Object.keys(parsed).length > 0 ? parsed : initialFilters;
      return JSON.stringify(next) !== JSON.stringify(prev) ? next : prev;
    });
  }, [router.query]);

  // Sync state → URL (shallow push, no page reload)
  const pushFiltersToUrl = useCallback((newFilters: ProductFilters) => {
    // Only push to URL on shop pages
    if (!router.pathname.startsWith('/store')) return;
    suppressUrlSyncRef.current = true;
    const query = filtersToQuery(newFilters);
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  }, [router]);

  const applyFilters = useCallback((next: ProductFilters) => {
    setFilters(next);
    pushFiltersToUrl(next);
  }, [pushFiltersToUrl]);

  const updateFilters = useCallback((newFilters: Partial<ProductFilters>): void => {
    setFilters(prev => {
      const next = { ...prev, ...newFilters };
      pushFiltersToUrl(next);
      return next;
    });
  }, [pushFiltersToUrl]);

  const updateCategory = useCallback((category: string): void => {
    setFilters(prev => {
      const next = { ...prev, category };
      pushFiltersToUrl(next);
      return next;
    });
  }, [pushFiltersToUrl]);

  const updatePriceRange = useCallback((minPrice: number, maxPrice: number): void => {
    setFilters(prev => {
      const next = { ...prev, minPrice, maxPrice };
      pushFiltersToUrl(next);
      return next;
    });
  }, [pushFiltersToUrl]);

  const updateSortBy = useCallback((sortBy: ProductFilters['sortBy']): void => {
    setFilters(prev => {
      const next = { ...prev, sortBy };
      pushFiltersToUrl(next);
      return next;
    });
  }, [pushFiltersToUrl]);

  const clearFilters = useCallback((): void => {
    applyFilters(initialFilters);
    logger.debug('All filters cleared');
  }, [applyFilters]);

  const clearFilter = useCallback((filterKey: keyof ProductFilters): void => {
    setFilters(prev => {
      const { [filterKey]: _, ...rest } = prev;
      const next = rest as ProductFilters;
      pushFiltersToUrl(next);
      return next;
    });
  }, [pushFiltersToUrl]);

  const value: FiltersContextValue = useMemo(() => ({
    filters,
    updateFilters,
    updateCategory,
    updatePriceRange,
    updateSortBy,
    clearFilters,
    clearFilter,
  }), [filters, updateFilters, updateCategory, updatePriceRange, updateSortBy, clearFilters, clearFilter]);

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
};
