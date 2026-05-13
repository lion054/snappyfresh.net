import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import type { Product } from '../types/models/product';
import { logger } from '../lib/logger';

interface WishlistContextValue {
  wishlist: Product[];
  wishlistModalOpen: boolean;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  openWishlistModal: () => void;
  closeWishlistModal: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export const useWishlist = (): WishlistContextValue => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

const WISHLIST_STORAGE_KEY = 'dokani_wishlist';

const persistWishlist = (items: Product[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  }
};

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [wishlistModalOpen, setWishlistModalOpen] = useState<boolean>(false);
  const suppressPersistRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            suppressPersistRef.current = true;
            setWishlist(parsed);
          }
        }
      } catch (error) {
        logger.error('Error loading wishlist from localStorage:', error);
      }
    }
  }, []);

  // Persist on change
  useEffect(() => {
    if (suppressPersistRef.current) {
      suppressPersistRef.current = false;
      return;
    }
    persistWishlist(wishlist);
  }, [wishlist]);

  // Cross-tab sync via storage event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === WISHLIST_STORAGE_KEY && e.newValue !== null) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            suppressPersistRef.current = true;
            setWishlist(parsed);
          }
        } catch { /* ignore corrupt data */ }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addToWishlist = useCallback((product: Product): void => {
    setWishlist(prev => {
      if (prev.some(item => item.ItemCode === product.ItemCode)) return prev;
      const next = [...prev, product];
      persistWishlist(next);
      return next;
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string): void => {
    setWishlist(prev => {
      const next = prev.filter(item => item.ItemCode !== productId);
      persistWishlist(next);
      return next;
    });
  }, []);

  const clearWishlist = useCallback((): void => {
    setWishlist([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
    }
  }, []);

  const isInWishlist = useCallback((productId: string): boolean => {
    return wishlist.some(item => item.ItemCode === productId);
  }, [wishlist]);

  const openWishlistModal = useCallback((): void => setWishlistModalOpen(true), []);
  const closeWishlistModal = useCallback((): void => setWishlistModalOpen(false), []);

  const value: WishlistContextValue = useMemo(() => ({
    wishlist,
    wishlistModalOpen,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    openWishlistModal,
    closeWishlistModal,
    wishlistCount: wishlist.length,
  }), [wishlist, wishlistModalOpen, addToWishlist, removeFromWishlist, clearWishlist, isInWishlist, openWishlistModal, closeWishlistModal]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
