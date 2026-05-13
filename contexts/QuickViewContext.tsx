import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import type { Product } from '../types/models/product';
import { logger } from '../lib/logger';

interface QuickViewContextValue {
  quickViewProduct: Product | null;
  isQuickViewOpen: boolean;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
}

const QuickViewContext = createContext<QuickViewContextValue | undefined>(undefined);

export const useQuickView = (): QuickViewContextValue => {
  const context = useContext(QuickViewContext);
  if (!context) {
    throw new Error('useQuickView must be used within QuickViewProvider');
  }
  return context;
};

interface QuickViewProviderProps {
  children: ReactNode;
}

export const QuickViewProvider = ({ children }: QuickViewProviderProps) => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  /**
   * Open quick view modal with a product
   */
  const openQuickView = useCallback((product: Product): void => {
    logger.debug('Opening quick view for product:', product.ItemCode);
    setQuickViewProduct(product);
  }, []);

  /**
   * Close quick view modal
   */
  const closeQuickView = useCallback((): void => {
    logger.debug('Closing quick view');
    setQuickViewProduct(null);
  }, []);

  const value = useMemo<QuickViewContextValue>(() => ({
    quickViewProduct,
    isQuickViewOpen: quickViewProduct !== null,
    openQuickView,
    closeQuickView,
  }), [quickViewProduct, openQuickView, closeQuickView]);

  return <QuickViewContext.Provider value={value}>{children}</QuickViewContext.Provider>;
};
