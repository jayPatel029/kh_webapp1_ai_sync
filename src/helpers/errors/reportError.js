/**
 * Central error reporter.
 * Currently logs to console; drop-in replacement for Sentry / Datadog later.
 *
 * @file src/helpers/errors/reportError.js
 */

/**
 * @param {Error|unknown} error
 * @param {object}        [context]  – extra key-value pairs (e.g. { page, action })
 */
export function reportError(error, context = {}) {
  // eslint-disable-next-line no-console
  console.error('[AppError]', error, context);

  // Future: Sentry.captureException(error, { extra: context });
}

export default reportError;
