import React from 'react';
import { tokens } from '@design/tokens';
import { GlobalErrorBanner } from './GlobalErrorBanner';
import { Label } from './Label';
import { MetricBadge } from './MetricBadge';
import { Plate } from './Plate';

interface NC003PanelProps {
  player: string | null;
  players: Record<string, any>;
  heat: number;
  integrity: number;
  coolant: number;
  bg: React.CSSProperties;
  css: React.ReactNode;
  shellClass: string;
  shellStyle: React.CSSProperties;
  setMode: (mode: string) => void;
  start: () => void;
}

export function NC003Panel({
  player, players, heat, integrity, coolant,
  bg, css, shellClass, shellStyle, setMode, start
}: NC003PanelProps) {
  return (
    <div className="nc-viewport min-h-screen p-3" style={bg}>{css}
      <GlobalErrorBanner />
      <div className={`${shellClass} mx-auto`} style={shellStyle}>
        <Plate className="p-3 mb-2 text-center">
          <Label>NC-003: Taxa de Sucesso</Label>
          <div className="font-mono font-bold mt-1" style={{ fontSize: tokens.typography.fontSize.xs_lg, color: '#7dd3fc' }}>{player}</div>
        </Plate>

        <Plate className="p-3 mb-2">
          <Label className="mb-2">📊 Métricas Atuais</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <MetricBadge
              label="Heat"
              value={heat}
              status={heat > 70 ? 'alert' : heat > 50 ? 'warning' : 'ok'}
            />
            <MetricBadge
              label="Integrity"
              value={integrity}
              status={integrity < 30 ? 'alert' : integrity < 60 ? 'warning' : 'ok'}
            />
            <MetricBadge
              label="Coolant"
              value={coolant}
              status={coolant < 30 ? 'alert' : coolant < 60 ? 'warning' : 'ok'}
            />
          </div>
        </Plate>

        <Plate className="p-3 mb-3" glow="rgba(6,182,212,.2)">
          <Label className="mb-1.5">Informações da Turma</Label>
          {[['Turma', `5B (${Object.keys(players).length} operadores)`], ['Total de Partidas', Object.keys(players).reduce((sum, name) => sum + ((players[name] && players[name].games) || 0), 0)], ['Taxa Média de Sucesso', `${Object.keys(players).length > 0 ? Math.round(Object.values(players).reduce((sum, p) => sum + ((p.ops > 0 ? (p.hits / p.ops) * 100 : 0)), 0) / Object.keys(players).length) : 0}%`]].map(([label, value], i) => (
            <div key={i} className="flex justify-between items-center py-1" style={{ borderBottom: i < 2 ? '1px solid #171b1f' : 'none' }}>
              <Label size={7}>{label}</Label>
              <span className="font-mono font-bold" style={{ fontSize: tokens.typography.fontSize.xs0, color: '#7dd3fc' }}>{value}</span>
            </div>
          ))}
        </Plate>

        <div className="flex gap-1.5">
          <button onClick={() => setMode('menu')} style={{ flex: 1 }} aria-label="Voltar para menu">
            <Plate className="py-2 text-center"><Label>← Voltar</Label></Plate>
          </button>
          <button onClick={() => setMode('analise')} style={{ flex: 1 }} aria-label="Ver análise de desempenho">
            <Plate className="py-2 text-center"><Label>Análise</Label></Plate>
          </button>
          <button onClick={start} style={{ flex: 1 }} aria-label="Continuar para jogo">
            <div className="rounded-md text-center font-bold" style={{ padding: '10px 0', fontSize: tokens.typography.fontSize.xs0, letterSpacing: '.1em', background: 'linear-gradient(180deg,#0e7490,#155e75 55%,#0c4a5e)', boxShadow: '0 1px 0 rgba(255,255,255,.2) inset,0 4px 8px #000,0 0 16px rgba(6,182,212,.35)', border: '1px solid #083344', color: '#e0f2fe' }}>Continuar</div>
          </button>
        </div>
      </div>
    </div>
  );
}
