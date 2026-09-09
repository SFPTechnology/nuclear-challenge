import React from 'react';
import { tokens } from '@design/tokens';
import { EmptyState } from './EmptyState';
import { Plate } from './Plate';
import { Label } from './Label';

const DIFF = {
  1: { name: 'TRAINEE' },
  2: { name: 'JÚNIOR' },
  3: { name: 'PLENO' },
  4: { name: 'SÊNIOR' },
  5: { name: 'CHERNOBYL' }
};

const DS = {
  recess: 'inset 0 3px 8px rgba(0,0,0,.85), inset 0 -1px 0 rgba(255,255,255,.06)',
};

interface EndGamePanelProps {
  mode: 'win' | 'lose' | 'quit' | 'pause';
  diff: number;
  player: string;
  rank: string;
  elapsed: number;
  pts: number;
  tot: number;
  corr: number;
  bestStrk: number;
  integrity: number;
  players: Record<string, any>;
  setMode: (mode: string) => void;
  start: () => void;
  resumeGame: () => void;
  continueGame: () => void;
  bg: React.CSSProperties;
  css: React.ReactNode;
  shellClass: string;
  shellStyle: React.CSSProperties;
}

export function EndGamePanel({
  mode, diff, player, rank, elapsed, pts, tot, corr, bestStrk, integrity, players,
  setMode, start, resumeGame, continueGame, bg, css, shellClass, shellStyle
}: EndGamePanelProps) {
  return (
    <div className="nc-viewport min-h-screen p-3" style={bg}>{css}
      <div className={`${shellClass} mx-auto`} style={shellStyle}>
        <Plate className="p-4 text-center mb-2">
          <div style={{ fontSize: tokens.typography.fontSize['4xl_'] }}>
            {mode === 'win' ? '✅' : mode === 'lose' ? '💥' : mode === 'pause' ? '⏸️' : '🛑'}
          </div>
          <div
            className="font-bold"
            style={{
              fontSize: tokens.typography.fontSize.base,
              letterSpacing: '.15em',
              color:
                mode === 'win'
                  ? '#4ade80'
                  : mode === 'lose'
                    ? '#f87171'
                    : mode === 'pause'
                      ? '#fbbf24'
                      : '#fbbf24'
            }}
          >
            {mode === 'win'
              ? 'REATOR ESTABILIZADO'
              : mode === 'lose'
                ? 'MELTDOWN'
                : mode === 'pause'
                  ? 'TURNO PAUSADO'
                  : 'TURNO ENCERRADO'}
          </div>
          <div
            className="inline-block mt-2 rounded"
            style={{ padding: '4px 12px', background: '#0a1418', boxShadow: DS.recess, color: '#7dd3fc', fontSize: tokens.typography.fontSize.xs0 }}
          >
            {rank}
          </div>
        </Plate>

        {mode === 'win' && diff < 5 && (
          <Plate className="p-3 mb-2 text-center" glow="rgba(6,182,212,.3)">
            <Label className="mb-1">Promoção Disponível</Label>
            <div style={{ fontSize: tokens.typography.fontSize.xs, color: '#cbd5e1' }}>
              Avance para <b style={{ color: '#7dd3fc' }}>{(DIFF as any)[Math.min(5, diff + 1)].name}</b>
            </div>
            <Label className="mt-1">Nova meta · {1000 * (diff + 1)} pts</Label>
          </Plate>
        )}

        {tot === 0 ? (
          <div className="mb-2">
            <EmptyState
              icon="📋"
              title="Nenhuma estatística registrada"
              description="O turno terminou antes de qualquer operação ser respondida, portanto não há relatório de desempenho."
              actionLabel="Jogar novamente"
              onAction={start}
              size="md"
              testId="empty-state-endgame"
            />
          </div>
        ) : (
        <Plate className="p-3 mb-2">
          <div className="text-center mb-2 pb-2" style={{ borderBottom: '1px solid #171b1f' }}>
            <Label>Relatório de Desempenho</Label>
          </div>
          {[
            ['Operador', player],
            ['Nível', (DIFF as any)[diff].name],
            ['Título', rank],
            ['Tempo', `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`],
            ['Pontuação', pts],
            ['Recorde no nível', (players[player] && players[player].best && players[player].best[diff]) || pts],
            ['Operações', tot],
            ['Corretas', corr],
            ['Erradas', tot - corr],
            ['Taxa de acerto', `${tot ? Math.round((corr / tot) * 100) : 0}%`],
            ['Maior sequência', bestStrk],
            ['Integridade final', `${integrity}%`]
          ].map(([k, v], i) => (
            <div key={i} className="flex justify-between items-center py-0.5">
              <Label>{k}</Label>
              <span className="font-mono" style={{ fontSize: tokens.typography.fontSize.xs, color: '#cbd5e1' }}>
                {v}
              </span>
            </div>
          ))}
        </Plate>
        )}

        <div className="flex gap-1.5 mb-1.5">
          <button onClick={() => setMode('analise')} style={{ flex: 1 }} aria-label="Ver análise de desempenho">
            <Plate className="py-2 text-center">
              <Label>Análise de Desempenho</Label>
            </Plate>
          </button>
          <button onClick={() => setMode('ranking')} style={{ flex: 1 }} aria-label="Ver ranking de operadores">
            <Plate className="py-2 text-center">
              <Label>Ranking</Label>
            </Plate>
          </button>
        </div>

        <div className="flex gap-1.5">
          <button onClick={() => setMode('menu')} style={{ flex: 1 }} aria-label="Voltar para menu principal">
            <Plate className="py-2 text-center">
              <Label>Menu</Label>
            </Plate>
          </button>
          {mode === 'pause' && (
            <button type="button" onClick={resumeGame} style={{ flex: 1 }} aria-label="Retomar partida pausada">
              <div
                className="rounded-md text-center font-bold"
                style={{
                  padding: '10px 0',
                  fontSize: tokens.typography.fontSize.xs0,
                  background: 'linear-gradient(180deg,#16a34a,#15803d)',
                  boxShadow: '0 0 14px rgba(34,197,94,.4),0 3px 6px #000',
                  color: '#dcfce7'
                }}
              >
                RETOMAR
              </div>
            </button>
          )}
          {mode === 'win' && diff < 5 && (
            <button onClick={continueGame} style={{ flex: 1 }} aria-label="Continuar para próximo nível">
              <div
                className="rounded-md text-center font-bold"
                style={{
                  padding: '10px 0',
                  fontSize: tokens.typography.fontSize.xs0,
                  background: 'linear-gradient(180deg,#16a34a,#15803d)',
                  boxShadow: '0 0 14px rgba(34,197,94,.4),0 3px 6px #000',
                  color: '#dcfce7'
                }}
              >
                CONTINUAR
              </div>
            </button>
          )}
          <button onClick={start} style={{ flex: 1 }} aria-label="Reiniciar partida no mesmo nível">
            <div
              className="rounded-md text-center font-bold"
              style={{
                padding: '10px 0',
                fontSize: tokens.typography.fontSize.xs0,
                background: 'linear-gradient(180deg,#0e7490,#155e75)',
                boxShadow: '0 3px 6px #000',
                color: '#e0f2fe'
              }}
            >
              REINICIAR
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
