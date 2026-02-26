/**
 * safeRequest – a thin wrapper around axiosInstance that guarantees
 * every call returns { ok, data, error } instead of throwing.
 *
 * Usage (in ApiCalls modules):
 *   import { safeRequest } from '../helpers/safeRequest';
 *
 *   export const getPatients = (params) =>
 *     safeRequest(() => axiosInstance.get('/patients', { params }));
 *
 *   // Callers get: { ok: true, data } | { ok: false, error: ApiError }
 *
 * Existing wrappers that use try/catch + { success, data } will continue
 * to work – migrate at your own pace by switching to safeRequest.
 *
 * @file src/helpers/safeRequest.js
 */

import { ApiError, normalizeAxiosError } from './errors/ApiError';

/**
 * @template T
 * @param {() => Promise<import('axios').AxiosResponse<T>>} requestFn
 * @returns {Promise<{ ok: true, data: T } | { ok: false, error: ApiError }>}
 */
export async function safeRequest(requestFn) {
  try {
    const response = await requestFn();
    return { ok: true, data: response.data };
  } catch (err) {
    const apiError =
      err instanceof ApiError ? err : normalizeAxiosError(err);
    return { ok: false, error: apiError };
  }
}

/**
 * Like safeRequest but also normalises the data array to always be an array.
 * Useful for list endpoints that sometimes return null/undefined.
 *
 * @template T
 * @param {() => Promise<import('axios').AxiosResponse<T[]>>} requestFn
 * @param {string} [dataKey] – optional nested key (e.g. 'data' when response is { data: [...] })
 * @returns {Promise<{ ok: true, data: T[] } | { ok: false, error: ApiError }>}
 */
export async function safeListRequest(requestFn, dataKey) {
  const result = await safeRequest(requestFn);
  if (!result.ok) return result;

  let list = dataKey ? result.data?.[dataKey] : result.data;
  if (!Array.isArray(list)) list = [];

  return { ok: true, data: dataKey ? { ...result.data, [dataKey]: list } : list };
}

export default safeRequest;
