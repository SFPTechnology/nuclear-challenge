import { tokens } from '@design/tokens';

interface PauseButtonProps {
  onClick: () => void;
}

export function PauseButton({ onClick }: PauseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Pausar sistema"
      className="transition-transform active:translate-y-px"
      style={{
        width: '100%',
        minWidth: 0,
        minHeight: 48,
        padding: '8px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
        borderRadius: tokens.borderRadius.md,
        border: '1px solid #0e7490',
        background: 'linear-gradient(180deg,#155e75,#0c4a5e 55%,#083344)',
        boxShadow: '0 1px 0 rgba(255,255,255,.16) inset,0 3px 5px rgba(0,0,0,.7)',
        color: '#e0f2fe',
        fontSize: '0.796875rem', // 15% menor que o tamanho xs de 15px
        fontWeight: tokens.typography.fontWeight.bold,
        letterSpacing: tokens.typography.letterSpacing.wide,
        textAlign: 'center',
      }}
    >
      PAUSAR
    </button>
  );
}
