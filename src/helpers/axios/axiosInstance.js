import axios from 'axios';
import { server_url } from '../../constants/constants';
import { normalizeAxiosError } from '../errors/ApiError';
import { reportError } from '../errors/reportError';
import { clearAllCaches, invalidatePageCache } from '../../cache';
import { getAffectedPages } from '../../cache/mutationCacheMap';
import { emitCacheInvalidation } from '../../cache/cacheEventBus';

/** HTTP methods that represent data mutations */
const MUTATION_METHODS = new Set(['post', 'put', 'delete', 'patch']);

/** Global request pacing to protect backend */
const REQUEST_DELAY_MS = 500;
const PROFILE_REQUEST_DELAY_MS = 50;
let lastRequestAt = 0;
let requestQueue = Promise.resolve();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRequestDelayMs = (config) => {
  if (config?.requestDelayMs != null) {
    return config.requestDelayMs;
  }

  const url = String(config?.url || "").toLowerCase();
  if (
    url.includes("/patient/getpatient/") ||
    url.includes("/patient/getmedicalteam/") ||
    url.includes("/patient/getadminteam/") ||
    url.includes("/chat/admin/")
  ) {
    return PROFILE_REQUEST_DELAY_MS;
  }

  return REQUEST_DELAY_MS;
};

const queueRequestDelay = (delayMs) => {
  requestQueue = requestQueue.then(async () => {
    const now = Date.now();
    const waitMs = Math.max(0, delayMs - (now - lastRequestAt));
    if (waitMs > 0) {
      await delay(waitMs);
    }
    lastRequestAt = Date.now();
  });
  return requestQueue;
};

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
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    const delayMs = getRequestDelayMs(config);
    await queueRequestDelay(delayMs);

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