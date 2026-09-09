import { tokens } from '@design/tokens';

interface PreMeltProps {
  secs: number;
}

export function PreMelt({ secs }: PreMeltProps) {
  return (
    <div
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
          style={{
            fontSize: tokens.typography.fontSize.xl2,
            color: '#f87171',
            textShadow: '0 0 12px #dc2626',
          }}
        >
          {secs}
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
