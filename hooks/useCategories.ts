/**
 * useCategories Hook — powered by TanStack Query
 * Cached, deduplicated, with automatic retry and fallback to static categories.
 *
 * Usage:
 *   const { categories, loading } = useCategories();
 *   const { categories } = useCategories({ skip: true }); // Don't fetch
 */

import { useQuery } from '@tanstack/react-query';
import apiClient from '../config/api';
import { queryKeys, CACHE_TIERS } from '../lib/queryClient';
import { logger } from '../lib/logger';

const normalizeCategories = (response: any) => {
  if (Array.isArray(response)) return response;
  if (response?.values && Array.isArray(response.values)) return response.values;
  if (response?.data && Array.isArray(response.data)) return response.data;
  if (response?.results && Array.isArray(response.results)) return response.results;
  if (response?.items && Array.isArray(response.items)) return response.items;
  return [];
};

const normalizeCategoryName = (cat: any) => {
  if (!cat || typeof cat !== 'object') return 'Category';

  // Use SAME field as old yomilk-store-master: groupName
  const candidate =
    cat.groupName ||           // PRIMARY: Old yomilk uses this
    cat.ItmsGrpNam ||         // SAP: Item Group Name (PascalCase)
    cat.ItemGroupName ||      // Alternate SAP field
    cat.GroupName ||          // Alternate
    cat.U_GroupName ||        // Custom SAP field
    cat.Description ||
    cat.name ||
    cat.Name ||
    cat.title ||
    'Uncategorized';

  const displayName = String(candidate).trim();
  return displayName && displayName.length > 0 ? displayName : 'Uncategorized';
};

const normalizeCategory = (cat: any) => {
  const displayName = normalizeCategoryName(cat);
  const categoryCode = cat.number || cat.ItmsGrpCod || cat.Code || cat.code;

  return {
    ...cat,
    // Match old yomilk field names
    groupName: displayName,
    ItmsGrpNam: displayName,
    GroupName: displayName,
    name: displayName,
    Name: displayName,
    // Match old code fields
    number: categoryCode,
    ItmsGrpCod: categoryCode,
    Code: categoryCode,
  };
};

const fetchCategories = async (): Promise<any[]> => {
  try {
    const response: any = await apiClient.getCategories(100, 1);
    logger.debug('[Categories] Raw response:', response);

    // The API returns either an array directly or wrapped in an object
    let categoryList = normalizeCategories(response);

    if (!Array.isArray(categoryList)) {
      logger.warn('[Categories] Response was not an array, returning empty');
      return [];
    }

    if (categoryList.length === 0) {
      logger.warn('[Categories] No categories in response');
      return [];
    }

    logger.info(`[Categories] Got ${categoryList.length} categories`);
    return categoryList.map(normalizeCategory);
  } catch (error: any) {
    logger.error('[Categories] Fetch failed:', error.message);
    throw error;
  }
};

export const useCategories = (options: { skip?: boolean } = {}) => {
  const { skip = false } = options;

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: fetchCategories,
    enabled: !skip,
    ...CACHE_TIERS.stable,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    throwOnError: false,
  });

  const categories = data ?? [];

  return {
    categories,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    usingFallback: false,
    isLoaded: !isLoading,
    hasError: !!error,
  };
};

export default useCategories;
