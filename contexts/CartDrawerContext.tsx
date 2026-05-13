import { createContext, useContext, useState, useCallback, useMemo, ReactNode, FC } from 'react';

interface CartDrawerContextType {
  isOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
}

const CartDrawerContext = createContext<CartDrawerContextType | undefined>(undefined);

export const useCartDrawer = (): CartDrawerContextType => {
  const context = useContext(CartDrawerContext);
  if (!context) {
    throw new Error('useCartDrawer must be used within CartDrawerProvider');
  }
  return context;
};

interface CartDrawerProviderProps {
  children: ReactNode;
}

export const CartDrawerProvider: FC<CartDrawerProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openCartDrawer = useCallback((): void => setIsOpen(true), []);
  const closeCartDrawer = useCallback((): void => setIsOpen(false), []);
  const toggleCartDrawer = useCallback((): void => setIsOpen(prev => !prev), []);

  const value = useMemo<CartDrawerContextType>(() => ({
    isOpen,
    openCartDrawer,
    closeCartDrawer,
    toggleCartDrawer,
  }), [isOpen, openCartDrawer, closeCartDrawer, toggleCartDrawer]);

  return (
    <CartDrawerContext.Provider value={value}>
      {children}
    </CartDrawerContext.Provider>
  );
};
