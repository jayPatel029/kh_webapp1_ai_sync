/**
 * usePageCache – React hook for page-level API caching
 * 
 * Cache hit  → returns instantly from localStorage (ZERO network calls).
 * Cache miss → single network call, globally deduped.
 * After mutation → next fetch per apiKey is forced fresh once.
 * 
 * @file src/cache/usePageCache.js
 */

import { useCallback, useRef } from 'react';
import {
  getCachedData,
  setCachedData,
  invalidatePageCache,
  invalidateMultiplePages,
} from './pageCache';

// ── Module-level dedup map ───────────────────────────────────────────
// Shared across ALL hook instances & React StrictMode double-mounts.
// Prevents the same API from being called twice on remount.
const _inflight = new Map();

export function usePageCache(pageConfig) {
  const { name: pageName, defaultTTL, invalidatesPages = [] } = pageConfig;

  const mutVerRef = useRef(0);
  const apiSeenRef = useRef({});

  /**
   * Fetch with cache.
   * Cache hit → zero network. Cache miss → one deduped call.
   */
  const fetchWithCache = useCallback(
    async (apiKey, apiFn, options = {}) => {
      const {
        ttl = defaultTTL,
        forceRefresh = false,
        transform,
        fallbackToStaleOnError = true,
      } = options;

      const needsMutRefresh = mutVerRef.current > (apiSeenRef.current[apiKey] || 0);
      const skipCache = forceRefresh || needsMutRefresh;

      // 1. Return from cache if fresh
      if (!skipCache) {
        const cached = getCachedData(pageName, apiKey);
        if (cached) {
          return { success: true, data: cached.data, fromCache: true };
        }
      }

      // 2. Dedup: piggyback on existing in-flight request
      const flightKey = `${pageName}::${apiKey}`;
      if (_inflight.has(flightKey)) {
        return _inflight.get(flightKey);
      }

      // 3. Network fetch
      const promise = (async () => {
        try {
          const response = await apiFn();

          if (response.success) {
            const data = transform ? transform(response.data) : response.data;
            setCachedData(pageName, apiKey, data, ttl);
            apiSeenRef.current[apiKey] = mutVerRef.current;
            return { success: true, data, fromCache: false };
          }

          return { success: false, data: response.data, fromCache: false };
        } catch (error) {
          if (fallbackToStaleOnError) {
            const stale = getCachedData(pageName, apiKey);
            if (stale) return { success: true, data: stale.data, fromCache: true };
          }
          return { success: false, data: error.message || 'Request failed', fromCache: false };
        } finally {
          _inflight.delete(flightKey);
        }
      })();

      _inflight.set(flightKey, promise);
      return promise;
    },
    [pageName, defaultTTL],
  );

  /**
   * Mutation wrapper – auto-invalidates caches on success.
   */
  const mutate = useCallback(
    async (mutationFn, options = {}) => {
      const { alsoInvalidate = [] } = options;

      try {
        const response = await mutationFn();

        if (response.success) {
          mutVerRef.current += 1;
          invalidatePageCache(pageName);
          if (invalidatesPages.length > 0) invalidateMultiplePages(invalidatesPages);
          if (alsoInvalidate.length > 0) invalidateMultiplePages(alsoInvalidate);
        }

        return response;
      } catch (error) {
        return { success: false, data: error.message || 'Mutation failed' };
      }
    },
    [pageName, invalidatesPages],
  );

  const invalidate = useCallback(() => {
    invalidatePageCache(pageName);
  }, [pageName]);

  return { fetchWithCache, mutate, invalidate, pageName };
}

export default usePageCache;
