import { useQuery, keepPreviousData } from '@tanstack/react-query';
import apiClient from '../config/api';
import { queryKeys } from '../lib/queryClient';

interface UseProductSearchOptions {
  search?: string;
  pageSize?: number;
  pageNumber?: number;
  enabled?: boolean;
}

export const useProductSearch = ({
  search = '',
  pageSize = 50,
  pageNumber = 1,
  enabled = true,
}: UseProductSearchOptions) => {
  return useQuery({
    queryKey: [...queryKeys.products.lists(), 'search', { search, pageSize, pageNumber }],
    queryFn: async () => {
      const response = await apiClient.searchProducts(search.trim(), pageSize, pageNumber);
      const products = response.data || response.message || [];
      return { ...response, data: Array.isArray(products) ? products : [] };
    },
    enabled: enabled && !!search.trim() && search.trim().length >= 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};
