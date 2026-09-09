/**
 * ErrorBoundary — TD-SYS-18 (Phase 4)
 *
 * Covers: fallback rendering (no white screen), structured logging, the retry
 * recovery path, custom fallbacks, and accessibility.
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import axe from 'axe-core';

import { ErrorBoundary } from '@components/ErrorBoundary';

/** Throws on first render, succeeds afterwards once the flag flips. */
function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('reactor offline');
  return <div>conteúdo recuperado</div>;
}

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  // React logs caught errors to console.error; silence it so test output stays
  // readable, while still allowing assertions on our structured record.
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
  cleanup();
});

describe('ErrorBoundary — happy path', () => {
  it('renders children untouched when nothing throws', () => {
    render(
      <ErrorBoundary>
        <div>tudo nominal</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('tudo nominal')).toBeTruthy();
    expect(screen.queryByTestId('error-boundary-fallback')).toBeNull();
  });
});

describe('ErrorBoundary — fallback UI', () => {
  it('renders a fallback instead of a white screen', () => {
    const { container } = render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );

    const fallback = screen.getByTestId('error-boundary-fallback');
    expect(fallback).toBeTruthy();
    // "No white screen" == the boundary rendered visible content, not null.
    expect(container.textContent?.trim().length).toBeGreaterThan(0);
    expect(screen.getByText('Falha no painel')).toBeTruthy();
  });

  it('does not leak the raw error message or stack to the user', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    const text = screen.getByTestId('error-boundary-fallback').textContent ?? '';
    expect(text).not.toContain('reactor offline');
    expect(text).not.toContain('at Bomb');
  });

  it('renders a static custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>fallback custom</div>}>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('fallback custom')).toBeTruthy();
    expect(screen.queryByTestId('error-boundary-fallback')).toBeNull();
  });

  it('passes the error and a reset callback to a render-prop fallback', () => {
    render(
      <ErrorBoundary
        fallback={(error, reset) => (
          <button type="button" onClick={reset}>
            falhou: {error.message}
          </button>
        )}
      >
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByRole('button', { name: /falhou: reactor offline/ })).toBeTruthy();
  });
});

describe('ErrorBoundary — structured logging', () => {
  it('emits a single structured console record with context', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );

    const call = consoleErrorSpy.mock.calls.find((c: unknown[]) => c[0] === '[ErrorBoundary]');
    expect(call).toBeTruthy();

    const entry = JSON.parse(call![1] as string);
    expect(entry.type).toBe('ErrorBoundary');
    expect(entry.message).toBe('reactor offline');
    expect(entry.url).toBeTruthy();
    expect(entry.componentStack).toBeTruthy();
    // Timestamp must be a valid ISO string.
    expect(Number.isNaN(Date.parse(entry.timestamp))).toBe(false);
  });

  it('invokes the onError telemetry hook with the same entry', () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toMatchObject({
      type: 'ErrorBoundary',
      message: 'reactor offline',
    });
  });

  it('still renders the fallback when the onError hook itself throws', () => {
    const onError = vi.fn(() => {
      throw new Error('telemetry down');
    });

    render(
      <ErrorBoundary onError={onError}>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-boundary-fallback')).toBeTruthy();
  });
});

describe('ErrorBoundary — recovery', () => {
  it('retry re-mounts the subtree without reloading the page', () => {
    const reload = vi.fn();
    const original = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...original, href: original.href, reload },
    });

    function Harness() {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      return (
        <>
          <button type="button" onClick={() => setShouldThrow(false)}>
            corrigir
          </button>
          <ErrorBoundary>
            <Bomb shouldThrow={shouldThrow} />
          </ErrorBoundary>
        </>
      );
    }

    render(<Harness />);
    expect(screen.getByTestId('error-boundary-fallback')).toBeTruthy();

    // Remove the underlying cause, then retry.
    fireEvent.click(screen.getByRole('button', { name: 'corrigir' }));
    fireEvent.click(screen.getByTestId('error-boundary-retry'));

    expect(screen.getByText('conteúdo recuperado')).toBeTruthy();
    expect(screen.queryByTestId('error-boundary-fallback')).toBeNull();
    expect(reload).not.toHaveBeenCalled();

    Object.defineProperty(window, 'location', { configurable: true, value: original });
  });

  it('reload button calls window.location.reload', () => {
    const reload = vi.fn();
    const original = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...original, href: original.href, reload },
    });

    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    fireEvent.click(screen.getByTestId('error-boundary-reload'));
    expect(reload).toHaveBeenCalledTimes(1);

    Object.defineProperty(window, 'location', { configurable: true, value: original });
  });

  it('re-catches if the subtree still throws after retry', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    fireEvent.click(screen.getByTestId('error-boundary-retry'));
    // Cause was never fixed, so the boundary must trip again — not white-screen.
    expect(screen.getByTestId('error-boundary-fallback')).toBeTruthy();
  });
});

describe('ErrorBoundary — accessibility', () => {
  it('announces the failure via role="alert" and aria-live="assertive"', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );

    const alert = screen.getByRole('alert');
    expect(alert.getAttribute('aria-live')).toBe('assertive');
    expect(alert.getAttribute('aria-labelledby')).toBe('error-boundary-title');
    expect(alert.getAttribute('aria-describedby')).toBe('error-boundary-desc');
  });

  it('gives both recovery buttons explicit accessible names', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(
      screen.getByRole('button', { name: 'Tentar novamente e recarregar o componente' })
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Recarregar a página inteira' })
    ).toBeTruthy();
  });

  it('has no serious axe violations in the fallback', async () => {
    const { container } = render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );

    const results = await axe.run(container, {
      rules: {
        region: { enabled: false },
        'page-has-heading-one': { enabled: false },
      },
    });
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );
    expect(serious).toEqual([]);
  });
});
