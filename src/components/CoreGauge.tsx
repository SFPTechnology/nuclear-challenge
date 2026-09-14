import { Plate } from './Plate';
import { Label } from './Label';

const DS = {
  bezel: 'linear-gradient(145deg,#4a525b 0%,#2a2f35 45%,#1c2126 100%)',
  raised: '0 1px 0 rgba(255,255,255,.09), 0 3px 6px rgba(0,0,0,.6)',
  recess: 'inset 0 3px 8px rgba(0,0,0,.85), inset 0 -1px 0 rgba(255,255,255,.06)',
  glass: 'linear-gradient(160deg,rgba(255,255,255,.10) 0%,rgba(255,255,255,.03) 34%,transparent 55%)',
};

interface CoreGaugeProps {
  temp: number;
  delta: number;
  danger: boolean;
  frozen: boolean;
}

export function CoreGauge({ temp, delta, danger, frozen }: CoreGaugeProps) {
  const pct = Math.max(0, Math.min(1, (temp - 280) / 420));
  const ang = -120 + pct * 240;
  const col = frozen ? '#38bdf8' : pct > 0.78 ? '#dc2626' : pct > 0.55 ? '#f59e0b' : '#22c55e';

  const arc = (f: number, t: number, c: string) => {
    const r = 55,
      cx = 85,
      cy = 80;
    const p = (a: number) => [
      cx + r * Math.cos(((a - 90) * Math.PI) / 180),
      cy + r * Math.sin(((a - 90) * Math.PI) / 180),
    ];
    const [x1, y1] = p(f),
      [x2, y2] = p(t);
    return (
      <path
        key={`${f}-${t}`}
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${t - f > 180 ? 1 : 0} 1 ${x2} ${y2}`}
        fill="none"
        stroke={c}
        strokeWidth="7"
      />
    );
  };

  return (
    <Plate className="p-1.5" glow={danger ? 'rgba(239,68,68,.35)' : frozen ? 'rgba(56,189,248,.35)' : undefined}>
      <div className="flex justify-center mb-1">
        <Label size={9}>{frozen ? 'Núcleo · Boro Ativo' : 'Temperatura do Núcleo'}</Label>
      </div>
      <div
        className="mx-auto rounded-full relative"
        style={{
          width: 174,
          height: 128,
          background: DS.bezel,
          boxShadow: DS.raised,
          padding: 5,
        }}
      >
        <div
          className="w-full h-full rounded-full relative overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at 50% 20%,#20262c,#0d1114 70%)',
            boxShadow: DS.recess,
          }}
        >
          <svg viewBox="0 0 170 120" className="w-full h-full">
            {arc(-120, 12, '#14532d')}
            {arc(12, 67, '#78350f')}
            {arc(67, 120, '#7f1d1d')}
            {[...Array(13)].map((_, i) => {
              const a = -120 + i * 20,
                maj = i % 3 === 0,
                r1 = maj ? 42 : 46,
                rd = ((a - 90) * Math.PI) / 180;
              return (
                <line
                  key={`tick-${i}`}
                  x1={85 + r1 * Math.cos(rd)}
                  y1={80 + r1 * Math.sin(rd)}
                  x2={85 + 51 * Math.cos(rd)}
                  y2={80 + 51 * Math.sin(rd)}
                  stroke={maj ? '#9ca3af' : '#4b5563'}
                  strokeWidth={maj ? 1.6 : 1}
                />
              );
            })}
            <text x="85" y="62" textAnchor="middle" fill={col} fontSize="26" fontFamily="monospace" fontWeight="bold">
              {Math.round(temp)}
            </text>
            <text x="85" y="72" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">
              °C
            </text>
            <line
              x1="85"
              y1="80"
              x2={85 + 45 * Math.cos(((ang - 90) * Math.PI) / 180)}
              y2={80 + 45 * Math.sin(((ang - 90) * Math.PI) / 180)}
              stroke="#f4f4f5"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <line
              x1="85"
              y1="80"
              x2={85 - 11 * Math.cos(((ang - 90) * Math.PI) / 180)}
              y2={80 - 11 * Math.sin(((ang - 90) * Math.PI) / 180)}
              stroke="#71717a"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <circle cx="85" cy="80" r="5" fill="#4b535c" stroke="#0b0e11" />
            <text
              x="85"
              y="100"
              textAnchor="middle"
              fill={frozen ? '#38bdf8' : delta > 0.4 ? '#f87171' : delta < -0.4 ? '#4ade80' : '#6b7280'}
              fontSize="10"
              fontFamily="monospace"
            >
              {frozen ? 'CONGELADO' : `${delta >= 0 ? '+' : ''}${delta.toFixed(1)} °C/s`}
            </text>
          </svg>
          <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: DS.glass }} />
        </div>
      </div>
    </Plate>
  );
}
