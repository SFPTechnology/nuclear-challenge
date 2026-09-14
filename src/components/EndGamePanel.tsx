import React from 'react';
import { tokens } from '@design/tokens';
import { EmptyState } from './EmptyState';
import { Plate } from './Plate';
import { Label } from './Label';
import { GlobalErrorBanner } from './GlobalErrorBanner';
import type { AppMode } from '@hooks/useUIState';

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

const actionTones = {
  info: { background: 'linear-gradient(180deg,#0e7490,#155e75)', border: '#0e7490', color: '#e0f2fe', glow: 'rgba(6,182,212,.3)' },
  success: { background: 'linear-gradient(180deg,#16a34a,#15803d)', border: '#15803d', color: '#dcfce7', glow: 'rgba(34,197,94,.32)' },
  warning: { background: 'linear-gradient(180deg,#b45309,#78350f)', border: '#b45309', color: '#fef3c7', glow: 'rgba(245,158,11,.3)' },
} as const;

function EndGameActionButton({
  children,
  onClick,
  ariaLabel,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
  tone: keyof typeof actionTones;
}) {
  const colors = actionTones[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="transition-transform active:translate-y-px"
      style={{
        flex: 1,
        minHeight: 40,
        padding: '10px 8px',
        borderRadius: tokens.borderRadius.md,
        border: `1px solid ${colors.border}`,
        background: colors.background,
        boxShadow: `0 0 14px ${colors.glow},0 1px 0 rgba(255,255,255,.18) inset,0 3px 6px #000`,
        color: colors.color,
        fontSize: tokens.typography.fontSize.xs0,
        fontWeight: tokens.typography.fontWeight.bold,
        letterSpacing: tokens.typography.letterSpacing.wide,
      }}
    >
      {children}
    </button>
  );
}

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
  setMode: (mode: AppMode) => void;
  start: () => void;
  resumeGame: () => void;
  continueGame: () => void;
  bg: React.CSSProperties;
  css: React.ReactNode;
  shellClass: string;
  shellStyle: React.CSSProperties;
  storeErr: boolean;
}

export function EndGamePanel({
  mode, diff, player, rank, elapsed, pts, tot, corr, bestStrk, integrity, players,
  setMode, start, resumeGame, continueGame, bg, css, shellClass, shellStyle, storeErr
}: EndGamePanelProps) {
  const [isRestartConfirmationOpen, setRestartConfirmationOpen] = React.useState(false);

  const requestRestart = () => setRestartConfirmationOpen(true);
  const confirmRestart = () => {
    setRestartConfirmationOpen(false);
    start();
  };

  return (
    <div className="nc-viewport min-h-screen p-3" style={bg}>{css}
      <GlobalErrorBanner visible={storeErr} />
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
          <EndGameActionButton onClick={() => setMode('analise')} ariaLabel="Ver análise de desempenho" tone="info">
            ANÁLISE
          </EndGameActionButton>
          <EndGameActionButton onClick={() => setMode('ranking')} ariaLabel="Ver ranking de operadores" tone="info">
            RANKING
          </EndGameActionButton>
        </div>

        <div className="flex gap-1.5">
          <EndGameActionButton onClick={() => setMode('menu')} ariaLabel="Voltar para menu principal" tone="info">
            MENU
          </EndGameActionButton>
          {mode === 'pause' && (
            <EndGameActionButton onClick={resumeGame} ariaLabel="Retomar partida pausada" tone="success">
              RETOMAR
            </EndGameActionButton>
          )}
          {mode === 'win' && diff < 5 && (
            <EndGameActionButton onClick={continueGame} ariaLabel="Continuar para próximo nível" tone="success">
              CONTINUAR
            </EndGameActionButton>
          )}
          <EndGameActionButton onClick={requestRestart} ariaLabel="Solicitar reinício da partida no mesmo nível" tone="info">
            REINICIAR
          </EndGameActionButton>
        </div>
      </div>

      {isRestartConfirmationOpen && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="restart-confirmation-title"
          aria-describedby="restart-confirmation-description"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setRestartConfirmationOpen(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: tokens.zIndex.modal,
            display: 'grid',
            placeItems: 'center',
            padding: tokens.spacing.md,
            background: 'rgba(0,0,0,.72)',
          }}
        >
          <div data-testid="restart-confirmation-card" style={{ width: '24rem', maxWidth: '100%' }}>
          <Plate className="w-full p-4" glow="rgba(248,113,113,.35)">
            <h2
              id="restart-confirmation-title"
              className="m-0 font-bold"
              style={{ fontSize: tokens.typography.fontSize.base, color: tokens.visual.status.danger }}
            >
              Reiniciar turno?
            </h2>
            <p
              id="restart-confirmation-description"
              className="mt-2 mb-4"
              style={{ fontSize: tokens.typography.fontSize.sm, lineHeight: tokens.typography.lineHeight.normal, color: tokens.visual.status.muted }}
            >
              O progresso do turno atual será abandonado e uma nova partida começará no mesmo nível.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRestartConfirmationOpen(false)}
                autoFocus
                style={{ flex: 1 }}
                aria-label="Cancelar reinício e manter turno atual"
              >
                <Plate className="py-2 text-center"><Label>Cancelar</Label></Plate>
              </button>
              <button
                type="button"
                onClick={confirmRestart}
                style={{
                  flex: 1,
                  borderRadius: tokens.borderRadius.md,
                  border: tokens.borders.danger,
                  background: 'linear-gradient(180deg,#991b1b,#450a0a)',
                  color: '#fee2e2',
                  fontSize: tokens.typography.fontSize.xs0,
                  fontWeight: tokens.typography.fontWeight.bold,
                  letterSpacing: tokens.typography.letterSpacing.wide,
                }}
                aria-label="Confirmar reinício e abandonar turno atual"
              >
                REINICIAR
              </button>
            </div>
          </Plate>
          </div>
        </div>
      )}
    </div>
  );
}
