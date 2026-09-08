interface LcdProps {
  value: string | number;
  unit?: string;
  color?: string;
  size?: number;
}

export function Lcd({ value, unit, color = '#7dd3fc', size = 13 }: LcdProps) {
  return (
    <div
      className="rounded"
      style={{
        background: 'linear-gradient(180deg,#0a1418,#050b0e)',
        boxShadow: 'inset 0 3px 8px rgba(0,0,0,.85), inset 0 -1px 0 rgba(255,255,255,.06)',
        padding: '2px 6px',
      }}
    >
      <span
        className="font-mono font-bold"
        style={{
          fontSize: size,
          color,
          textShadow: `0 0 6px ${color}90`,
        }}
      >
        {value}
      </span>
      {unit ? (
        <span
          className="font-mono"
          style={{
            fontSize: 8,
            marginLeft: 2,
            color: '#4b5563',
          }}
        >
          {unit}
        </span>
      ) : null}
    </div>
  );
}
