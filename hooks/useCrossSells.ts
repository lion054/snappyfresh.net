/**
 * useCrossSells Hook
 * Fetches cross-sell products using a 3-tier fallback:
 * 1. Try API endpoint (StoreItems/CrossSells)
 * 2. Match item codes from u_ONA_CrossSells against cached products
 * 3. Fall back to same-category products
 *
 * Supports two modes:
 * - Single product mode: pass a product object (for product detail page)
 * - Cart mode: pass an array of cart items (for cart page)
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
  u_ONA_CrossSells?: any;
  [key: string]: any;
}

interface CartItem {
  itemCode: string;
  product?: Product;
  [key: string]: any;
}

function parseItemCodes(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);

  const str = String(raw).trim();
  if (!str) return [];

  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // Not JSON
  }

  if (str.includes(',')) return str.split(',').map(s => s.trim()).filter(Boolean);
  if (str.includes(';')) return str.split(';').map(s => s.trim()).filter(Boolean);

  return [str];
}

function getItemCode(product: Product): string {
  return product?.ItemCode || product?.itemCode || '';
}

function getGroupCode(product: Product): number | undefined {
  return product?.ItmsGrpCod ?? product?.ItemsGroupCode ?? product?.itemsGroupCode;
}

/**
 * Fetch cross-sells for a single product
 */
async function fetchCrossSellsForProduct(
  product: Product,
  allProducts: Product[],
  excludeCodes: Set<string>
): Promise<Product[]> {
  const currentCode = getItemCode(product);
  const crossSellData = product?.u_ONA_CrossSells;
  const crossSellCodes = parseItemCodes(crossSellData);

  // Tier 1: Try API endpoint
  if (crossSellCodes.length > 0) {
    try {
      const response = await apiClient.getCrossSells({
        itemCodes: crossSellCodes,
        currency: product?.['currency'] || apiClient.currency,
        warehouseCode: product?.['warehouseCode'] || product?.['WarehouseCode'] || '',
      });

      const products = response?.values || response?.data || response?.message || response;
      if (Array.isArray(products) && products.length > 0) {
        logger.info(`CrossSells: API returned ${products.length} products for ${currentCode}`);
        return products.filter(p => !excludeCodes.has(getItemCode(p).toLowerCase()));
      }
    } catch (err: any) {
      logger.warn(`CrossSells: API call failed for ${currentCode}, trying cache`, err.message);
    }
  }

  // Tier 2: Match against cached products
  if (crossSellCodes.length > 0 && allProducts.length > 0) {
    const codesLower = new Set(crossSellCodes.map(c => c.toLowerCase()));
    const matched = allProducts.filter(p => {
      const code = getItemCode(p).toLowerCase();
      return codesLower.has(code) && !excludeCodes.has(code);
    });

    if (matched.length > 0) {
      logger.info(`CrossSells: Cache matched ${matched.length} products for ${currentCode}`);
      return matched;
    }
  }

  // Tier 3: Same-category fallback, padded with random products to fill 8 slots
  if (allProducts.length > 0) {
    const TARGET = 8;
    const usedCodes = new Set<string>(excludeCodes);
    const results: Product[] = [];

    // First: try same-category products
    const groupCode = getGroupCode(product);
    if (groupCode !== undefined && groupCode !== null) {
      const grouped = allProducts
        .filter(p => {
          const code = getItemCode(p).toLowerCase();
          return getGroupCode(p) == groupCode && !usedCodes.has(code);
        })
        .sort(() => 0.5 - Math.random());

      for (const p of grouped) {
        if (results.length >= TARGET) break;
        const code = getItemCode(p).toLowerCase();
        usedCodes.add(code);
        results.push(p);
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

    return results;
  }

  return [];
}

/**
 * Fetch cross-sells for multiple cart items, deduplicate results
 */
async function fetchCrossSellsForCart(
  cartItems: CartItem[],
  allProducts: Product[],
  excludeCodes: Set<string>
): Promise<Product[]> {
  const seen = new Set<string>();
  const results: Product[] = [];

  // Collect cross-sell codes from all cart items
  const allCrossSellCodes: string[] = [];
  for (const item of cartItems) {
    const product = item.product;
    if (product?.u_ONA_CrossSells) {
      allCrossSellCodes.push(...parseItemCodes(product.u_ONA_CrossSells));
    }
  }

  // Deduplicate codes
  const uniqueCodes = [...new Set(allCrossSellCodes.map(c => c.trim()))].filter(Boolean);

  // Tier 1: Try API with all unique codes
  if (uniqueCodes.length > 0) {
    try {
      const response = await apiClient.getCrossSells({
        itemCodes: uniqueCodes,
        currency: apiClient.currency,
      });

      const products = response?.values || response?.data || response?.message || response;
      if (Array.isArray(products) && products.length > 0) {
        for (const p of products) {
          const code = getItemCode(p).toLowerCase();
          if (!excludeCodes.has(code) && !seen.has(code)) {
            seen.add(code);
            results.push(p);
          }
        }
        if (results.length > 0) {
          logger.info(`CrossSells (cart): API returned ${results.length} products`);
          return results.slice(0, 10);
        }
      }
    } catch (err: any) {
      logger.warn('CrossSells (cart): API call failed, trying cache', err.message);
    }
  }

  // Tier 2: Match codes against cached products
  if (uniqueCodes.length > 0 && allProducts.length > 0) {
    const codesLower = new Set(uniqueCodes.map(c => c.toLowerCase()));
    for (const p of allProducts) {
      const code = getItemCode(p).toLowerCase();
      if (codesLower.has(code) && !excludeCodes.has(code) && !seen.has(code)) {
        seen.add(code);
        results.push(p);
      }
    }
    if (results.length > 0) {
      logger.info(`CrossSells (cart): Cache matched ${results.length} products`);
      return results.slice(0, 10);
    }
  }

  // Tier 3: Category-based fallback, padded with random products to fill 10 slots
  if (allProducts.length > 0) {
    const TARGET = 10;
    const usedCodes = new Set<string>(excludeCodes);
    for (const code of seen) usedCodes.add(code);

    const cartGroupCodes = new Set<number>();
    for (const item of cartItems) {
      const gc = getGroupCode(item.product || {} as Product);
      if (gc !== undefined) cartGroupCodes.add(gc);
    }

    // First: same-category products
    if (cartGroupCodes.size > 0) {
      const sameCategory = allProducts
        .filter(p => {
          const gc = getGroupCode(p);
          const code = getItemCode(p).toLowerCase();
          return gc !== undefined && cartGroupCodes.has(gc) && !usedCodes.has(code);
        })
        .sort(() => 0.5 - Math.random());

      for (const p of sameCategory) {
        if (results.length >= TARGET) break;
        const code = getItemCode(p).toLowerCase();
        usedCodes.add(code);
        results.push(p);
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

    logger.info(`CrossSells (cart): Fallback returned ${results.length} products`);
    return results.slice(0, TARGET);
  }

  return [];
}

/**
 * Hook for single product cross-sells (product detail page)
 */
export function useCrossSells(product: Product | null | undefined) {
  const { products: allProducts, isReady } = useProducts();
  const itemCode = product ? getItemCode(product) : '';

  return useQuery({
    queryKey: queryKeys.crossSells.list(itemCode),
    queryFn: () => {
      const excludeCodes = new Set([itemCode.toLowerCase()]);
      return fetchCrossSellsForProduct(product!, allProducts, excludeCodes);
    },
    enabled: !!product && !!itemCode && isReady,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

/**
 * Hook for cart-based cross-sells (cart page)
 */
export function useCartCrossSells(cartItems: CartItem[]) {
  const { products: allProducts, isReady } = useProducts();

  // Stable key from sorted cart item codes
  const cartKey = cartItems
    .map(i => i.itemCode)
    .sort()
    .join(',');

  return useQuery({
    queryKey: queryKeys.crossSells.list(`cart:${cartKey}`),
    queryFn: () => {
      const excludeCodes = new Set(cartItems.map(i => i.itemCode.toLowerCase()));
      return fetchCrossSellsForCart(cartItems, allProducts, excludeCodes);
    },
    enabled: cartItems.length > 0 && isReady,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
