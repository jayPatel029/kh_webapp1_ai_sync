/**
 * App-level React Error Boundary.
 *
 * Catches:
 * – Render / lifecycle errors in any child component.
 * – Lazy-import / chunk-load failures (shows a "Reload" action).
 *
 * Uses component-library primitives for consistent styling.
 *
 * @file src/components/AppErrorBoundary.jsx
 */

import React from 'react';
import { reportError } from '../helpers/errors/reportError';

/**
 * Detect dynamic-import / chunk-load errors
 */
function isChunkLoadError(error) {
  return (
    error?.name === 'ChunkLoadError' ||
    error?.message?.includes('Loading chunk') ||
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.message?.includes('Unable to preload CSS')
  );
}

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, isChunk: false };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      isChunk: isChunkLoadError(error),
    };
  }

  componentDidCatch(error, errorInfo) {
    reportError(error, {
      componentStack: errorInfo?.componentStack,
      boundary: 'AppErrorBoundary',
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { isChunk } = this.state;

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#f8fafc',
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: '100%',
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            padding: '2.5rem 2rem',
            textAlign: 'center',
          }}
        >
          {/* Icon */}
          <div style={{ marginBottom: '1.25rem' }}>
            <svg
              width="56"
              height="56"
              viewBox="0 0 56 56"
              fill="none"
              style={{ margin: '0 auto' }}
            >
              <circle cx="28" cy="28" r="28" fill="#FEF2F2" />
              <path
                d="M28 18v10m0 4h.01"
                stroke="#EF4444"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="28" cy="28" r="14" stroke="#EF4444" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#1e293b',
              margin: '0 0 0.5rem',
            }}
          >
            {isChunk ? 'New version available' : 'Something went wrong'}
          </h1>

          <p
            style={{
              fontSize: '0.95rem',
              color: '#64748b',
              margin: '0 0 1.5rem',
              lineHeight: 1.5,
            }}
          >
            {isChunk
              ? 'The app has been updated. Please reload to get the latest version.'
              : 'An unexpected error occurred. You can try reloading the page or go back to the home screen.'}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={this.handleReload}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: 8,
                border: 'none',
                background: '#3b82f6',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Reload page
            </button>
            {!isChunk && (
              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '0.6rem 1.5rem',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Go to home
              </button>
            )}
          </div>

          {/* Dev-only: show actual error */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details
              style={{
                marginTop: '1.5rem',
                textAlign: 'left',
                background: '#fef2f2',
                borderRadius: 8,
                padding: '0.75rem 1rem',
                fontSize: '0.8rem',
                color: '#991b1b',
              }}
            >
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                Error details (dev only)
              </summary>
              <pre style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>
                {this.state.error?.stack || this.state.error?.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
