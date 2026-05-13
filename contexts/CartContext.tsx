import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef, ReactNode } from 'react';
import type { CartContextValue } from '../types/contexts/cart';
import type { CartItem } from '../types/models/cart';
import type { Product, UoM } from '../types/models/product';
import { logger } from '../lib/logger';

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

// Validate cart item structure
const isValidCartItem = (item: any): item is CartItem => {
  return (
    item &&
    typeof item.itemCode === 'string' &&
    typeof item.itemName === 'string' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0 &&
    item.uom &&
    typeof item.uom.price === 'number'
  );
};

/**
 * Build the localStorage key for the current user's cart.
 * Guest/visitor carts use 'cart', authenticated users use 'cart_{cardCode}'.
 */
const getCartKey = (cardCode?: string): string => {
  return cardCode ? `cart_${cardCode}` : 'cart';
};

/**
 * Read the current auth state from localStorage to determine the correct
 * initial cart key.  This avoids the race where CartProvider mounts before
 * AuthProvider dispatches `auth:userChanged`, which would leave the cart
 * reading from the guest key even though the user is authenticated.
 */
const getInitialCartKey = (): string => {
  if (typeof window === 'undefined') return 'cart';
  try {
    const raw = localStorage.getItem('auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      const cardCode = parsed?.customer?.cardCode || parsed?.cardCode;
      if (cardCode) return `cart_${cardCode}`;
    }
  } catch {
    // corrupt data — fall through to guest key
  }
  return 'cart';
};

/**
 * Write cart to localStorage synchronously (called inside state updaters
 * to avoid the race where a separate useEffect reads stale state).
 */
const persistCart = (items: CartItem[], key: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(items));
  }
};

const loadCart = (key: string): CartItem[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(key);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter(isValidCartItem) : [];
  } catch {
    logger.error('Error loading cart from localStorage');
    return [];
  }
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const cartKeyRef = useRef<string>(getInitialCartKey());
  // Initialize cart directly from localStorage — avoids the empty [] → persist race
  const [cart, setCart] = useState<CartItem[]>(() => loadCart(cartKeyRef.current));
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  // Flag to skip persisting when we're loading from storage/switch events
  const suppressPersistRef = useRef(false);
  // Track whether initial mount has completed
  const mountedRef = useRef(false);

  // Persist cart to localStorage whenever it changes (skip first render)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (suppressPersistRef.current) {
      suppressPersistRef.current = false;
      return;
    }
    persistCart(cart, cartKeyRef.current);
  }, [cart]);

  // Cross-tab sync via storage event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === cartKeyRef.current && e.newValue !== null) {
        try {
          const parsed = JSON.parse(e.newValue);
          const valid = Array.isArray(parsed) ? parsed.filter(isValidCartItem) : [];
          suppressPersistRef.current = true;
          setCart(valid);
        } catch {
          // ignore corrupt data from other tab
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Switch cart storage when user identity changes (login/logout/profile switch)
  useEffect(() => {
    const handleUserChanged = (e: Event) => {
      const cardCode = (e as CustomEvent).detail?.cardCode;
      const newKey = getCartKey(cardCode);
      if (newKey === cartKeyRef.current) return;

      const oldKey = cartKeyRef.current;
      const oldItems = loadCart(oldKey);
      cartKeyRef.current = newKey;
      const newItems = loadCart(newKey);

      // Logging out (switching from authenticated to guest key):
      // Clear the authenticated cart from localStorage and start fresh
      if (newKey === 'cart' && oldKey !== 'cart') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(oldKey);
        }
        suppressPersistRef.current = true;
        setCart([]);
        return;
      }

      // Migrate guest cart to authenticated cart when logging in
      // (guest key is 'cart', authenticated key is 'cart_{cardCode}')
      if (oldKey === 'cart' && oldItems.length > 0 && newItems.length === 0) {
        persistCart(oldItems, newKey);
        suppressPersistRef.current = true;
        setCart(oldItems);
        // Clear guest cart so items aren't duplicated on logout
        if (typeof window !== 'undefined') {
          localStorage.removeItem(oldKey);
        }
      } else {
        suppressPersistRef.current = true;
        setCart(newItems);
      }
    };
    window.addEventListener('auth:userChanged', handleUserChanged);
    return () => window.removeEventListener('auth:userChanged', handleUserChanged);
  }, []);

  // Calculate totals
  const calculatedTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.uom?.price || 0) * item.quantity, 0);
  }, [cart]);

  const calculatedItemCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  const addToCart = useCallback((product: Product, uom: UoM): void => {
    if (!product || !uom) {
      logger.error('Invalid product or UOM provided to addToCart');
      return;
    }

    const availableStock = uom.inStock ?? product.UnitsOnStock ?? Infinity;

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.itemCode === product.ItemCode && item.uom?.uomEntry === uom.uomEntry
      );

      let next: CartItem[];
      if (existingIndex > -1) {
        const existingItem = prevCart[existingIndex]!;
        const currentQty = existingItem.quantity;
        if (availableStock !== Infinity && currentQty >= availableStock) {
          window.dispatchEvent(new CustomEvent('cart:stockWarning', {
            detail: { itemName: product.ItemName, available: availableStock }
          }));
          return prevCart;
        }
        next = prevCart.map((item, i) =>
          i === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        const newItem: CartItem = {
          itemCode: product.ItemCode,
          itemName: product.ItemName,
          itemsGroupCode: product.ItmsGrpCod,
          salesVATGroup: product.VatGourpSa,
          salesVATRate: product.VatRate || 0,
          warehouseCode: product.DfltWH,
          quantity: 1,
          uom,
          product,
        };

        if (!isValidCartItem(newItem)) {
          logger.error('Invalid cart item structure');
          return prevCart;
        }
        next = [...prevCart, newItem];
      }
      persistCart(next, cartKeyRef.current);
      return next;
    });

    // FAB bounce animation provides visual feedback instead of toast
  }, []);

  const removeFromCart = useCallback((index: number): void => {
    setCart(prevCart => {
      const next = prevCart.filter((_, i) => i !== index);
      persistCart(next, cartKeyRef.current);
      return next;
    });
  }, []);

  const incrementItem = useCallback((index: number): void => {
    setCart(prevCart => {
      const item = prevCart[index];
      if (!item) return prevCart;

      const availableStock = item.uom?.inStock ?? item.product?.UnitsOnStock ?? Infinity;
      if (availableStock !== Infinity && item.quantity >= availableStock) {
        window.dispatchEvent(new CustomEvent('cart:stockWarning', {
          detail: { itemName: item.itemName, available: availableStock }
        }));
        return prevCart;
      }

      const next = prevCart.map((it, i) =>
        i === index ? { ...it, quantity: it.quantity + 1 } : it
      );
      persistCart(next, cartKeyRef.current);
      return next;
    });
  }, []);

  const decrementItem = useCallback((index: number): void => {
    setCart(prevCart => {
      const item = prevCart[index];
      if (!item) return prevCart;
      const next = item.quantity > 1
        ? prevCart.map((it, i) => i === index ? { ...it, quantity: it.quantity - 1 } : it)
        : prevCart.filter((_, i) => i !== index);
      persistCart(next, cartKeyRef.current);
      return next;
    });
  }, []);

  const updateQuantity = useCallback((index: number, quantity: number): void => {
    if (quantity < 1) {
      setCart(prevCart => {
        const next = prevCart.filter((_, i) => i !== index);
        persistCart(next, cartKeyRef.current);
        return next;
      });
      return;
    }
    setCart(prevCart => {
      const next = prevCart.map((item, i) =>
        i === index ? { ...item, quantity } : item
      );
      persistCart(next, cartKeyRef.current);
      return next;
    });
  }, []);

  const clearCart = useCallback((): void => {
    setCart([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(cartKeyRef.current);
    }
  }, []);

  /**
   * Switch cart storage key when user identity changes.
   * Called from AuthContext on login/logout/profile switch.
   */
  const switchCartUser = useCallback((cardCode?: string): void => {
    const newKey = getCartKey(cardCode);
    if (newKey === cartKeyRef.current) return;
    cartKeyRef.current = newKey;
    const items = loadCart(newKey);
    suppressPersistRef.current = true;
    setCart(items);
  }, []);

  const openCart = useCallback((): void => {
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback((): void => {
    setIsCartOpen(false);
  }, []);

  // Aliases for increment/decrement
  const increaseQuantity = incrementItem;
  const decreaseQuantity = decrementItem;

  const value: CartContextValue = useMemo(() => ({
    cart,
    cartTotal: calculatedTotal,
    cartItemCount: calculatedItemCount,
    isCartOpen,
    openCart,
    closeCart,
    addToCart,
    removeFromCart,
    incrementItem,
    decrementItem,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    clearCart,
    switchCartUser,
  }), [cart, calculatedTotal, calculatedItemCount, isCartOpen, openCart, closeCart, addToCart, removeFromCart, incrementItem, decrementItem, increaseQuantity, decreaseQuantity, updateQuantity, clearCart, switchCartUser]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
