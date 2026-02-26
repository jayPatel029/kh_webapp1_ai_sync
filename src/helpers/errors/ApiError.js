/**
 * Normalized API error class.
 * Every failed HTTP call should be converted into this shape
 * so the UI never touches raw Axios/fetch error objects.
 *
 * @file src/helpers/errors/ApiError.js
 */

export class ApiError extends Error {
  /**
   * @param {object} opts
   * @param {number}  [opts.status]         – HTTP status (0 for network errors)
   * @param {string}  [opts.code]           – Machine-readable code from the server (e.g. "VALIDATION_ERROR")
   * @param {string}  [opts.message]        – Raw server / axios message (never show directly)
   * @param {*}       [opts.details]        – Extra payload (validation fields, etc.)
   * @param {boolean} [opts.isNetworkError] – true when request never reached the server
   * @param {boolean} [opts.isTimeout]      – true for request timeouts
   * @param {Error}   [opts.original]       – Original error for logging
   */
  constructor({
    status = 0,
    code = 'UNKNOWN',
    message = 'Something went wrong',
    details = null,
    isNetworkError = false,
    isTimeout = false,
    original = null,
  } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.isNetworkError = isNetworkError;
    this.isTimeout = isTimeout;
    this.original = original;
  }

  /** True when the server explicitly returned a 4xx with a validation payload */
  get isValidation() {
    return this.status >= 400 && this.status < 500 && this.code === 'VALIDATION_ERROR';
  }

  /** True for 401 / 403 */
  get isAuth() {
    return this.status === 401 || this.status === 403;
  }
}

/**
 * Convert any Axios error into a normalised ApiError.
 * Safe to call on anything – returns an ApiError in every case.
 */
export function normalizeAxiosError(error) {
  if (error instanceof ApiError) return error;

  // Network / CORS – no response at all
  if (!error.response) {
    return new ApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: error.message || 'Network error',
      isNetworkError: true,
      isTimeout: error.code === 'ECONNABORTED',
      original: error,
    });
  }

  const { status, data } = error.response;
  const serverMessage =
    typeof data === 'string'
      ? data
      : data?.message || data?.error || error.message;
  const serverCode = data?.code || (status === 401 ? 'UNAUTHORIZED' : 'SERVER_ERROR');

  return new ApiError({
    status,
    code: serverCode,
    message: serverMessage,
    details: data?.details || data?.errors || null,
    original: error,
  });
}

export default ApiError;
