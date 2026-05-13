/**
 * Snappy Fresh - Product API
 * Covers store items, categories, search, upsells, cross-sells, and delivery zones.
 */

import { logger } from '../lib/logger';
import { buildSafeSearchFilter } from '../lib/odataHelpers';
import { apiTransport } from './apiTransport';

// ==================== PRODUCT ENDPOINTS ====================

/**
 * Get all store items (products)
 * Based on Angular StoreService.getStoreItems()
 */
async function getProducts(pageSize: any = 100, pageNumber: any = 1, filterExtension: any = '', queryExtension: any = '') {
  const currentDate = new Date();
  const params: any = {
    currency: apiTransport.currency,
    pageSize: pageSize.toString(),
    pageNumber: pageNumber.toString(),
  };
  if (filterExtension) params.filterExtension = filterExtension;
  if (queryExtension) params.queryExtension = queryExtension;

  const isCacheValid = currentDate.getTime() < apiTransport.productCache.expireDateTime.getTime();
  const isSameParams =
    apiTransport.productCache.params?.currency === params.currency &&
    apiTransport.productCache.params?.pageSize === params.pageSize &&
    apiTransport.productCache.params?.pageNumber === params.pageNumber &&
    apiTransport.productCache.params?.filterExtension === params.filterExtension &&
    apiTransport.productCache.params?.queryExtension === params.queryExtension;

  if (isCacheValid && isSameParams && apiTransport.productCache.products) {
    logger.debug('[API] Returning cached products from ApiClient.productCache');
    return apiTransport.productCache.products;
  }

  const response = await apiTransport.get('StoreItems', params);

  const result = {
    data: response.values || [],
    recordCount: response.recordCount || 0,
    pageCount: response.pageCount || 1,
    pageNumber: response.pageNumber || 1,
    message: response.values || [],
  };

  // Update cache for two hours - matches the oldyomik behavior
  apiTransport.productCache.expireDateTime = new Date(currentDate.getTime() + 2 * 60 * 60 * 1000);
  apiTransport.productCache.params = params;
  apiTransport.productCache.products = result;

  return result;
}

/**
 * Get single product by item code (SECURE: Fixed SQL injection)
 */
async function getProduct(itemCode: any) {
  // Sanitize itemCode to prevent SQL injection
  const sanitizedCode = String(itemCode).replace(/['"<>]/g, '');
  const filterExtension = `$filter = ItemCode eq '${sanitizedCode}'`;
  const params = {
    filterExtension: filterExtension
  };

  const response = await apiTransport.get('StoreItems', params);

  // Return first item from values array
  if (response.values && response.values.length > 0) {
    return response.values[0];
  }

  throw new Error('Product not found');
}

/**
 * Search products (SECURE: Uses safe search filter builder)
 */
async function searchProducts(query: any, pageSize: any = 50, pageNumber: any = 1) {
  const queryExtension = buildSafeSearchFilter(query, 'ItemName');
  return await getProducts(pageSize, pageNumber, '', queryExtension);
}

/**
 * Get product categories (Item Groups)
 * Fetches all category names and codes from the backend
 * Based on yomilk-store-master: getItemGroups()
 */
async function getCategories(pageSize: any = 100, pageNumber: any = 1, filterExtension: any = '', queryExtension: any = '') {
  const params = {
    queryExtension: queryExtension,
    pageSize: pageSize.toString(),
    pageNumber: pageNumber.toString(),
    filterExtension: filterExtension
  };

  try {
    logger.debug('[Categories] Fetching from StoreItemGroups', { pageSize, pageNumber });
    const response = await apiTransport.get('StoreItemGroups', params);

    logger.debug('[Categories] Response:', response);
    return response;
  } catch (error: any) {
    logger.error('[Categories] Fetch failed:', error);
    throw error;
  }
}

/**
 * Get upsell products
 */
async function getUpSells(payload: any) {
  return await apiTransport.post('StoreItems/Upsells', payload);
}

/**
 * Get cross-sell products
 */
async function getCrossSells(payload: any) {
  return await apiTransport.post('StoreItems/CrossSells', payload);
}

/**
 * Get delivery zones (public endpoint, may not require auth)
 */
async function getDeliveryZones() {
  try {
    return await apiTransport.get('DeliveryZones/Places');
  } catch (error: any) {
    // 401 is expected on register page (not authenticated yet)
    if (error?.status === 401 || error?.message?.includes('401')) {
      logger.debug('[API] Delivery zones require authentication - skipping');
      return [];
    }
    logger.warn('[API] Failed to fetch delivery zones:', error?.message || error);
    return [];
  }
}

export const productApi = {
  getProducts,
  getProduct,
  searchProducts,
  getCategories,
  getUpSells,
  getCrossSells,
  getDeliveryZones,
};
