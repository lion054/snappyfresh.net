const CACHE_KEY = 'yomilk_products_cache';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes — catalog of ~93 items changes infrequently

interface ProductCacheData {
  products: any[];
  recordCount: number;
  pageCount: number;
  timestamp: number;
}

export const productCache = {
  set(data: { products: any[]; recordCount: number; pageCount: number }): void {
    if (typeof window === 'undefined') return;
    try {
      const cacheData: ProductCacheData = {
        ...data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      // localStorage full or unavailable
    }
  },

  get(): ProductCacheData | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const data: ProductCacheData = JSON.parse(raw);
      if (!data.products || !Array.isArray(data.products)) return null;
      return data;
    } catch {
      return null;
    }
  },

  isStale(): boolean {
    const data = this.get();
    if (!data) return true;
    return Date.now() - data.timestamp > CACHE_TTL_MS;
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CACHE_KEY);
  },
};
