import { LucideIcon } from 'lucide-react';
import { tokens } from '@design/tokens';

interface ValveColor {
  a: string;
  b: string;
  c: string;
  glow: string;
  txt: string;
}

interface ValveProps {
  label: string;
  sub: string;
  I: LucideIcon;
  cd: number;
  maxCd: number;
  disabled: boolean;
  color: ValveColor;
  onClick: () => void;
}

export function Valve({ label, sub, I: IconComponent, cd, maxCd, disabled, color, onClick }: ValveProps) {
  const ready = cd === 0 && !disabled;

  return (
    <button
      onClick={onClick}
      disabled={!ready}
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 6,
        padding: '7px 4px',
        background: ready
          ? `linear-gradient(180deg,${color.a},${color.b} 60%,${color.c})`
          : 'linear-gradient(180deg,#2a2f35,#1a1e23)',
        boxShadow: ready
          ? `0 1px 0 rgba(255,255,255,.18) inset, 0 3px 5px #000, 0 0 10px ${color.glow}`
          : 'inset 0 2px 5px #000',
        border: '1px solid #14181c',
      }}
    >
      {cd > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            height: '100%',
            width: `${(cd / maxCd) * 100}%`,
            background: 'rgba(0,0,0,.45)',
            transition: 'width 1s linear',
          }}
        />
      )}
      <div className="relative flex flex-col items-center" style={{ gap: 1 }}>
        <IconComponent size={12} color={ready ? color.txt : '#4b5563'} />
        <span
          className="font-bold"
          style={{
            fontSize: tokens.typography.fontSize['0xs'],
            letterSpacing: '.06em',
            color: ready ? color.txt : '#4b5563',
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: tokens.typography.fontSize.xs2, color: ready ? color.txt + 'bb' : '#3f464e' }}>
          {cd > 0 ? `${cd}s` : sub}
        </span>
      </div>
    </button>
  );
}
