import React from 'react';
import { tokens } from '@design/tokens';
import { Volume2, VolumeX } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Plate } from './Plate';
import { Label } from './Label';
import { Lcd } from './Lcd';
import { GlobalErrorBanner } from './GlobalErrorBanner';
import type { AppMode } from '@hooks/useUIState';

const TITLES = ['👷 Estagiário', '📋 Téc. Competente', '🔧 Op. Exemplar', '⭐ Eng. Nuclear', '🎖️ Dir. Segurança', '🏅 Herói Nacional'];
const DIFF = {
  1: { name: 'TRAINEE', sub: 'Primeiro dia', time: 35 },
  2: { name: 'JÚNIOR', sub: 'Aprendendo', time: 30 },
  3: { name: 'PLENO', sub: 'Turno normal', time: 25 },
  4: { name: 'SÊNIOR', sub: 'Crise nacional', time: 20 },
  5: { name: 'CHERNOBYL', sub: 'Boa sorte...', time: 12 }
};

const menuActionTones = {
  primary: { background: 'linear-gradient(180deg,#0e7490,#155e75 55%,#0c4a5e)', border: '#083344', color: '#e0f2fe', glow: 'rgba(6,182,212,.35)' },
  secondary: { background: 'linear-gradient(180deg,#46515d,#2c3540 55%,#1c2229)', border: '#14181c', color: '#e2e8f0', glow: 'rgba(148,163,184,.18)' },
} as const;

function MenuActionButton({
  children,
  onClick,
  ariaLabel,
  tone = 'secondary',
  fullWidth = false,
  pressed,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
  tone?: keyof typeof menuActionTones;
  fullWidth?: boolean;
  pressed?: boolean;
}) {
  const colors = menuActionTones[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={pressed}
      className={`transition-transform active:translate-y-px${fullWidth ? ' w-full' : ''}`}
      style={{
        width: fullWidth ? '100%' : undefined,
        minHeight: 44,
        padding: '9px 12px',
        borderRadius: tokens.borderRadius.md,
        border: `1px solid ${colors.border}`,
        background: colors.background,
        boxShadow: `0 1px 0 rgba(255,255,255,.2) inset,0 4px 8px #000,0 0 16px ${colors.glow}`,
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

interface MenuPanelProps {
  player: string | null;
  players: Record<string, any>;
  diff: number;
  setDiff: (value: number) => void;
  snd: boolean;
  setSnd: (value: boolean) => void;
  setMode: (mode: AppMode) => void;
  resumeAvailable?: boolean;
  resumeGame?: () => void;
  storeErr: boolean;
  setPlayer: (name: string | null) => void;
  initA: () => void;
  bg: React.CSSProperties;
  css: React.ReactNode;
  shellClass: string;
  shellStyle: React.CSSProperties;
}

export function MenuPanel({
  player, players, diff, setDiff, snd, setSnd, setMode, setPlayer, initA, resumeAvailable = false, resumeGame, storeErr,
  bg, css, shellClass, shellStyle
}: MenuPanelProps) {
  const operatorList = Object.keys(players);
  const menuPlayer: string = player || (operatorList.length > 0 ? operatorList[0] : '');

  if (!menuPlayer) {
    setMode('login');
    return null;
  }

  if (!player) setPlayer(menuPlayer);

  // UX-D10: a brand-new operator has no history. Say so explicitly instead of
  // rendering a level list whose record slots are all silently blank.
  const menuRecord = players[menuPlayer];
  const hasSavedMatches = Boolean(menuRecord && (menuRecord.games || 0) > 0);

  return (
    <div className="nc-viewport min-h-screen p-3" style={bg}>{css}
      <GlobalErrorBanner visible={storeErr} />
      <div className={`${shellClass} mx-auto`} style={shellStyle}>
        <Plate className="p-3 mb-2">
          <div className="flex justify-between items-center">
            <div>
              <Label size={7}>Operador</Label>
              <div className="font-mono font-bold" style={{ fontSize: tokens.typography.fontSize.sm, color: '#7dd3fc', letterSpacing: '.06em' }}>
                {menuPlayer}
              </div>
              <div style={{ fontSize: tokens.typography.fontSize.tiny, color: '#c5cdd8' }}>
                {TITLES[(players[menuPlayer] && players[menuPlayer].rank) || 0]}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <MenuActionButton onClick={() => setMode('analise')} ariaLabel="Ir para análise de desempenho" tone="primary">
                ANÁLISE
              </MenuActionButton>
              <MenuActionButton onClick={() => setMode('ranking')} ariaLabel="Ir para ranking de operadores">
                RANKING
              </MenuActionButton>
              <MenuActionButton
                onClick={() => {
                  setPlayer(null);
                  setMode('login');
                }}
                ariaLabel="Trocar operador"
              >
                TROCAR
              </MenuActionButton>
            </div>
          </div>
        </Plate>

        {!hasSavedMatches && (
          <div className="mb-2">
            <EmptyState
              icon="🗂️"
              title="Nenhuma partida salva"
              description="Você ainda não concluiu nenhum turno. Escolha um nível abaixo para registrar seu primeiro resultado."
              size="sm"
              testId="empty-state-menu"
            />
          </div>
        )}

        {resumeAvailable && resumeGame && (
          <div className="mb-2">
            <MenuActionButton onClick={resumeGame} ariaLabel="Retornar ao jogo" tone="primary" fullWidth>
              RETORNAR AO JOGO
            </MenuActionButton>
          </div>
        )}

        <div className="space-y-1.5">
          {Object.entries(DIFF).map(([k, v]) => {
            const rec = players[menuPlayer] && players[menuPlayer].best ? players[menuPlayer].best[k] : null;
            return (
              <button key={k} onClick={() => { setDiff(+k); initA(); setMode('nc003'); }} className="w-full text-left" aria-label={`Selecionar nível ${v.name} - ${v.sub}`}>
                <Plate className="px-3 py-2" glow={diff === +k ? 'rgba(6,182,212,.4)' : undefined}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background:
                            diff === +k
                              ? 'radial-gradient(circle at 35% 30%,#ffffff99,#06b6d4 45%,#0891b2)'
                              : '#2a2f35',
                          boxShadow: diff === +k ? '0 0 8px #06b6d4' : 'inset 0 -1px 2px #000'
                        }}
                      />
                      <span className="font-bold" style={{ fontSize: tokens.typography.fontSize.xs, color: +k === 5 ? '#f87171' : '#e2e8f0' }}>
                        {v.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {rec ? <span style={{ fontSize: tokens.typography.fontSize.micro, color: '#fbbf24' }}>★ {rec}</span> : null}
                      <Lcd value={v.time} unit="s" size={12} />
                    </div>
                  </div>
                  <Label className="mt-1 ml-5">{v.sub}</Label>
                </Plate>
              </button>
            );
          })}
        </div>

        <div className="mt-3">
          <MenuActionButton onClick={() => { initA(); setSnd(!snd); }} ariaLabel={snd ? 'Desativar som' : 'Ativar som'} pressed={snd} fullWidth>
            <span className="inline-flex items-center justify-center gap-2">
              {snd ? <Volume2 size={14} /> : <VolumeX size={14} />}
              {snd ? 'ÁUDIO ON' : 'ÁUDIO OFF'}
            </span>
          </MenuActionButton>
        </div>
      </div>
    </div>
  );
}
