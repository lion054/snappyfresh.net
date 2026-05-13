import { getProductImageUrl } from './imageProxy';

/**
 * Shared vendor utilities — normalizers and badge helpers used across vendor pages.
 * Eliminates duplicated normalizeItem / statusBadge functions in vendor/*.tsx.
 */

/**
 * Normalize a raw API vendor item into a consistent shape.
 * All pages share the core fields; page-specific fields (costPrice, committed, etc.)
 * are always present so each page can pick what it needs without re-normalizing.
 */
export const normalizeVendorItem = (item: any) => ({
  id: item.itemCode,
  name: item.itemName || item.itemDescription || item.itemCode,
  category: item.itemsGroupCode?.toString() || item.group || '-',
  price: item.price || item.unitPrice || 0,
  costPrice: item.costPrice || item.avgPrice || 0,
  stock: item.quantityOnStock ?? item.onHand ?? 0,
  committed: item.quantityOrderedByCustomers ?? item.isCommited ?? 0,
  maxStock: item.maxInventory || 200,
  uom: item.salesUnit || item.inventoryUOM || 'EA',
  status: (item.quantityOnStock ?? item.onHand ?? 0) <= 0
    ? 'Out of Stock'
    : item.frozenFor === 'tYES'
      ? 'Inactive'
      : 'Active',
  image: getProductImageUrl(item, ''),
  raw: item,
});

/** Map product status string → vp-badge CSS class */
export const vendorStatusBadge = (status: string): string =>
  ({ Active: 'vp-badge-green', Inactive: 'vp-badge-gray', 'Out of Stock': 'vp-badge-red' } as Record<string, string>)[status] ?? 'vp-badge-gray';

/** Map order status string → vp-badge CSS class */
export const orderStatusBadge = (status: string): string =>
  ({ Open: 'vp-badge-orange', Closed: 'vp-badge-green', Cancelled: 'vp-badge-red' } as Record<string, string>)[status] ?? 'vp-badge-gray';

/** Classify a stock quantity into a level bucket */
export const getStockLevel = (stock: number): 'out' | 'low' | 'medium' | 'good' =>
  stock <= 0 ? 'out' : stock <= 10 ? 'low' : stock <= 30 ? 'medium' : 'good';

/** Map stock level → vp-badge CSS class */
export const inventoryBadgeClass = (level: string): string =>
  ({ out: 'vp-badge-red', low: 'vp-badge-orange', medium: 'vp-badge-orange', good: 'vp-badge-green' } as Record<string, string>)[level] ?? '';

/** Map stock level → human-readable label */
export const inventoryBadgeLabel = (level: string): string =>
  ({ out: 'Out of Stock', low: 'Low', medium: 'Medium', good: 'In Stock' } as Record<string, string>)[level] ?? '';

/** Map stock level → CSS color string for progress bars */
export const inventoryBarColor = (level: string): string =>
  ({ out: 'red', low: 'orange', medium: 'orange', good: 'green' } as Record<string, string>)[level] ?? '';
