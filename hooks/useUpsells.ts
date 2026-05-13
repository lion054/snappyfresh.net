/**
 * useUpsells Hook
 * Fetches upsell products for a given product using a 3-tier fallback:
 * 1. Try API endpoint (StoreItems/Upsells)
 * 2. Match item codes from u_ONA_Upsells against cached products
 * 3. Fall back to same-category products
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import apiClient from '../config/api';
import { useProducts } from '../contexts/ProductsContext';
import { logger } from '../lib/logger';

interface Product {
  ItemCode?: string;
  itemCode?: string;
  ItmsGrpCod?: number;
  ItemsGroupCode?: number;
  itemsGroupCode?: number;
  u_ONA_Upsells?: any;
  [key: string]: any;
}

/**
 * Parse the u_ONA_Upsells field into an array of item codes.
 * The field format is unknown, so we handle multiple possibilities:
 * - Comma-separated string: "Y0-001,Y0-002,Y0-003"
 * - JSON array: ["Y0-001","Y0-002"]
 * - Semicolon-separated: "Y0-001;Y0-002"
 * - Single item code: "Y0-001"
 */
function parseItemCodes(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);

  const str = String(raw).trim();
  if (!str) return [];

  // Try JSON parse first
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // Not JSON, continue
  }

  // Try comma-separated
  if (str.includes(',')) return str.split(',').map(s => s.trim()).filter(Boolean);

  // Try semicolon-separated
  if (str.includes(';')) return str.split(';').map(s => s.trim()).filter(Boolean);

  // Single value
  return [str];
}

function getItemCode(product: Product): string {
  return product?.ItemCode || product?.itemCode || '';
}

function getGroupCode(product: Product): number | undefined {
  return product?.ItmsGrpCod ?? product?.ItemsGroupCode ?? product?.itemsGroupCode;
}

async function fetchUpsells(
  product: Product,
  allProducts: Product[]
): Promise<Product[]> {
  const currentCode = getItemCode(product);
  const upsellData = product?.u_ONA_Upsells;
  const upsellCodes = parseItemCodes(upsellData);

  // Tier 1: Try API endpoint if we have upsell data
  if (upsellCodes.length > 0) {
    try {
      const response = await apiClient.getUpSells({
        itemCodes: upsellCodes,
        currency: product?.['currency'] || apiClient.currency,
        warehouseCode: product?.['warehouseCode'] || product?.['WarehouseCode'] || '',
      });

      const products = response?.values || response?.data || response?.message || response;
      if (Array.isArray(products) && products.length > 0) {
        logger.info(`Upsells: API returned ${products.length} products for ${currentCode}`);
        return products;
      }
    } catch (err: any) {
      logger.warn(`Upsells: API call failed for ${currentCode}, trying cache fallback`, err.message);
    }
  }

  // Tier 2: Match item codes against cached products
  if (upsellCodes.length > 0 && allProducts.length > 0) {
    const codesLower = new Set(upsellCodes.map(c => c.toLowerCase()));
    const matched = allProducts.filter(p => {
      const code = getItemCode(p).toLowerCase();
      return codesLower.has(code) && code !== currentCode.toLowerCase();
    });

    if (matched.length > 0) {
      logger.info(`Upsells: Cache matched ${matched.length} products for ${currentCode}`);
      return matched;
    }
  }

  // Tier 3: Same-category fallback, padded with random products to fill 8 slots
  if (allProducts.length > 0) {
    const TARGET = 8;
    const currentLower = currentCode.toLowerCase();
    const usedCodes = new Set<string>([currentLower]);
    const results: Product[] = [];

    // First: try same-category products
    const groupCode = getGroupCode(product);
    if (groupCode !== undefined && groupCode !== null) {
      const grouped = allProducts
        .filter(p => {
          const code = getItemCode(p).toLowerCase();
          return getGroupCode(p) == groupCode && code !== currentLower;
        })
        .sort(() => 0.5 - Math.random());

      for (const p of grouped) {
        if (results.length >= TARGET) break;
        const code = getItemCode(p).toLowerCase();
        if (!usedCodes.has(code)) {
          usedCodes.add(code);
          results.push(p);
        }
      }
    }

    // Pad with random products from full catalog if not enough
    if (results.length < TARGET) {
      const remaining = allProducts
        .filter(p => !usedCodes.has(getItemCode(p).toLowerCase()))
        .sort(() => 0.5 - Math.random());

      for (const p of remaining) {
        if (results.length >= TARGET) break;
        results.push(p);
      }
    }

    logger.info(`Upsells: Fallback returned ${results.length} products for ${currentCode}`);
    return results;
  }

  return [];
}

export function useUpsells(product: Product | null | undefined) {
  const { products: allProducts, isReady } = useProducts();
  const itemCode = product ? getItemCode(product) : '';

  return useQuery({
    queryKey: queryKeys.upsells.list(itemCode),
    queryFn: () => fetchUpsells(product!, allProducts),
    enabled: !!product && !!itemCode && isReady,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
