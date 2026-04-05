/**
 * Page-Level Cache System
 * 
 * Stores API responses in localStorage grouped by page.
 * Each page has its own cache namespace with individual API entries.
 * 
 * Storage format:
 *   Key:   "cache::<pageName>"
 *   Value: JSON { 
 *     _meta: { createdAt, version },
 *     <apiKey>: { data, timestamp, ttl }
 *   }
 * 
 * @file src/cache/pageCache.js
 */

const CACHE_ENABLED = true; // Enable localStorage caching
const CACHE_PREFIX = 'cache::';
const CACHE_VERSION = 1;
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default
const MAX_CACHE_SIZE = 4 * 1024 * 1024; // 4MB safety limit for localStorage

// ── Helpers ──────────────────────────────────────────────────────────

function buildKey(pageName) {
  return `${CACHE_PREFIX}${pageName}`;
}

function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getPageBucket(pageName) {
  const raw = localStorage.getItem(buildKey(pageName));
  if (!raw) return null;
  const bucket = safeJsonParse(raw);
  if (!bucket || bucket._meta?.version !== CACHE_VERSION) {
    // Incompatible version → purge
    localStorage.removeItem(buildKey(pageName));
    return null;
  }
  return bucket;
}

function savePageBucket(pageName, bucket) {
  try {
    const serialized = JSON.stringify(bucket);
    // Guard against blowing localStorage quota
    if (serialized.length > MAX_CACHE_SIZE) {
      console.warn(`[PageCache] Bucket "${pageName}" exceeds size limit, skipping save.`);
      return false;
    }
    localStorage.setItem(buildKey(pageName), serialized);
    return true;
  } catch (err) {
    // localStorage full – evict oldest cache buckets and retry once
    console.warn('[PageCache] localStorage write failed, evicting old caches...', err);
    evictOldest();
    try {
      localStorage.setItem(buildKey(pageName), JSON.stringify(bucket));
      return true;
    } catch {
      return false;
    }
  }
}

function createEmptyBucket() {
  return {
    _meta: { createdAt: Date.now(), version: CACHE_VERSION },
  };
}

/** Remove the oldest cache bucket to free space */
function evictOldest() {
  let oldest = null;
  let oldestKey = null;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(CACHE_PREFIX)) continue;
    const bucket = safeJsonParse(localStorage.getItem(key));
    const created = bucket?._meta?.createdAt || 0;
    if (!oldest || created < oldest) {
      oldest = created;
      oldestKey = key;
    }
  }

  if (oldestKey) {
    localStorage.removeItem(oldestKey);
  }
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * Get a cached API response for a specific page + api combination.
 * Returns null if not found or expired.
 * 
 * @param {string} pageName  - Page identifier (e.g. 'patients', 'adminManagement')
 * @param {string} apiKey    - Unique key for the API call within the page (e.g. 'getPatients', 'getUsers')
 * @returns {{ data: any, timestamp: number } | null}
 */
export function getCachedData(pageName, apiKey) {
  if (!CACHE_ENABLED) return null;
  const bucket = getPageBucket(pageName);
  if (!bucket) return null;

  const entry = bucket[apiKey];
  if (!entry) return null;

  const { data, timestamp, ttl = DEFAULT_TTL } = entry;
  const age = Date.now() - timestamp;

  if (age > ttl) {
    // Expired → clean up this entry
    delete bucket[apiKey];
    savePageBucket(pageName, bucket);
    return null;
  }

  return { data, timestamp };
}

/**
 * Store an API response in the page's cache bucket.
 * 
 * @param {string} pageName  - Page identifier
 * @param {string} apiKey    - Unique key for the API call
 * @param {any}    data      - The API response data to cache
 * @param {number} [ttl]     - Time-to-live in ms (defaults to DEFAULT_TTL)
 */
export function setCachedData(pageName, apiKey, data, ttl = DEFAULT_TTL) {
  if (!CACHE_ENABLED) return;
  let bucket = getPageBucket(pageName) || createEmptyBucket();
  bucket[apiKey] = { data, timestamp: Date.now(), ttl };
  savePageBucket(pageName, bucket);
}

/**
 * Invalidate (clear) all cached data for a specific page.
 * Call this after any mutation (create/update/delete) on that page.
 * 
 * @param {string} pageName - Page identifier to invalidate
 */
export function invalidatePageCache(pageName) {
  localStorage.removeItem(buildKey(pageName));
}

/**
 * Invalidate a single API entry within a page's cache.
 * 
 * @param {string} pageName - Page identifier
 * @param {string} apiKey   - API key to remove
 */
export function invalidateCacheEntry(pageName, apiKey) {
  const bucket = getPageBucket(pageName);
  if (!bucket) return;
  delete bucket[apiKey];
  savePageBucket(pageName, bucket);
}

/**
 * Invalidate caches for multiple pages at once.
 * Useful when a mutation affects data shown on several pages.
 * 
 * @param {string[]} pageNames - Array of page names to invalidate
 */
export function invalidateMultiplePages(pageNames) {
  pageNames.forEach(invalidatePageCache);
}

/**
 * Clear ALL page caches. Called on logout.
 */
export function clearAllCaches() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

/**
 * Get cache stats for debugging.
 * @returns {{ totalPages: number, totalEntries: number, totalSizeKB: number }}
 */
export function getCacheStats() {
  let totalPages = 0;
  let totalEntries = 0;
  let totalSize = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(CACHE_PREFIX)) continue;
    totalPages++;
    const raw = localStorage.getItem(key);
    totalSize += raw?.length || 0;
    const bucket = safeJsonParse(raw);
    if (bucket) {
      totalEntries += Object.keys(bucket).filter((k) => k !== '_meta').length;
    }
  }

  return {
    totalPages,
    totalEntries,
    totalSizeKB: Math.round(totalSize / 1024),
  };
}

export { DEFAULT_TTL, CACHE_PREFIX };
