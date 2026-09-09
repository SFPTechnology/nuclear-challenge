import React from 'react';
import { tokens } from '@design/tokens';
import { EmptyState } from './EmptyState';
import { Label } from './Label';
import { Plate } from './Plate';
import { OperatorExclusionDialog } from './OperatorExclusionDialog';

const TITLES = ['👷 Estagiário', '📋 Téc. Competente', '🔧 Op. Exemplar', '⭐ Eng. Nuclear', '🎖️ Dir. Segurança', '🏅 Herói Nacional'];

const DS = {
  recess: 'inset 0 3px 8px rgba(0,0,0,.85), inset 0 -1px 0 rgba(255,255,255,.06)',
};

interface LoginPanelProps {
  nameInput: string;
  setNameInput: (value: string) => void;
  players: Record<string, any>;
  loading: boolean;
  player: string | null;
  setPlayer: (name: string) => void;
  setMode: (mode: string) => void;
  createPlayer: () => void;
  storeErr: boolean;
  selectedOperatorToExclude: { id: string; name: string } | null;
  setSelectedOperatorToExclude: (op: any) => void;
  handleExcludeOperator: (id: string) => void;
  bg: React.CSSProperties;
  css: React.ReactNode;
  shellClass: string;
  shellStyle: React.CSSProperties;
}

export function LoginPanel({
  nameInput, setNameInput, players, loading, player, setPlayer, setMode,
  createPlayer, storeErr, selectedOperatorToExclude, setSelectedOperatorToExclude,
  handleExcludeOperator, bg, css, shellClass, shellStyle
}: LoginPanelProps) {
  return (
    <div className="nc-viewport min-h-screen p-3 flex flex-col justify-center" style={bg}>{css}
      <div className={`${shellClass} mx-auto w-full`} style={shellStyle}>
        <Plate className="p-4 mb-3 text-center">
          <div style={{ fontSize: tokens.typography.fontSize['4xl_'] }}>☢️</div>
          <div className="font-bold" style={{ fontSize: tokens.typography.fontSize.lg, letterSpacing: '.2em', color: '#cbd5e1' }}>USINA NUCLEAR</div>
          <Label className="mt-1">Identificação do Operador</Label>
        </Plate>

        <Plate className="p-3 mb-2">
          <Label className="mb-1.5">Novo Crachá</Label>
          <div className="flex gap-1.5">
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createPlayer()}
              placeholder="NOME"
              maxLength={14}
              className="flex-1 rounded font-mono focus:outline-none"
              style={{
                padding: '7px 10px',
                fontSize: tokens.typography.fontSize.xs_lg,
                background: 'linear-gradient(180deg,#0a1418,#050b0e)',
                boxShadow: DS.recess,
                color: '#7dd3fc',
                border: '1px solid #1c2126',
                letterSpacing: '.08em'
              }}
            />
            <button
              onClick={createPlayer}
              disabled={!nameInput.trim()}
              className="rounded font-bold"
              aria-label={`Criar operador: ${nameInput.trim() || 'nome requerido'}`}
              style={{
                padding: '0 16px',
                fontSize: tokens.typography.fontSize.xs0,
                letterSpacing: '.1em',
                background: nameInput.trim()
                  ? 'linear-gradient(180deg,#0e7490,#0c4a5e)'
                  : 'linear-gradient(180deg,#2a2f35,#1a1e23)',
                color: nameInput.trim() ? '#e0f2fe' : '#4b5563',
                border: '1px solid #083344',
                boxShadow: '0 3px 5px #000'
              }}
            >
              ENTRAR
            </button>
          </div>
        </Plate>

        <Plate className="p-3">
          <div className="flex justify-between items-center mb-1.5">
            <Label>Operadores Registrados</Label>
            <span style={{ fontSize: tokens.typography.fontSize.micro, color: '#a1aab8' }}>{Object.keys(players).length}</span>
          </div>

          {loading ? (
            <div style={{ fontSize: tokens.typography.fontSize.xs0, color: '#a1aab8' }}>Consultando registros…</div>
          ) : Object.keys(players).length === 0 ? (
            <EmptyState
              icon="👤"
              title="Nenhum operador cadastrado"
              description="Crie um novo operador acima para começar"
              size="md"
            />
          ) : (
            <div className="space-y-1">
              {Object.entries(players)
                .sort(
                  (a: [string, any], b: [string, any]) =>
                    (b[1].rank - a[1].rank) ||
                    (Math.max(...(Object.values(b[1].best || {}) as number[]), 0) -
                      Math.max(...(Object.values(a[1].best || {}) as number[]), 0))
                )
                .map(([n, d]: [string, any]) => (
                  <div key={n} className="flex gap-1 items-center">
                    <button
                      onClick={() => {
                        setPlayer(n);
                        setMode('menu');
                      }}
                      className="flex-1"
                      aria-label={`Selecionar operador ${n}, rank ${TITLES[d.rank || 0]}`}
                    >
                      <div
                        className="flex justify-between items-center rounded"
                        style={{
                          padding: '6px 9px',
                          background: 'linear-gradient(180deg,#0a1418,#070f13)',
                          boxShadow: DS.recess,
                          border: player === n ? '1px solid #0891b2' : '1px solid #1c2126'
                        }}
                      >
                        <span className="font-mono font-bold" style={{ fontSize: 12, color: '#e2e8f0', letterSpacing: '.06em' }}>
                          {n}
                        </span>
                        <span style={{ fontSize: tokens.typography.fontSize.tiny, color: '#7dd3fc' }}>{TITLES[d.rank || 0]}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedOperatorToExclude({ id: n, name: n })}
                      aria-label={`Remover operador ${n}`}
                      style={{
                        padding: '6px 9px',
                        borderRadius: 4,
                        background: 'linear-gradient(180deg,#7f1d1d,#450a0a)',
                        border: '1px solid #7f1d1d',
                        color: '#fecaca',
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
            </div>
          )}

          {Object.keys(players).length > 1 && (
            <button
              onClick={() => setMode('ranking')}
              className="w-full mt-2"
              aria-label="Comparar desempenho entre operadores"
            >
              <div
                className="rounded text-center font-bold"
                style={{
                  padding: '7px 0',
                  fontSize: 10,
                  letterSpacing: '.12em',
                  background: 'linear-gradient(180deg,#3f464e,#23282e)',
                  color: '#cbd5e1',
                  border: '1px solid #14181c'
                }}
              >
                COMPARAR DESEMPENHO
              </div>
            </button>
          )}

          {storeErr && (
            <div style={{ fontSize: tokens.typography.fontSize.tiny, color: '#f59e0b', marginTop: 6, lineHeight: 1.4 }}>
              ⚠ O armazenamento não respondeu. Os cadastros valem só nesta sessão e serão perdidos ao recarregar.
            </div>
          )}
        </Plate>
      </div>

      {selectedOperatorToExclude && (
        <OperatorExclusionDialog
          operatorName={selectedOperatorToExclude.name}
          operatorId={selectedOperatorToExclude.id}
          onConfirm={handleExcludeOperator}
          onCancel={() => setSelectedOperatorToExclude(null)}
        />
      )}
    </div>
  );
}
