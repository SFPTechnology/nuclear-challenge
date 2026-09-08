const GRAIN = [...Array(90)].map(() => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  s: Math.random() * 1.8 + 0.6,
  t: Math.random(),
}));

interface AmbientProps {
  heat: number;
}

export function Ambient({ heat }: AmbientProps) {
  if (heat < 30) return null;

  const band = heat >= 90 ? 4 : heat >= 75 ? 3 : heat >= 55 ? 2 : 1;
  const vig = [0, 0.1, 0.26, 0.44, 0.62][band];
  const hue = band <= 1 ? '245,158,11' : '239,68,68';
  const g = Math.max(0, (heat - 45) / 55);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 40 }}>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, transparent 34%, rgba(${hue},${vig}) 100%)`,
          animation: band >= 3 ? 'vigPulse 1.4s ease-in-out infinite' : 'none',
        }}
      />
      {band >= 3 && (
        <div
          className="absolute inset-0"
          style={{
            background: 'repeating-linear-gradient(0deg,rgba(0,0,0,.30) 0px,rgba(0,0,0,.30) 1px,transparent 1px,transparent 3px)',
            opacity: band === 4 ? 0.6 : 0.3,
          }}
        />
      )}
      {g > 0.05 && (
        <div
          className="absolute inset-0"
          style={{
            opacity: Math.min(0.75, g),
            animation: 'grainShift .34s steps(2) infinite',
          }}
        >
          {GRAIN.map((p, i) =>
            p.t < g ? (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.s,
                  height: p.s,
                  background: '#e8f4ff',
                }}
              />
            ) : null
          )}
        </div>
      )}
      {band === 4 && (
        <div
          className="absolute inset-0"
          style={{
            background: 'rgba(239,68,68,.06)',
            animation: 'glitch .34s steps(2) infinite',
          }}
        />
      )}
    </div>
  );
}
