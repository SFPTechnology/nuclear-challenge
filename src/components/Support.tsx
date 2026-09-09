import { LucideIcon } from 'lucide-react';
import { Plate } from './Plate';
import { Label } from './Label';
import { Lcd } from './Lcd';

const DS = {
  recess: 'inset 0 3px 8px rgba(0,0,0,.85), inset 0 -1px 0 rgba(255,255,255,.06)',
};

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
  const c = inv ? (pct < 25 ? '#dc2626' : pct < 55 ? '#f59e0b' : '#22c55e') : '#06b6d4';

  return (
    <Plate className="p-1 pt-1.5" glow={warn ? 'rgba(245,158,11,.28)' : undefined}>
      <div className="flex items-center justify-center gap-1">
        <IconComponent size={8} color="#8d959e" />
        <Label size={7}>{label}</Label>
      </div>
      <div className="flex justify-center my-1">
        <Lcd value={value} unit={unit} color={c} size={12} />
      </div>
      <div
        className="mx-1"
        style={{
          height: 6,
          borderRadius: 2,
          overflow: 'hidden',
          background: '#0a0e11',
          boxShadow: DS.recess,
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
