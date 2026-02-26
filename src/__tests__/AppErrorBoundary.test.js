/**
 * Tests for AppErrorBoundary component.
 *
 * @file src/__tests__/AppErrorBoundary.test.js
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppErrorBoundary from '../components/AppErrorBoundary';

// Suppress console.error from React + our reportError during tests
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  console.error.mockRestore();
});

// ─── Helper: component that throws on render ──────────────────────────

const ThrowingComponent = ({ error }) => {
  throw error;
};

const GoodComponent = () => <div>All good!</div>;

// ─── Tests ────────────────────────────────────────────────────────────

describe('AppErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <AppErrorBoundary>
        <GoodComponent />
      </AppErrorBoundary>
    );
    expect(screen.getByText('All good!')).toBeInTheDocument();
  });

  it('renders fallback UI on render error', () => {
    render(
      <AppErrorBoundary>
        <ThrowingComponent error={new Error('Test crash')} />
      </AppErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
    expect(screen.getByText('Reload page')).toBeInTheDocument();
    expect(screen.getByText('Go to home')).toBeInTheDocument();
  });

  it('shows chunk-load specific UI', () => {
    const chunkError = new Error('Loading chunk 7 failed');
    chunkError.name = 'ChunkLoadError';

    render(
      <AppErrorBoundary>
        <ThrowingComponent error={chunkError} />
      </AppErrorBoundary>
    );

    expect(screen.getByText('New version available')).toBeInTheDocument();
    expect(screen.getByText(/Please reload to get the latest version/)).toBeInTheDocument();
    expect(screen.getByText('Reload page')).toBeInTheDocument();
    // Should NOT show "Go to home" for chunk errors
    expect(screen.queryByText('Go to home')).not.toBeInTheDocument();
  });

  it('reload button calls window.location.reload', () => {
    const reloadMock = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    });

    render(
      <AppErrorBoundary>
        <ThrowingComponent error={new Error('kaboom')} />
      </AppErrorBoundary>
    );

    fireEvent.click(screen.getByText('Reload page'));
    expect(reloadMock).toHaveBeenCalled();
  });
});
