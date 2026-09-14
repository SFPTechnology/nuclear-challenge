import { tokens } from '@design/tokens';

interface LampProps {
  on: boolean;
  hue: 'red' | 'amber' | 'green';
  label: string;
}

export function Lamp({ on, hue, label }: LampProps) {
  const c = hue === 'red' ? tokens.colors.danger : hue === 'amber' ? tokens.colors.warning : tokens.colors.success;
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
          width: 22,
          height: 22,
          background: on ? `radial-gradient(circle at 32% 32%, ${c}, ${c}cc)` : tokens.colors.gray800,
          boxShadow: on ? `0 0 12px ${c}, inset 0 1px 2px rgba(255,255,255,.3)` : 'inset 0 1px 2px rgba(0,0,0,.5)',
          transition: 'all 0.15s ease-out',
        }}
      />
      <span style={{ fontSize: tokens.typography.fontSize.tiny, letterSpacing: '.04em', color: tokens.visual.status.label, textAlign: 'center' }}>{label}</span>
    </div>
  );
}
