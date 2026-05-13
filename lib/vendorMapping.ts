/**
 * Vendor mapping based on product code prefix.
 * Extracted from shop-cart.js and shop-checkout.js to eliminate duplication.
 */

const VENDOR_PREFIXES: any = {
  'Yomilk': ['Y0', 'YO', 'YM'],
  'Pardon Dairy': ['PD'],
  'Fresh Farms': ['FF'],
  'Green Valley': ['GV']
};

export const getVendorFromProductCode = (itemCode: any) => {
  if (!itemCode) return 'Yomilk';

  for (const [vendor, prefixList] of Object.entries(VENDOR_PREFIXES)) {
    if ((prefixList as any).some((prefix: any) => itemCode.startsWith(prefix))) {
      return vendor;
    }
  }

  return 'Yomilk';
};
