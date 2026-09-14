import { LucideIcon } from 'lucide-react';
import { Plate } from './Plate';
import { Label } from './Label';
import { Lcd } from './Lcd';
import { tokens } from '@design/tokens';

interface SupportProps {
  label: string;
  value: string | number;
  unit?: string;
  pct: number;
  I: LucideIcon;
  inv?: boolean;
  warn?: boolean;
}

export function Support({ label, value, unit, pct, I: IconComponent, inv = false, warn = false }: SupportProps) {
  const c = inv ? (pct < 25 ? tokens.colors.danger : pct < 55 ? tokens.colors.warning : tokens.colors.success) : tokens.colors.cyan;

  return (
    <Plate className="p-1.5" glow={warn ? 'rgba(245,158,11,.28)' : undefined}>
      <div className="flex items-center justify-center gap-1">
        <IconComponent size={9} color={tokens.visual.status.label} />
        <Label size={8}>{label}</Label>
      </div>
      <div className="flex justify-center my-1.5">
        <Lcd value={value} unit={unit} color={c} size={13} />
      </div>
      <div
        className="mx-1"
        style={{
          height: 5,
          borderRadius: 2,
          overflow: 'hidden',
          background: tokens.colors.bgDarker,
          boxShadow: tokens.visual.recessShadow,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.max(0, Math.min(100, pct))}%`,
            background: `linear-gradient(180deg,${c},${c}88)`,
            boxShadow: `0 0 8px ${c}`,
            transition: 'width .5s',
          }}
        />
      </div>
    </Plate>
  );
}
