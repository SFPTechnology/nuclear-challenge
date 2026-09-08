interface ScrewProps {
  className: string;
}

export function Screw({ className }: ScrewProps) {
  return (
    <div
      className={`absolute rounded-full ${className}`}
      style={{
        width: 7,
        height: 7,
        background: 'radial-gradient(circle at 32% 28%,#6b7480,#333940 60%,#191d21)',
        boxShadow: 'inset 0 -1px 1px rgba(0,0,0,.7)',
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          style={{
            width: 4,
            height: 1,
            background: 'rgba(0,0,0,.7)',
            transform: 'rotate(45deg)',
          }}
        />
      </div>
    </div>
  );
}
