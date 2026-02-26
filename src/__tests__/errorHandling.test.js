/**
 * Tests for error handling foundation:
 *  – ApiError + normalizeAxiosError (error normalizer)
 *  – getUserMessage (user-facing message policy)
 *
 * @file src/__tests__/errorHandling.test.js
 */

import { ApiError, normalizeAxiosError } from '../helpers/errors/ApiError';
import { getUserMessage } from '../helpers/errors/getUserMessage';

// ─── ApiError construction ────────────────────────────────────────────

describe('ApiError', () => {
  it('creates with default values', () => {
    const err = new ApiError();
    expect(err.name).toBe('ApiError');
    expect(err.status).toBe(0);
    expect(err.code).toBe('UNKNOWN');
    expect(err.message).toBe('Something went wrong');
    expect(err.isNetworkError).toBe(false);
    expect(err.isTimeout).toBe(false);
    expect(err.isAuth).toBe(false);
    expect(err.isValidation).toBe(false);
  });

  it('detects auth errors', () => {
    expect(new ApiError({ status: 401 }).isAuth).toBe(true);
    expect(new ApiError({ status: 403 }).isAuth).toBe(true);
    expect(new ApiError({ status: 400 }).isAuth).toBe(false);
  });

  it('detects validation errors', () => {
    const err = new ApiError({ status: 422, code: 'VALIDATION_ERROR' });
    expect(err.isValidation).toBe(true);
  });
});

// ─── normalizeAxiosError ──────────────────────────────────────────────

describe('normalizeAxiosError', () => {
  it('returns same instance if already ApiError', () => {
    const original = new ApiError({ status: 404 });
    expect(normalizeAxiosError(original)).toBe(original);
  });

  it('handles network errors (no response)', () => {
    const axErr = new Error('Network Error');
    axErr.response = undefined;
    axErr.code = undefined;

    const result = normalizeAxiosError(axErr);

    expect(result).toBeInstanceOf(ApiError);
    expect(result.isNetworkError).toBe(true);
    expect(result.status).toBe(0);
    expect(result.code).toBe('NETWORK_ERROR');
  });

  it('handles timeout errors', () => {
    const axErr = new Error('timeout of 30000ms exceeded');
    axErr.response = undefined;
    axErr.code = 'ECONNABORTED';

    const result = normalizeAxiosError(axErr);

    expect(result.isTimeout).toBe(true);
    expect(result.isNetworkError).toBe(true);
  });

  it('handles server errors with data.message', () => {
    const axErr = new Error('Request failed with status code 500');
    axErr.response = {
      status: 500,
      data: { message: 'Internal server error' },
    };

    const result = normalizeAxiosError(axErr);

    expect(result.status).toBe(500);
    expect(result.message).toBe('Internal server error');
    expect(result.code).toBe('SERVER_ERROR');
    expect(result.isNetworkError).toBe(false);
  });

  it('handles 401 with UNAUTHORIZED code', () => {
    const axErr = new Error('Request failed with status code 401');
    axErr.response = {
      status: 401,
      data: { message: 'Token expired' },
    };

    const result = normalizeAxiosError(axErr);

    expect(result.status).toBe(401);
    expect(result.isAuth).toBe(true);
    expect(result.code).toBe('UNAUTHORIZED');
  });

  it('handles string response data', () => {
    const axErr = new Error('Request failed');
    axErr.response = { status: 400, data: 'Bad request body' };

    const result = normalizeAxiosError(axErr);

    expect(result.message).toBe('Bad request body');
  });

  it('preserves details from server', () => {
    const axErr = new Error('Validation');
    axErr.response = {
      status: 422,
      data: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid fields',
        errors: [{ field: 'email', msg: 'required' }],
      },
    };

    const result = normalizeAxiosError(axErr);
    expect(result.details).toEqual([{ field: 'email', msg: 'required' }]);
  });
});

// ─── getUserMessage ───────────────────────────────────────────────────

describe('getUserMessage', () => {
  it('returns generic message for plain Error', () => {
    expect(getUserMessage(new Error('kaboom'))).toBe(
      'Something went wrong. Please try again.'
    );
  });

  it('returns network message for network errors', () => {
    const err = new ApiError({ isNetworkError: true });
    expect(getUserMessage(err)).toBe(
      'Unable to reach the server. Check your internet connection.'
    );
  });

  it('returns timeout message', () => {
    const err = new ApiError({ isTimeout: true, isNetworkError: true });
    expect(getUserMessage(err)).toBe('The request timed out. Please try again.');
  });

  it('returns server message for allow-listed codes', () => {
    const err = new ApiError({
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Email is required',
    });
    expect(getUserMessage(err)).toBe('Email is required');
  });

  it('returns status-specific generic for non-allowlisted codes', () => {
    const err = new ApiError({ status: 500, code: 'SERVER_ERROR', message: 'SQL syntax error' });
    expect(getUserMessage(err)).toBe(
      'Something went wrong on our end. Please try again later.'
    );
  });

  it('returns session expired for 401', () => {
    const err = new ApiError({ status: 401, code: 'UNAUTHORIZED' });
    expect(getUserMessage(err)).toBe(
      'Your session has expired. Please log in again.'
    );
  });

  it('handles chunk load errors', () => {
    const err = new Error('Loading chunk 5 failed');
    expect(getUserMessage(err)).toBe(
      'A new version is available. Please reload the page.'
    );
  });

  it('returns generic for unexpected input', () => {
    expect(getUserMessage(null)).toBe('Something went wrong. Please try again.');
    expect(getUserMessage(undefined)).toBe('Something went wrong. Please try again.');
    expect(getUserMessage('string')).toBe('Something went wrong. Please try again.');
  });
});
