import { tokens } from '@design/tokens';

interface LcdProps {
  value: string | number;
  unit?: string;
  color?: string;
  size?: number;
}

export function Lcd({ value, unit, color = tokens.visual.status.info, size = 13 }: LcdProps) {
  return (
    <div
      className="rounded"
      style={{
        background: tokens.visual.lcdSurface,
        boxShadow: tokens.visual.recessShadow,
        padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
      }}
    >
      <span
        className="font-mono font-bold"
        style={{
          fontSize: `${size / 16}rem`,
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
            fontSize: tokens.typography.fontSize.micro,
            marginLeft: 2,
            color: tokens.visual.status.disabled,
          }}
        >
          {unit}
        </span>
      ) : null}
    </div>
  );
}
