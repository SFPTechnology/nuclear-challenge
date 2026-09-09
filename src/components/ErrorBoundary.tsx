/**
 * ErrorBoundary — TD-SYS-18
 *
 * Catches render/lifecycle errors from the subtree and renders a friendly
 * fallback instead of a white screen.
 *
 * Accessibility contract:
 * - Fallback is role="alert" + aria-live="assertive" so the failure is
 *   announced immediately.
 * - aria-labelledby/aria-describedby point at a human-readable title and
 *   message. The raw stack trace is never surfaced to the user.
 * - Both recovery actions are native <button> elements with aria-labels.
 *
 * Recovery contract:
 * - "Tentar novamente" resets boundary state so the subtree re-mounts. The page
 *   is NOT reloaded, so in-memory state elsewhere survives.
 * - "Recarregar página" remains available as the escalation path.
 */

import React from 'react';
import { tokens } from '@design/tokens';

/** Structured record emitted for every caught error. */
export interface ErrorBoundaryLogEntry {
  type: 'ErrorBoundary';
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  timestamp: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Static node, or a render function receiving the error and a reset callback. */
  fallback?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode);
  /** Side-channel for telemetry. Receives the same structured entry that is logged. */
  onError?: (entry: ErrorBoundaryLogEntry) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const FRIENDLY_FALLBACK_MESSAGE =
  'Um componente do painel falhou inesperadamente. Nenhum dado foi perdido. ' +
  'Tente novamente ou recarregue a página.';

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const entry: ErrorBoundaryLogEntry = {
      type: 'ErrorBoundary',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack ?? undefined,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      timestamp: new Date().toISOString(),
    };

    // Structured console log — parseable, single record per failure.
    console.error('[ErrorBoundary]', JSON.stringify(entry));

    // Telemetry hook must never take the boundary down with it.
    try {
      this.props.onError?.(entry);
    } catch (hookError) {
      console.error('[ErrorBoundary] onError hook threw:', hookError);
    }
  }

  /** Clears the error so the subtree re-mounts. Does not reload the page. */
  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  private reload = (): void => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  render(): React.ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError || !error) return children;

    if (typeof fallback === 'function') return fallback(error, this.reset);
    if (fallback !== undefined) return fallback;

    return (
      <div
        role="alert"
        aria-live="assertive"
        aria-labelledby="error-boundary-title"
        aria-describedby="error-boundary-desc"
        data-testid="error-boundary-fallback"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: tokens.spacing.sm,
          padding: tokens.spacing.xl,
          minHeight: '12rem',
          textAlign: 'center',
          background: tokens.colors.meltdownBg,
          border: tokens.borders.danger,
          borderRadius: tokens.borderRadius.md,
          fontFamily: 'monospace',
        }}
      >
        <h2
          id="error-boundary-title"
          style={{
            margin: 0,
            fontSize: tokens.typography.fontSize.lg,
            fontWeight: tokens.typography.fontWeight.bold,
            // #fecaca on #450a0a ≈ 9:1 — WCAG AAA.
            color: '#fecaca',
          }}
        >
          <span aria-hidden="true">⚠ </span>
          Falha no painel
        </h2>

        <p
          id="error-boundary-desc"
          style={{
            margin: 0,
            maxWidth: '40ch',
            fontSize: tokens.typography.fontSize.xs,
            lineHeight: tokens.typography.lineHeight.snug,
            color: '#fed7aa',
          }}
        >
          {FRIENDLY_FALLBACK_MESSAGE}
        </p>

        <div style={{ display: 'flex', gap: tokens.spacing.sm, marginTop: tokens.spacing.sm }}>
          <button
            type="button"
            onClick={this.reset}
            aria-label="Tentar novamente e recarregar o componente"
            data-testid="error-boundary-retry"
            style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(180deg,#0e7490,#0c4a5e)',
              color: '#e0f2fe',
              border: '1px solid #083344',
              borderRadius: tokens.borderRadius.md,
              cursor: 'pointer',
              fontWeight: tokens.typography.fontWeight.bold,
              fontSize: tokens.typography.fontSize.xs,
              fontFamily: 'monospace',
            }}
          >
            Tentar novamente
          </button>

          <button
            type="button"
            onClick={this.reload}
            aria-label="Recarregar a página inteira"
            data-testid="error-boundary-reload"
            style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(180deg,#2a2f35,#1a1e23)',
              color: '#e2e8f0',
              border: '1px solid #14181c',
              borderRadius: tokens.borderRadius.md,
              cursor: 'pointer',
              fontWeight: tokens.typography.fontWeight.bold,
              fontSize: tokens.typography.fontSize.xs,
              fontFamily: 'monospace',
            }}
          >
            Recarregar página
          </button>
        </div>
      </div>
    );
  }
}
