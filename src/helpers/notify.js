/**
 * App-wide notification helpers (wraps Sonner).
 *
 * Usage:
 *   import { notifySuccess, notifyError } from 'helpers/notify';
 *   notifySuccess('Saved!');
 *   notifyError(apiError);          // auto-derives a safe user message
 *   notifyError('Custom message');   // or pass a plain string
 *
 * @file src/helpers/notify.js
 */

import { toast } from 'sonner';
import { ApiError } from './errors/ApiError';
import { getUserMessage } from './errors/getUserMessage';

/**
 * Show a success notification.
 * @param {string} message
 * @param {import('sonner').ExternalToastOptions} [opts]
 */
export function notifySuccess(message, opts = {}) {
  toast.success(message, {
    duration: 4000,
    ...opts,
  });
}

/**
 * Show an info notification.
 * @param {string} message
 * @param {import('sonner').ExternalToastOptions} [opts]
 */
export function notifyInfo(message, opts = {}) {
  toast(message, {
    duration: 4000,
    ...opts,
  });
}

/**
 * Show a warning notification.
 * @param {string} message
 * @param {import('sonner').ExternalToastOptions} [opts]
 */
export function notifyWarning(message, opts = {}) {
  toast.warning ? toast.warning(message, {
    duration: 4000,
    ...opts,
  }) : toast(message, {
    duration: 4000,
    ...opts,
  });
}

/**
 * Show an error notification.
 * Accepts an ApiError, plain Error, or a string.
 * Automatically derives a user-safe message from ApiError instances.
 *
 * @param {ApiError|Error|string} errorOrMessage
 * @param {import('sonner').ExternalToastOptions} [opts]
 */
export function notifyError(errorOrMessage, opts = {}) {
  const message =
    typeof errorOrMessage === 'string'
      ? errorOrMessage
      : getUserMessage(errorOrMessage);

  toast.error(message, {
    duration: 5000,
    ...opts,
  });
}

/**
 * Dismiss all toasts (useful on navigation, logout, etc.)
 */
export function dismissAllToasts() {
  toast.dismiss();
}
