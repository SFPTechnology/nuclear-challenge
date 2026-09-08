// @ts-nocheck

import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;        // Icon/emoji
  title: string;                 // "No results"
  description?: string;          // "Try adjusting filters"
  actionLabel?: string;          // "Create new"
  onAction?: () => void;         // Callback
  size?: 'sm' | 'md' | 'lg';    // Sizing
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  size = 'md',
}: EmptyStateProps) {
  const sizeConfig = {
    sm: { padding: '1rem', minHeight: '10rem', iconSize: '2rem', titleSize: 11, descSize: 9.5, buttonPadding: '0.5rem 1rem', buttonSize: 11 },
    md: { padding: '2rem', minHeight: '15rem', iconSize: '3rem', titleSize: 13, descSize: 11, buttonPadding: '0.625rem 1.25rem', buttonSize: 12 },
    lg: { padding: '3rem', minHeight: '20rem', iconSize: '4rem', titleSize: 15, descSize: 12, buttonPadding: '0.75rem 1.5rem', buttonSize: 13 }
  };

  const config = sizeConfig[size];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: config.padding,
      minHeight: config.minHeight,
      textAlign: 'center',
      color: '#6b7280',
      backgroundColor: '#f9fafb',
      borderRadius: '0.5rem',
      border: '1px dashed #d1d5db',
    }}>
      {icon && (
        <div style={{
          fontSize: config.iconSize,
          marginBottom: '1rem',
        }}>
          {icon}
        </div>
      )}

      <h3 style={{
        fontSize: config.titleSize,
        fontWeight: 600,
        color: '#111827',
        margin: '0 0 0.5rem 0',
        fontFamily: 'monospace',
      }}>
        {title}
      </h3>

      {description && (
        <p style={{
          fontSize: config.descSize,
          color: '#9ca3af',
          margin: '0 0 1rem 0',
          lineHeight: 1.4,
        }}>
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          type="button"
          style={{
            padding: config.buttonPadding,
            fontSize: config.buttonSize,
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: 500,
            fontFamily: 'monospace',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
