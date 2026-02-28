import axios from 'axios';
import { server_url } from '../../constants/constants';
import { normalizeAxiosError } from '../errors/ApiError';
import { reportError } from '../errors/reportError';
import { clearAllCaches, invalidatePageCache } from '../../cache';
import { getAffectedPages } from '../../cache/mutationCacheMap';
import { emitCacheInvalidation } from '../../cache/cacheEventBus';

/** HTTP methods that represent data mutations */
const MUTATION_METHODS = new Set(['post', 'put', 'delete', 'patch']);

const axiosInstance = axios.create({
  baseURL: server_url,
  timeout: 30000, // 30 s – prevents requests hanging silently
  headers: {
    'Content-Type': 'application/json',
    charset: 'utf-8',
  },
});

// ── Request interceptor ─────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  // Happy path – auto-invalidate page caches after a successful mutation
  (response) => {
    const method = response.config?.method;
    if (MUTATION_METHODS.has(method)) {
      const url = response.config?.url || '';
      const affected = getAffectedPages(url);
      if (affected.length > 0) {
        // 1. Invalidate localStorage cache entries immediately
        affected.forEach((pageName) => invalidatePageCache(pageName));

        // 2. Notify active usePageCache hooks via event bus
        //    queueMicrotask keeps it non-blocking for the response chain
        queueMicrotask(() => emitCacheInvalidation(affected));
      }
    }
    return response;
  },

  // Error path – normalise into an ApiError and handle auth failures
  (error) => {
    const apiError = normalizeAxiosError(error);

    // 401 → clear session and redirect (unless we are already on a login page)
    if (apiError.status === 401) {
      const onLoginPage =
        window.location.pathname.includes('/login') ||
        window.location.pathname.includes('/doctorLogin');

      if (!onLoginPage) {
        clearAllCaches();
        localStorage.clear();
        window.location.href = '/doctorLogin';
      }
    }

    // Log centrally (swap for Sentry later)
    reportError(apiError, {
      url: error.config?.url,
      method: error.config?.method,
    });

    return Promise.reject(apiError);
  },
);

export default axiosInstance;