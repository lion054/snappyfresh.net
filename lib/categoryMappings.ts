/**
 * Super-Category Mappings
 * Maps super-category names (like "DAIRY") to multiple itemsGroupCode values
 * Based on Angular implementation: store.component.ts:200-234
 *
 * This allows filtering by broader categories that contain multiple item group codes
 * Example: DAIRY contains FRESH MILK, YOGURT, CHEESE, CREAM, etc.
 */

export const superCategoryMappings = {
  // DAIRY: Contains all milk, yogurt, cheese, and cream products
  'DAIRY': {
    name: 'DAIRY',
    codes: [
      107,  // YOGHURT PRODUCT
      108,  // YOLAC PRODUCT
      109,  // CHEESE PRODUCT
      111,  // FRESH MILK PRODUCT
      112,  // FRESH CREAM
      121   // LIFE (dairy health products)
    ]
  },

  // BREAD & BAKERY
  'BREAD': {
    name: 'BREAD',
    codes: [118]  // BREAD
  },

  // CHEMICALS & HOMECARE
  'CHEMICALS': {
    name: 'CHEMICALS',
    codes: [123]  // HOMECARE
  },

  // MEAT (currently empty in Angular, but ready for expansion)
  'MEAT': {
    name: 'MEAT',
    codes: []
  },

  // GROCERIES (currently empty in Angular, but ready for expansion)
  'GROCERIES': {
    name: 'GROCERIES',
    codes: []
  }
};

/**
 * Get codes for a super-category
 * @param superCategoryName - Name of the super-category (case-insensitive)
 * @returns Array of itemsGroupCode values, or empty array if not found
 */
export const getCodesForSuperCategory = (superCategoryName: any) => {
  if (!superCategoryName) return [];

  const normalized = String(superCategoryName).toUpperCase().trim();
  const mapping = (superCategoryMappings as any)[normalized];

  return mapping ? mapping.codes : [];
};

/**
 * Check if a category is a super-category
 * @param categoryName - Name to check
 * @returns Boolean indicating if it's a super-category
 */
export const isSuperCategory = (categoryName: any) => {
  if (!categoryName) return false;
  const normalized = String(categoryName).toUpperCase().trim();
  return superCategoryMappings.hasOwnProperty(normalized);
};

/**
 * Filter products by super-category
 * @param products - Array of products to filter
 * @param superCategoryName - Super-category name
 * @returns Filtered array of products matching the super-category
 */
export const filterProductsBySupCategory = (products: any, superCategoryName: any) => {
  if (!Array.isArray(products)) return [];

  const codes = getCodesForSuperCategory(superCategoryName);
  if (codes.length === 0) return products; // Return all if no codes matched

  return products.filter(product =>
    codes.includes(product.itemsGroupCode) || codes.includes(product.ItmsGrpCod)
  );
};

/**
 * Filter products by regular category code
 * @param products - Array of products to filter
 * @param categoryCode - Single itemsGroupCode
 * @returns Filtered array of products
 */
export const filterProductsByCategory = (products: any, categoryCode: any) => {
  if (!Array.isArray(products)) return [];
  if (!categoryCode && categoryCode !== 0) return products;

  // Compare as strings to handle number/string mismatch from API
  const code = String(categoryCode);
  return products.filter((product: any) =>
    String(product.itemsGroupCode ?? '') === code ||
    String(product.ItmsGrpCod ?? '') === code ||
    String(product.ItemsGroupCode ?? '') === code
  );
};

/**
 * Validate super-category codes against actual API categories.
 * Filters out codes that don't exist in the API data and logs warnings.
 * @param apiCategories - Categories from useCategories() hook
 * @returns Validated mappings with only codes present in API
 */
export const validateSuperCategoryMappings = (apiCategories: any) => {
  if (!Array.isArray(apiCategories) || apiCategories.length === 0) {
    return superCategoryMappings;
  }

  const apiCodes = new Set(apiCategories.map((cat: any) => cat.ItmsGrpCod || cat.number));
  const validated: any = {};

  for (const [key, mapping] of Object.entries(superCategoryMappings)) {
    const validCodes = mapping.codes.filter(code => apiCodes.has(code));
    if (validCodes.length !== mapping.codes.length) {
      console.warn(
        `Super-category "${key}": ${mapping.codes.length - validCodes.length} code(s) not found in API categories`
      );
    }
    validated[key] = { ...mapping, codes: validCodes };
  }

  return validated;
};

export default {
  superCategoryMappings,
  getCodesForSuperCategory,
  isSuperCategory,
  filterProductsBySupCategory,
  filterProductsByCategory,
  validateSuperCategoryMappings
};
