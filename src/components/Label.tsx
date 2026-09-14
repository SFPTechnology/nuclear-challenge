interface LabelProps {
  children: React.ReactNode;
  className?: string;
  size?: number;
}

import { tokens } from '@design/tokens';

export function Label({ children, className = '', size = 11 }: LabelProps) {
  return (
    <div
      className={`font-semibold uppercase ${className}`}
      style={{
        fontSize: `${Math.max(size, 10) / 16}rem`,
        lineHeight: tokens.typography.lineHeight.snug,
        letterSpacing: tokens.typography.letterSpacing.label,
        color: tokens.visual.status.label,
        textShadow: tokens.typography.textShadow.sm,
        overflowWrap: 'anywhere',
        textWrap: 'balance',
      }}
    >
      {children}
    </div>
  );
}
