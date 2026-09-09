import { Screw } from './Screw';

interface PlateProps {
  children: React.ReactNode;
  className?: string;
  glow?: string;
  /** ARIA role forwarded to the wrapper (e.g. "region"). */
  role?: string;
  /** Accessible name, required by ARIA whenever role="region" is used. */
  'aria-label'?: string;
}

const DS = {
  metal: 'linear-gradient(160deg,#3a4149 0%,#2b3138 40%,#22272d 70%,#2e343b 100%)',
  raised: '0 1px 0 rgba(255,255,255,.09), 0 3px 6px rgba(0,0,0,.6)',
  brush: 'repeating-linear-gradient(94deg,rgba(255,255,255,.022) 0px,rgba(255,255,255,.022) 1px,transparent 1px,transparent 3px)',
};

export function Plate({ children, className = '', glow, role, 'aria-label': ariaLabel }: PlateProps) {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={`relative rounded-md ${className}`}
      style={{
        background: DS.metal,
        boxShadow: `${DS.raised}${glow ? `, 0 0 14px ${glow}` : ''}`,
        border: '1px solid #171b1f',
      }}
    >
      <div
        className="absolute inset-0 rounded-md pointer-events-none"
        style={{ background: DS.brush }}
      />
      <Screw className="top-1 left-1" />
      <Screw className="top-1 right-1" />
      <Screw className="bottom-1 left-1" />
      <Screw className="bottom-1 right-1" />
      <div className="relative">{children}</div>
    </div>
  );
}
