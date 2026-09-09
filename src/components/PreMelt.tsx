import { tokens } from '@design/tokens';

interface PreMeltProps {
  secs: number;
}

export function PreMelt({ secs }: PreMeltProps) {
  // UX-D10: PreMelt is a countdown overlay, not a data list. Its only "empty"
  // condition is an absent/invalid countdown value, which previously rendered a
  // blank red box. Fall back to a readable label instead.
  const hasCountdown = typeof secs === 'number' && Number.isFinite(secs);
  const countdownLabel = hasCountdown ? String(secs) : '--';

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-label={
        hasCountdown
          ? `Meltdown iminente em ${secs} segundos. Acerte ou acione o SCRAM.`
          : 'Meltdown iminente. Contagem indisponível. Acerte ou acione o SCRAM.'
      }
      data-testid="pre-melt"
      className="fixed left-1/2"
      style={{
        top: '36%',
        transform: 'translateX(-50%)',
        zIndex: 45,
        animation: 'warnPulse .5s ease-in-out infinite',
      }}
    >
      <div
        className="rounded text-center"
        style={{
          padding: '10px 20px',
          background: 'linear-gradient(180deg,#450a0a,#1a0505)',
          border: '2px solid #dc2626',
          boxShadow: '0 0 26px rgba(239,68,68,.75)',
        }}
      >
        <div
          className="font-bold"
          style={{
            fontSize: tokens.typography.fontSize.xs_lg,
            letterSpacing: '.18em',
            color: '#fecaca',
          }}
        >
          ⚠ MELTDOWN IMINENTE
        </div>
        <div
          className="font-mono font-bold"
          aria-hidden="true"
          data-testid="pre-melt-countdown"
          style={{
            fontSize: tokens.typography.fontSize.xl2,
            color: '#f87171',
            textShadow: '0 0 12px #dc2626',
          }}
        >
          {countdownLabel}
        </div>
        <div
          style={{
            fontSize: tokens.typography.fontSize.tiny,
            letterSpacing: '.12em',
            color: '#fca5a5',
          }}
        >
          ACERTE OU ACIONE O SCRAM
        </div>
      </div>
    </div>
  );
}
