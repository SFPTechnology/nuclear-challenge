interface MetricBadgeProps {
  label: string;           // "Heat", "Integrity", "Coolant"
  value: number;           // 0-100%
  status: 'ok' | 'warning' | 'alert';  // Color coding
  showIcon?: boolean;
}

import { tokens } from '@design/tokens';

export function MetricBadge({
  label,
  value,
  status,
  showIcon = true,
}: MetricBadgeProps) {
  const statusColors = {
    ok: { bg: '#0a1418', text: tokens.visual.status.success },
    warning: { bg: '#1c1608', text: tokens.visual.status.warning },
    alert: { bg: '#1a0505', text: tokens.visual.status.danger },
  };

  const statusIcons = {
    ok: '✅',
    warning: '⚠️',
    alert: '🔴',
  };

  const colors = statusColors[status];

  return (
    <div
      aria-label={`${label}: ${value}% ${status}`}
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
        borderRadius: '0.375rem',
        backgroundColor: colors.bg,
        color: colors.text,
        fontWeight: 500,
        fontSize: tokens.typography.fontSize.sm,
      }}
    >
      {showIcon && <span>{statusIcons[status]}</span>}
      <span>{label}</span>
      <span style={{ fontWeight: 'bold' }}>{value}%</span>
    </div>
  );
}
