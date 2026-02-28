/**
 * usePageCache – React hook for page-level API caching
 * 
 * Cache hit  → returns instantly from localStorage (ZERO network calls).
 * Cache miss → single network call, globally deduped.
 * After mutation → next fetch per apiKey is forced fresh once.
 * 
 * Auto-invalidation: the axiosInstance response interceptor detects
 * successful mutations (POST/PUT/DELETE/PATCH) and emits cache-invalidation
 * events via the cacheEventBus. This hook subscribes to those events and
 * auto-refetches all registered APIs, bumping `refreshKey` so that
 * consumer components re-render with fresh data.
 * 
 * @file src/cache/usePageCache.js
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import {
  getCachedData,
  setCachedData,
  invalidatePageCache,
  invalidateMultiplePages,
} from './pageCache';
import { onCacheInvalidation, emitCacheInvalidation } from './cacheEventBus';

// ── Module-level dedup map ───────────────────────────────────────────
// Shared across ALL hook instances & React StrictMode double-mounts.
// Prevents the same API from being called twice on remount.
const _inflight = new Map();

export function usePageCache(pageConfig) {
  const { name: pageName, defaultTTL, invalidatesPages = [] } = pageConfig;

  const mutVerRef = useRef(0);
  const apiSeenRef = useRef({});
  const apiRegistryRef = useRef({});
  const isMutatingRef = useRef(false);

  /**
   * Monotonically increasing counter that bumps whenever the page's cache
   * is externally invalidated (e.g. by the axiosInstance interceptor).
   * Add this to your useEffect dependency array so the component
   * re-fetches automatically:
   *
   *   const { fetchWithCache, refreshKey } = usePageCache(PAGE_CACHE.FOO);
   *   useEffect(() => { fetchData(); }, [refreshKey]);
   */
  const [refreshKey, setRefreshKey] = useState(0);

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

      // Keep latest fetch contract so mutate() can auto-refetch and repopulate cache.
      apiRegistryRef.current[apiKey] = {
        apiFn,
        options: { ttl, transform, fallbackToStaleOnError },
      };

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
      const {
        alsoInvalidate = [],
        autoRefetch = true,
        waitForRefetch = false,
        refetchKeys,
      } = options;

      isMutatingRef.current = true;

      try {
        const response = await mutationFn();

        if (response.success) {
          mutVerRef.current += 1;
          invalidatePageCache(pageName);
          if (invalidatesPages.length > 0) invalidateMultiplePages(invalidatesPages);
          if (alsoInvalidate.length > 0) {
            invalidateMultiplePages(alsoInvalidate);
            // Notify hooks on OTHER pages so they auto-refetch too
            emitCacheInvalidation(alsoInvalidate);
          }

          // Clear active requests for this page to avoid stale piggybacking.
          for (const key of _inflight.keys()) {
            if (key.startsWith(`${pageName}::`)) {
              _inflight.delete(key);
            }
          }

          if (autoRefetch) {
            const keys = Array.isArray(refetchKeys) && refetchKeys.length > 0
              ? refetchKeys
              : Object.keys(apiRegistryRef.current);

            const refetchJobs = keys
              .map((apiKey) => {
                const registry = apiRegistryRef.current[apiKey];
                if (!registry?.apiFn) return null;

                return fetchWithCache(apiKey, registry.apiFn, {
                  ...registry.options,
                  forceRefresh: true,
                  fallbackToStaleOnError: false,
                });
              })
              .filter(Boolean);

            if (waitForRefetch) {
              await Promise.allSettled(refetchJobs);
            } else {
              Promise.allSettled(refetchJobs);
            }
          }
        }

        return response;
      } catch (error) {
        return { success: false, data: error.message || 'Mutation failed' };
      } finally {
        isMutatingRef.current = false;
      }
    },
    [pageName, invalidatesPages, fetchWithCache],
  );

  const invalidate = useCallback(() => {
    invalidatePageCache(pageName);
  }, [pageName]);

  // ── External cache invalidation subscription ────────────────────
  // When axiosInstance detects a successful mutation that affects this page,
  // it emits an event via the cacheEventBus. We auto-refetch all registered
  // APIs and bump refreshKey so the consuming component re-renders.
  useEffect(() => {
    let debounceTimer;

    const unsubscribe = onCacheInvalidation(pageName, () => {
      // If this hook's own mutate() is running, it handles everything
      // internally — skip to avoid double-refetch.
      if (isMutatingRef.current) return;

      // Debounce: a single user action may trigger multiple Axios calls
      // (e.g. alert + notification), each emitting an event. Collapse them.
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        // Bump mutation version so fetchWithCache treats cache as stale
        mutVerRef.current += 1;

        // Auto-refetch every API this page has previously registered
        const keys = Object.keys(apiRegistryRef.current);
        if (keys.length > 0) {
          const refetchJobs = keys
            .map((apiKey) => {
              const reg = apiRegistryRef.current[apiKey];
              if (!reg?.apiFn) return null;
              return fetchWithCache(apiKey, reg.apiFn, {
                ...reg.options,
                forceRefresh: true,
                fallbackToStaleOnError: false,
              });
            })
            .filter(Boolean);

          Promise.allSettled(refetchJobs).then(() => {
            // Signal the consuming component that fresh data is available
            setRefreshKey((k) => k + 1);
          });
        } else {
          // No registered APIs yet — just bump so useEffect re-runs
          setRefreshKey((k) => k + 1);
        }
      }, 50);
    });

    return () => {
      clearTimeout(debounceTimer);
      unsubscribe();
    };
  }, [pageName, fetchWithCache]);

  return { fetchWithCache, mutate, invalidate, pageName, refreshKey };
}

export default usePageCache;
