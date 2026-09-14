import React from 'react';
import { tokens } from '@design/tokens';
import { EmptyState } from './EmptyState';
import { GlobalErrorBanner } from './GlobalErrorBanner';
import { Label } from './Label';
import { MetricBadge } from './MetricBadge';
import type { AppMode } from '@hooks/useUIState';
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
  setMode: (mode: AppMode) => void;
  resumeAvailable?: boolean;
  resumeGame?: () => void;
  start: () => void;
  storeErr: boolean;
}

function NC003ActionButton({
  children,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="transition-transform active:translate-y-px"
      style={{
        flex: 1,
        minHeight: 44,
        padding: '10px 8px',
        borderRadius: tokens.borderRadius.md,
        border: '1px solid #083344',
        background: 'linear-gradient(180deg,#0e7490,#155e75 55%,#0c4a5e)',
        boxShadow: '0 1px 0 rgba(255,255,255,.2) inset,0 4px 8px #000,0 0 16px rgba(6,182,212,.35)',
        color: '#e0f2fe',
        fontSize: tokens.typography.fontSize.xs0,
        fontWeight: tokens.typography.fontWeight.bold,
        letterSpacing: tokens.typography.letterSpacing.wide,
      }}
    >
      {children}
    </button>
  );
}

export function NC003Panel({
  player, players, heat, integrity, coolant,
  bg, css, shellClass, shellStyle, setMode, resumeAvailable = false, resumeGame, start, storeErr
}: NC003PanelProps) {
  // UX-D10: NC-003 is a weighted-rate report. With zero recorded operations
  // there is nothing to weight, so show an explicit empty state instead of a
  // table of zeros that reads as a broken screen.
  const totalGames = Object.values(players).reduce(
    (sum: number, p: any) => sum + ((p && p.games) || 0),
    0
  );
  const hasTurmaData = Object.keys(players).length > 0 && totalGames > 0;

  return (
    <div className="nc-viewport min-h-screen p-3" style={bg}>{css}
      <GlobalErrorBanner visible={storeErr} />
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

        {!hasTurmaData ? (
          <div className="mb-3">
            <EmptyState
              icon="📉"
              title="Sem dados de taxa ponderada"
              description="Nenhuma partida foi registrada pela turma ainda. Conclua uma partida para gerar o relatório NC-003."
              actionLabel="Iniciar partida"
              onAction={start}
              size="md"
              testId="empty-state-nc003"
            />
          </div>
        ) : (
        <Plate className="p-3 mb-3" glow="rgba(6,182,212,.2)">
          <Label className="mb-1.5">Informações da Turma</Label>
          {[['Turma', `5B (${Object.keys(players).length} operadores)`], ['Total de Partidas', Object.keys(players).reduce((sum, name) => sum + ((players[name] && players[name].games) || 0), 0)], ['Taxa Média de Sucesso', `${Object.keys(players).length > 0 ? Math.round(Object.values(players).reduce((sum, p) => sum + ((p.ops > 0 ? (p.hits / p.ops) * 100 : 0)), 0) / Object.keys(players).length) : 0}%`]].map(([label, value], i) => (
            <div key={i} className="flex justify-between items-center py-1" style={{ borderBottom: i < 2 ? '1px solid #171b1f' : 'none' }}>
              <Label size={7}>{label}</Label>
              <span className="font-mono font-bold" style={{ fontSize: tokens.typography.fontSize.xs0, color: '#7dd3fc' }}>{value}</span>
            </div>
          ))}
        </Plate>
        )}

        {resumeAvailable && resumeGame && (
          <div className="mb-1.5">
            <NC003ActionButton onClick={resumeGame} ariaLabel="Retornar ao jogo">
              RETORNAR AO JOGO
            </NC003ActionButton>
          </div>
        )}
        <div className="flex gap-1.5">
          <NC003ActionButton onClick={() => setMode('menu')} ariaLabel="Voltar para menu">
            ← VOLTAR
          </NC003ActionButton>
          <NC003ActionButton onClick={() => setMode('analise')} ariaLabel="Ver análise de desempenho">
            ANÁLISE
          </NC003ActionButton>
          <NC003ActionButton onClick={start} ariaLabel="Continuar para jogo">
            CONTINUAR
          </NC003ActionButton>
        </div>
      </div>
    </div>
  );
}
