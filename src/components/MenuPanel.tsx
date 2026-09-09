import React from 'react';
import { tokens } from '@design/tokens';
import { Volume2, VolumeX } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Plate } from './Plate';
import { Label } from './Label';
import { Lcd } from './Lcd';
import { GlobalErrorBanner } from './GlobalErrorBanner';

const TITLES = ['👷 Estagiário', '📋 Téc. Competente', '🔧 Op. Exemplar', '⭐ Eng. Nuclear', '🎖️ Dir. Segurança', '🏅 Herói Nacional'];
const DIFF = {
  1: { name: 'TRAINEE', sub: 'Primeiro dia', time: 35 },
  2: { name: 'JÚNIOR', sub: 'Aprendendo', time: 30 },
  3: { name: 'PLENO', sub: 'Turno normal', time: 25 },
  4: { name: 'SÊNIOR', sub: 'Crise nacional', time: 20 },
  5: { name: 'CHERNOBYL', sub: 'Boa sorte...', time: 12 }
};

interface MenuPanelProps {
  player: string | null;
  players: Record<string, any>;
  diff: number;
  setDiff: (value: number) => void;
  snd: boolean;
  setSnd: (value: boolean) => void;
  setMode: (mode: string) => void;
  setPlayer: (name: string | null) => void;
  initA: () => void;
  bg: React.CSSProperties;
  css: React.ReactNode;
  shellClass: string;
  shellStyle: React.CSSProperties;
}

export function MenuPanel({
  player, players, diff, setDiff, snd, setSnd, setMode, setPlayer, initA,
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
      <GlobalErrorBanner />
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
              <button onClick={() => setMode('analise')} aria-label="Ir para análise de desempenho">
                <div className="rounded text-center" style={{ padding: '4px 10px', fontSize: tokens.typography.fontSize.micro, letterSpacing: '.1em', background: 'linear-gradient(180deg,#0e7490,#0c4a5e)', color: '#e0f2fe', border: '1px solid #083344' }}>
                  ANÁLISE
                </div>
              </button>
              <button onClick={() => setMode('ranking')} aria-label="Ir para ranking de operadores">
                <div className="rounded text-center" style={{ padding: '4px 10px', fontSize: tokens.typography.fontSize.micro, letterSpacing: '.1em', background: 'linear-gradient(180deg,#3f464e,#23282e)', color: '#cbd5e1', border: '1px solid #14181c' }}>
                  RANKING
                </div>
              </button>
              <button
                onClick={() => {
                  setPlayer(null);
                  setMode('login');
                }}
                aria-label="Trocar operador"
              >
                <div className="rounded text-center" style={{ padding: '4px 10px', fontSize: tokens.typography.fontSize.micro, letterSpacing: '.1em', background: 'linear-gradient(180deg,#2a2f35,#1a1e23)', color: '#c5cdd8', border: '1px solid #14181c' }}>
                  TROCAR
                </div>
              </button>
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

        <div className="flex gap-2 mt-3">
          <button onClick={() => { initA(); setSnd(!snd); }} style={{ flex: 1 }} aria-label={snd ? 'Desativar som' : 'Ativar som'} aria-pressed={snd}>
            <Plate className="py-2 flex items-center justify-center gap-2">
              {snd ? <Volume2 size={13} color="#c5cdd8" /> : <VolumeX size={13} color="#c5cdd8" />}
              <Label>{snd ? 'Áudio On' : 'Áudio Off'}</Label>
            </Plate>
          </button>
        </div>
      </div>
    </div>
  );
}
