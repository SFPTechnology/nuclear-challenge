import React from 'react';
import { tokens } from '@design/tokens';
import { KEYBOARD_SHORTCUTS, KeyboardShortcut } from '@utils/keyboardShortcuts';

interface KeyboardLegendModalProps {
  visible: boolean;
  onClose: () => void;
  context?: 'gameplay' | 'login' | 'global' | 'all';
}

export function KeyboardLegendModal({ visible, onClose, context = 'all' }: KeyboardLegendModalProps) {
  if (!visible) return null;

  const shortcuts = context === 'all'
    ? KEYBOARD_SHORTCUTS
    : KEYBOARD_SHORTCUTS.filter(s => s.context === context || s.context === 'global');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-legend-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg, #0a1418, #050b0e)',
          border: '2px solid #0891b2',
          borderRadius: 8,
          padding: '24px',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
        }}
      >
        <h2
          id="keyboard-legend-title"
          style={{
            fontSize: tokens.typography.fontSize.lg,
            color: '#e0f2fe',
            marginTop: 0,
            marginBottom: '16px',
            fontWeight: 'bold',
            letterSpacing: '.05em',
          }}
        >
          ⌨️ Atalhos de Teclado
        </h2>

        <div
          style={{
            display: 'grid',
            gap: '12px',
          }}
        >
          {shortcuts.map((shortcut, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                paddingBottom: '8px',
                borderBottom: '1px solid rgba(6, 182, 212, 0.2)',
              }}
            >
              <kbd
                style={{
                  background: 'linear-gradient(180deg, #0e7490, #155e75)',
                  border: '1px solid #083344',
                  borderRadius: 4,
                  padding: '4px 8px',
                  fontSize: tokens.typography.fontSize.xs0,
                  fontWeight: 'bold',
                  color: '#e0f2fe',
                  minWidth: '60px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  fontFamily: 'monospace',
                  flexShrink: 0,
                }}
              >
                {shortcut.key}
              </kbd>
              <span
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: '#cbd5e1',
                  lineHeight: '1.4',
                }}
              >
                {shortcut.description}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: '16px',
            fontSize: tokens.typography.fontSize.xs,
            color: '#a1aab8',
            fontStyle: 'italic',
          }}
        >
          Pressione Escape ou clique fora para fechar
        </div>

        <button
          onClick={onClose}
          aria-label="Fechar legenda de atalhos"
          style={{
            marginTop: '12px',
            width: '100%',
            padding: '8px 16px',
            background: 'linear-gradient(180deg, #0e7490, #0c4a5e)',
            border: '1px solid #083344',
            borderRadius: 4,
            color: '#e0f2fe',
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'linear-gradient(180deg, #155e75, #164e63)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(180deg, #0e7490, #0c4a5e)';
          }}
        >
          Fechar (Esc)
        </button>
      </div>
    </div>
  );
}
