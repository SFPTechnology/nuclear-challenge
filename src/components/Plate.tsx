import { Screw } from './Screw';
import { tokens } from '@design/tokens';

interface PlateProps {
  children: React.ReactNode;
  className?: string;
  glow?: string;
  /** ARIA role forwarded to the wrapper (e.g. "region"). */
  role?: string;
  /** Accessible name, required by ARIA whenever role="region" is used. */
  'aria-label'?: string;
}

export function Plate({ children, className = '', glow, role, 'aria-label': ariaLabel }: PlateProps) {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={`relative rounded-md ${className}`}
      style={{
        background: tokens.visual.metalSurface,
        boxShadow: `${tokens.visual.raisedShadow}${glow ? `, 0 0 14px ${glow}` : ''}`,
        border: tokens.visual.consoleBorder,
      }}
    >
      <div
        className="absolute inset-0 rounded-md pointer-events-none"
        style={{ background: tokens.visual.brushTexture }}
      />
      <Screw className="top-1 left-1" />
      <Screw className="top-1 right-1" />
      <Screw className="bottom-1 left-1" />
      <Screw className="bottom-1 right-1" />
      <div className="relative">{children}</div>
    </div>
  );
}
