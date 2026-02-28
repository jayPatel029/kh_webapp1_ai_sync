/**
 * Cache Event Bus
 *
 * Lightweight pub/sub for cross-component cache invalidation signaling.
 * When axiosInstance detects a successful mutation (POST/PUT/DELETE/PATCH),
 * it invalidates the relevant page caches and emits an event here.
 * Active usePageCache hooks subscribe to their page name and auto-refetch.
 *
 * @file src/cache/cacheEventBus.js
 */

// pageName → Set<callback>
const _listeners = new Map();

/**
 * Subscribe to cache invalidation events for a specific page.
 *
 * @param {string} pageName - The page cache name (e.g. 'language', 'patients')
 * @param {Function} callback - Called (no args) when the page's cache is
 *   invalidated externally (i.e. by the axiosInstance interceptor).
 * @returns {Function} Unsubscribe function — call in useEffect cleanup.
 */
export function onCacheInvalidation(pageName, callback) {
  if (!_listeners.has(pageName)) {
    _listeners.set(pageName, new Set());
  }
  _listeners.get(pageName).add(callback);

  return () => {
    _listeners.get(pageName)?.delete(callback);
    if (_listeners.get(pageName)?.size === 0) {
      _listeners.delete(pageName);
    }
  };
}

/**
 * Emit cache invalidation for one or more pages.
 * Called by the axiosInstance response interceptor after a successful mutation.
 *
 * @param {string[]} pageNames - Page cache names to notify
 */
export function emitCacheInvalidation(pageNames) {
  for (const name of pageNames) {
    const cbs = _listeners.get(name);
    if (cbs) {
      for (const cb of cbs) {
        try {
          cb();
        } catch (e) {
          console.warn('[CacheEventBus] listener error:', e);
        }
      }
    }
  }
}
