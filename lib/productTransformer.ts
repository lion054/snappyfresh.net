/**
 * Product Transformer Utility
 * Normalizes product data to ensure SAP PascalCase field names
 * Handles products from API that might have inconsistent field naming
 */

/**
 * Known display name corrections for SAP/ERP labels.
 * Keys are lowercase versions of the misspelled/raw text.
 */
const DISPLAY_NAME_CORRECTIONS: any = {
  'dirct to market': 'Direct to Market',
  'direct to marke': 'Direct to Market',
  'direct to market': 'Direct to Market',
  'dirrect to market': 'Direct to Market',
  'direct to markt': 'Direct to Market',
  'driect to market': 'Direct to Market',
};

/**
 * Force image URLs to HTTPS.
 */
import { getProductImageUrl, proxifyImageUrl } from './imageProxy';

const fixImageUrl = (url: any) => {
  if (typeof url === 'string') {
    return proxifyImageUrl(url);
  }
  return url;
};

/**
 * Normalize display text from SAP/ERP.
 * Fixes known misspellings and converts ALL CAPS to Title Case.
 * @param {string} text - Raw text from API
 * @returns {string} Corrected display text
 */
export const normalizeDisplayText = (text: any) => {
  if (!text) return '';
  const lower = text.toLowerCase().trim();

  // Check for known corrections first
  if (DISPLAY_NAME_CORRECTIONS[lower]) {
    return DISPLAY_NAME_CORRECTIONS[lower];
  }

  // Convert ALL CAPS or all lowercase to Title Case
  if (text === text.toUpperCase() || text === text.toLowerCase()) {
    return text
      .toLowerCase()
      .split(' ')
      .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return text;
};

/**
 * Transform product to ensure it has the required SAP field names
 * @param {Object} rawProduct - Product from API or component
 * @returns {Object} Product with normalized field names
 */
export const normalizeProductForCart = (rawProduct: any) => {
  if (!rawProduct) return null;

  const normalizedImage = getProductImageUrl(rawProduct, '');

  // Create a normalized product that has BOTH camelCase and PascalCase fields
  // This ensures compatibility with both the API and CartContext
  return {
    ...rawProduct,

    // SAP PascalCase fields (required by CartContext)
    ItemCode: rawProduct.ItemCode || rawProduct.itemCode || rawProduct.id,
    ItemName: rawProduct.ItemName || rawProduct.itemName || rawProduct.title || rawProduct.name,
    ItmsGrpCod: rawProduct.ItmsGrpCod || rawProduct.itmsGrpCod || rawProduct.itemsGroupCode || 0,
    ItemsGroupName: rawProduct.ItemsGroupName || rawProduct.itemsGroupName || rawProduct.brand,
    VatGourpSa: rawProduct.VatGourpSa || rawProduct.vatGourpSa || rawProduct.salesVATGroup || 'S1',
    VatRate: rawProduct.VatRate || rawProduct.vatRate || rawProduct.salesVATRate || 0,
    DfltWH: rawProduct.DfltWH || rawProduct.dfltWH || rawProduct.warehouseCode || '01',
    UnitsOnStock: rawProduct.UnitsOnStock || rawProduct.unitsOnStock || rawProduct.stock || 0,
    PicturName: normalizedImage || fixImageUrl(rawProduct.PicturName || rawProduct.picturName || rawProduct.image || rawProduct.pictures?.[0]),
    image: normalizedImage || fixImageUrl(rawProduct.image || rawProduct.PicturName || rawProduct.picturName || rawProduct.pictures?.[0]),

    // Ensure price fields exist
    price: rawProduct.price || rawProduct.storeUnitPrice || 0,
    currency: rawProduct.currency || 'USD',

    // UOM fields
    defaultSalesUoMEntry: rawProduct.defaultSalesUoMEntry || null,
    defaultSalesUoMName: rawProduct.defaultSalesUoMName || 'Item',
    uoMs: rawProduct.uoMs || rawProduct.uoms || [],

    // Fallback lowercase versions for display components
    itemCode: rawProduct.ItemCode || rawProduct.itemCode || rawProduct.id,
    itemName: rawProduct.ItemName || rawProduct.itemName || rawProduct.title || rawProduct.name,
  };
};

/**
 * Validate that a product has the minimum required fields for cart
 * @param {Object} product - Product to validate
 * @returns {boolean} True if product is valid
 */
export const isValidProduct = (product: any) => {
  return !!(
    product &&
    (product.ItemCode || product.itemCode || product.id) &&
    (product.ItemName || product.itemName || product.title || product.name)
  );
};

/**
 * Create a default UOM for a product if it doesn't have any
 * @param {Object} product - Product data
 * @returns {Object} UOM object
 */
export const createDefaultUOM = (product: any) => {
  return {
    uomEntry: product.defaultSalesUoMEntry || null,
    uomName: product.defaultSalesUoMName || "Item",
    price: product.price || 0,
    inStock: product.UnitsOnStock || product.unitsOnStock || product.stock || 0,
    inventoryQuantityFactor: 1,
    currency: product.currency || "USD",
    isPricingUOM: true,
    isInventoryOM: false,
    uomQuantity: 1
  };
};
