/**
 * EmptyState — UX-D10
 *
 * Standardised "no data" indicator used across all 9 screens.
 *
 * Accessibility contract:
 * - Rendered as role="status" + aria-live="polite" so screen readers announce
 *   the empty condition when it appears (instead of the user facing silence).
 * - The icon is purely decorative (aria-hidden). Meaning is always carried by
 *   the title text, so information is never conveyed by icon/colour alone.
 * - Title/description are wired via aria-labelledby/aria-describedby.
 * - Optional CTA is a native <button> with an explicit aria-label.
 */

import React, { useId } from 'react';
import { tokens } from '@design/tokens';

export type EmptyStateSize = 'sm' | 'md' | 'lg';

export interface EmptyStateProps {
  /** Decorative icon: emoji string or Lucide React node. Never the sole carrier of meaning. */
  icon?: React.ReactNode;
  /** Required. The accessible name of the empty state. */
  title: string;
  /** Optional supporting copy explaining what to do next. */
  description?: string;
  /** CTA label. Requires onAction to render. */
  actionLabel?: string;
  /** CTA handler. Requires actionLabel to render. */
  onAction?: () => void;
  /** Visual density. Defaults to 'md'. */
  size?: EmptyStateSize;
  /** Test hook. Defaults to 'empty-state'. */
  testId?: string;
}

interface SizeConfig {
  padding: string;
  minHeight: string;
  iconSize: string;
  titleSize: string;
  descSize: string;
  buttonPadding: string;
  buttonSize: string;
}

const SIZE_CONFIG: Record<EmptyStateSize, SizeConfig> = {
  sm: {
    padding: tokens.spacing.md,
    minHeight: '8rem',
    iconSize: tokens.typography.fontSize['2xl'],
    titleSize: tokens.typography.fontSize.xs,
    descSize: tokens.typography.fontSize['0.5xs'],
    buttonPadding: '0.5rem 1rem',
    buttonSize: tokens.typography.fontSize['0.5xs'],
  },
  md: {
    padding: tokens.spacing.xl,
    minHeight: '12rem',
    iconSize: tokens.typography.fontSize['3xl'],
    titleSize: tokens.typography.fontSize.sm,
    descSize: tokens.typography.fontSize.xs,
    buttonPadding: '0.625rem 1.25rem',
    buttonSize: tokens.typography.fontSize.xs,
  },
  lg: {
    padding: tokens.spacing['3xl'],
    minHeight: '16rem',
    iconSize: tokens.typography.fontSize['4xl'],
    titleSize: tokens.typography.fontSize.lg,
    descSize: tokens.typography.fontSize.sm,
    buttonPadding: '0.75rem 1.5rem',
    buttonSize: tokens.typography.fontSize.sm,
  },
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  size = 'md',
  testId = 'empty-state',
}: EmptyStateProps) {
  const reactId = useId();
  const titleId = `empty-state-title-${reactId}`;
  const descId = `empty-state-desc-${reactId}`;
  const config = SIZE_CONFIG[size];
  const showAction = Boolean(actionLabel && onAction);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      data-testid={testId}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: config.padding,
        minHeight: config.minHeight,
        textAlign: 'center',
        // Dark nuclear-console surface — matches Plate/LCD styling used app-wide.
        background: tokens.colors.lcdGradient,
        borderRadius: tokens.borderRadius.md,
        border: '1px dashed #2a3138',
        boxShadow: tokens.shadows.inset,
      }}
    >
      {icon ? (
        <div
          aria-hidden="true"
          data-testid={`${testId}-icon`}
          style={{
            fontSize: config.iconSize,
            lineHeight: tokens.typography.lineHeight.tight,
            marginBottom: tokens.spacing.sm,
            color: tokens.colors.cyan,
            opacity: tokens.opacity[80],
          }}
        >
          {icon}
        </div>
      ) : null}

      <h3
        id={titleId}
        style={{
          fontSize: config.titleSize,
          fontWeight: tokens.typography.fontWeight.bold,
          // #e2e8f0 on #0a1418 ≈ 15:1 — WCAG AAA.
          color: '#e2e8f0',
          margin: `0 0 ${tokens.spacing.xs} 0`,
          fontFamily: 'monospace',
          letterSpacing: tokens.typography.letterSpacing.normal,
        }}
      >
        {title}
      </h3>

      {description ? (
        <p
          id={descId}
          style={{
            fontSize: config.descSize,
            // #a1aab8 on #0a1418 ≈ 8:1 — WCAG AAA.
            color: '#a1aab8',
            margin: showAction ? `0 0 ${tokens.spacing.md} 0` : '0',
            lineHeight: tokens.typography.lineHeight.snug,
            maxWidth: '32ch',
          }}
        >
          {description}
        </p>
      ) : null}

      {showAction ? (
        <button
          type="button"
          onClick={onAction}
          aria-label={actionLabel}
          data-testid={`${testId}-action`}
          style={{
            padding: config.buttonPadding,
            fontSize: config.buttonSize,
            background: 'linear-gradient(180deg,#0e7490,#0c4a5e)',
            // #e0f2fe on #0c4a5e ≈ 8:1 — WCAG AAA.
            color: '#e0f2fe',
            border: '1px solid #083344',
            borderRadius: tokens.borderRadius.md,
            cursor: 'pointer',
            fontWeight: tokens.typography.fontWeight.bold,
            fontFamily: 'monospace',
            letterSpacing: tokens.typography.letterSpacing.wide,
          }}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
