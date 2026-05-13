/**
 * Custom Hooks - Barrel Export
 *
 * Re-exports all context hooks for convenient importing
 * Usage: import { useAuth, useCart, useProducts } from '../hooks';
 */

import { useProducts } from '../contexts/ProductsContext';
import { useProductFilters } from '../contexts/FiltersContext';

export { useAuth } from '../contexts/AuthContext';
export { useCart } from '../contexts/CartContext';
export { useProducts, usePrefetchProducts, useInvalidateProducts } from '../contexts/ProductsContext';
export { useWishlist } from '../contexts/WishlistContext';
export { useQuickView } from '../contexts/QuickViewContext';
export { useProductFilters } from '../contexts/FiltersContext';
export { useCartDrawer } from '../contexts/CartDrawerContext';
export { useCompare } from '../contexts/CompareContext';
export { useFormValidation } from './useFormValidation';
export { useFocusTrap } from './useFocusTrap';
export { useUpsells } from './useUpsells';
export { useCrossSells, useCartCrossSells } from './useCrossSells';

export const useShop = () => {
  const products = useProducts();
  const filters = useProductFilters();

  return { products, filters };
};
