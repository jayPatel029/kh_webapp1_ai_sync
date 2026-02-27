/**
 * Cache barrel export
 * @file src/cache/index.js
 */

export { 
  getCachedData,
  setCachedData,
  invalidatePageCache,
  invalidateCacheEntry,
  invalidateMultiplePages,
  clearAllCaches,
  getCacheStats,
} from './pageCache';

export { usePageCache } from './usePageCache';

export { PAGE_CACHE, TTL } from './cacheConfig';
