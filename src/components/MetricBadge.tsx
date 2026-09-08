interface MetricBadgeProps {
  label: string;           // "Heat", "Integrity", "Coolant"
  value: number;           // 0-100%
  status: 'ok' | 'warning' | 'alert';  // Color coding
  showIcon?: boolean;
}

export function MetricBadge({
  label,
  value,
  status,
  showIcon = true,
}: MetricBadgeProps) {
  const statusColors = {
    ok: { bg: '#dcfce7', text: '#166534' },      // Green
    warning: { bg: '#fef3c7', text: '#92400e' }, // Yellow
    alert: { bg: '#fee2e2', text: '#991b1b' },   // Red
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
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        backgroundColor: colors.bg,
        color: colors.text,
        fontWeight: 500,
        fontSize: '0.875rem',
      }}
    >
      {showIcon && <span>{statusIcons[status]}</span>}
      <span>{label}</span>
      <span style={{ fontWeight: 'bold' }}>{value}%</span>
    </div>
  );
}
