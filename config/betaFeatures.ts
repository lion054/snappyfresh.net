/**
 * Beta Features Configuration
 * Experimental optimizations that can be toggled for testing
 */

const BETA_FEATURES = {
  // Speed optimizations (beta)
  AGGRESSIVE_CACHING: process.env['NEXT_PUBLIC_BETA_AGGRESSIVE_CACHE'] === 'true',
  LAZY_IMAGE_LOADING: process.env['NEXT_PUBLIC_BETA_LAZY_IMAGES'] === 'true',
  CODE_SPLITTING: process.env['NEXT_PUBLIC_BETA_CODE_SPLIT'] === 'true',

  // All beta speed features enabled by default in production
  SPEED_BETA_ENABLED: process.env['NODE_ENV'] === 'production',
};

// Extended cache times for aggressive caching beta
export const BETA_CACHE_CONFIG = BETA_FEATURES.AGGRESSIVE_CACHING ? {
  stable: { staleTime: 60 * 60 * 1000, gcTime: 2 * 60 * 60 * 1000 },      // 1hr / 2hr
  frequent: { staleTime: 30 * 60 * 1000, gcTime: 60 * 60 * 1000 },        // 30min / 1hr
  realtime: { staleTime: 5 * 60 * 1000, gcTime: 15 * 60 * 1000 },         // 5min / 15min
  search: { staleTime: 10 * 60 * 1000, gcTime: 30 * 60 * 1000 }           // 10min / 30min
} : null;

export default BETA_FEATURES;
