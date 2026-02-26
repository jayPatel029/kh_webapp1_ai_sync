/**
 * Derive a safe, user-facing message from an ApiError.
 *
 * Policy:
 * – Generic copy by default.
 * – "Safe specifics" only for allow-listed cases
 *   (validation messages, known business codes).
 *
 * @file src/helpers/errors/getUserMessage.js
 */

import { ApiError } from './ApiError';

/** Codes whose server message is trusted enough to show verbatim */
const SAFE_CODES = new Set([
  'VALIDATION_ERROR',
  'DUPLICATE_ENTRY',
  'NOT_FOUND',
  'INVALID_OTP',
  'OTP_EXPIRED',
]);

/** Status-specific generic fallbacks */
const STATUS_MESSAGES = {
  400: 'The request was invalid. Please check your input.',
  401: 'Your session has expired. Please log in again.',
  403: 'You don\'t have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'A conflict occurred. The data may have been changed by someone else.',
  422: 'Please check your input and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again later.',
  502: 'The server is temporarily unavailable. Please try again shortly.',
  503: 'The service is currently unavailable. Please try again later.',
};

const GENERIC = 'Something went wrong. Please try again.';
const NETWORK_MSG = 'Unable to reach the server. Check your internet connection.';
const TIMEOUT_MSG = 'The request timed out. Please try again.';

/**
 * @param {ApiError|Error|unknown} error
 * @returns {string} A message safe to display in a toast / alert.
 */
export function getUserMessage(error) {
  if (!(error instanceof ApiError)) {
    // Chunk-load errors
    if (
      error instanceof Error &&
      (error.message?.includes('Loading chunk') ||
        error.message?.includes('ChunkLoadError'))
    ) {
      return 'A new version is available. Please reload the page.';
    }
    return GENERIC;
  }

  if (error.isTimeout) return TIMEOUT_MSG;
  if (error.isNetworkError) return NETWORK_MSG;

  // Allow-listed codes → show the server's message directly
  if (SAFE_CODES.has(error.code) && error.message) {
    return error.message;
  }

  return STATUS_MESSAGES[error.status] || GENERIC;
}

export default getUserMessage;
