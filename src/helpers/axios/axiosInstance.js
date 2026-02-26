import axios from 'axios';
import { server_url } from '../../constants/constants';
import { normalizeAxiosError } from '../errors/ApiError';
import { reportError } from '../errors/reportError';

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
  // Happy path – pass through
  (response) => response,

  // Error path – normalise into an ApiError and handle auth failures
  (error) => {
    const apiError = normalizeAxiosError(error);

    // 401 → clear session and redirect (unless we are already on a login page)
    if (apiError.status === 401) {
      const onLoginPage =
        window.location.pathname.includes('/login') ||
        window.location.pathname.includes('/doctorLogin');

      if (!onLoginPage) {
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