import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import type { Product } from '../types/models/product';
import { logger } from '../lib/logger';

interface CompareContextValue {
  compareList: Product[];
  compareModalOpen: boolean;
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  openCompareModal: () => void;
  closeCompareModal: () => void;
  compareCount: number;
}

const CompareContext = createContext<CompareContextValue | undefined>(undefined);

export const useCompare = (): CompareContextValue => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider');
  }
  return context;
};

interface CompareProviderProps {
  children: ReactNode;
}

const COMPARE_STORAGE_KEY = 'dokani_compare';
const MAX_COMPARE_ITEMS = 4;

const persistCompare = (items: Product[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(items));
  }
};

export const CompareProvider = ({ children }: CompareProviderProps) => {
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState<boolean>(false);
  const suppressPersistRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(COMPARE_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            suppressPersistRef.current = true;
            setCompareList(parsed);
          }
        }
      } catch (error) {
        logger.error('Error loading compare list from localStorage:', error);
      }
    }
  }, []);

  // Persist on change
  useEffect(() => {
    if (suppressPersistRef.current) {
      suppressPersistRef.current = false;
      return;
    }
    persistCompare(compareList);
  }, [compareList]);

  // Cross-tab sync via storage event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === COMPARE_STORAGE_KEY && e.newValue !== null) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            suppressPersistRef.current = true;
            setCompareList(parsed);
          }
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addToCompare = useCallback((product: Product): void => {
    setCompareList(prev => {
      if (prev.some(item => item.ItemCode === product.ItemCode)) {
        return prev;
      }
      if (prev.length >= MAX_COMPARE_ITEMS) {
        toast.warning(`Maximum ${MAX_COMPARE_ITEMS} items allowed in compare list`);
        return prev;
      }
      const next = [...prev, product];
      persistCompare(next);
      return next;
    });
  }, []);

  const removeFromCompare = useCallback((productId: string): void => {
    setCompareList(prev => {
      const next = prev.filter(item => item.ItemCode !== productId);
      persistCompare(next);
      return next;
    });
  }, []);

  const clearCompare = useCallback((): void => {
    setCompareList([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(COMPARE_STORAGE_KEY);
    }
  }, []);

  const isInCompare = useCallback((productId: string): boolean => {
    return compareList.some(item => item.ItemCode === productId);
  }, [compareList]);

  const openCompareModal = useCallback((): void => setCompareModalOpen(true), []);
  const closeCompareModal = useCallback((): void => setCompareModalOpen(false), []);

  const value: CompareContextValue = useMemo(() => ({
    compareList,
    compareModalOpen,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    openCompareModal,
    closeCompareModal,
    compareCount: compareList.length,
  }), [compareList, compareModalOpen, addToCompare, removeFromCompare, clearCompare, isInCompare, openCompareModal, closeCompareModal]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};
