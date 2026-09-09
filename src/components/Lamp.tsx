import { tokens } from '@design/tokens';

interface LampProps {
  on: boolean;
  hue: 'red' | 'amber' | 'green';
  label: string;
}

export function Lamp({ on, hue, label }: LampProps) {
  const c = hue === 'red' ? '#dc2626' : hue === 'amber' ? '#f59e0b' : '#22c55e';
  const statusText = hue === 'red' ? 'ALERTA' : hue === 'amber' ? 'AVISO' : 'OK';
  const fullLabel = `${label}: ${on ? statusText : 'normal'}`;

  return (
    <div
      className="flex flex-col items-center"
      style={{ gap: 2 }}
      role="status"
      aria-label={fullLabel}
    >
      <div
        className="rounded-full"
        style={{
          width: 24,
          height: 24,
          background: on ? `radial-gradient(circle at 32% 32%, ${c}, ${c}cc)` : '#1f2937',
          boxShadow: on ? `0 0 12px ${c}, inset 0 1px 2px rgba(255,255,255,.3)` : 'inset 0 1px 2px rgba(0,0,0,.5)',
          transition: 'all 0.15s ease-out',
        }}
      />
      <span style={{ fontSize: tokens.typography.fontSize.micro, color: '#8d959e', textAlign: 'center' }}>{label}</span>
    </div>
  );
}
