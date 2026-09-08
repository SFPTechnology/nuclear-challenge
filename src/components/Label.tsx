interface LabelProps {
  children: React.ReactNode;
  className?: string;
  size?: number;
}

export function Label({ children, className = '', size = 9 }: LabelProps) {
  return (
    <div
      className={`font-semibold uppercase ${className}`}
      style={{
        fontSize: size,
        letterSpacing: '.16em',
        color: '#8d959e',
        textShadow: '0 1px 0 rgba(0,0,0,.9)',
      }}
    >
      {children}
    </div>
  );
}
