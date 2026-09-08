import React, { Ref } from 'react';
import { EmptyState } from './EmptyState';
import { GlobalErrorBanner } from './GlobalErrorBanner';
import { Label } from './Label';
import { Plate } from './Plate';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, LineChart, Line, Cell } from 'recharts';

const CHART_COLORS = ['#06b6d4', '#f59e0b', '#a3e635', '#f472b6', '#818cf8', '#fb923c', '#2dd4bf', '#e879f9'];
const axisStyle = { fontSize: 8, fill: '#c5cdd8' };
const tipStyle = { background: '#0a1418', border: '1px solid #0891b2', borderRadius: 4, fontSize: 10, color: '#cbd5e1' };

const DS = {
  recess: 'inset 0 3px 8px rgba(0,0,0,.85), inset 0 -1px 0 rgba(255,255,255,.06)',
};

interface RankingPanelProps {
  players: Record<string, any>;
  matches: any[];
  player: string | null;
  tab: string;
  setTab: (tab: string) => void;
  DIFF: any;
  TITLES: string[];
  bg: React.CSSProperties;
  css: React.ReactNode;
  shellClass: string;
  shellStyle: React.CSSProperties;
  triggerButtonRef: Ref<HTMLButtonElement>;
  setMode: (mode: string) => void;
}

export function RankingPanel({
  players, matches, player, tab, setTab, DIFF, TITLES,
  bg, css, shellClass, shellStyle, triggerButtonRef, setMode
}: RankingPanelProps) {
  const rows = Object.entries(players).map(([n, d]) => ({
    n, rank: d.rank || 0, total: Object.values(d.best || {}).reduce((a, b) => a + b, 0),
    acc: d.ops ? Math.round((d.hits / d.ops) * 100) : 0, streak: d.streak || 0, games: d.games || 0, wins: d.wins || 0, best: d.best || {}
  })).sort((a, b) => b.total - a.total);

  const medal = i => i === 0 ? '#fbbf24' : i === 1 ? '#cbd5e1' : i === 2 ? '#d97706' : '#64748b';

  return (
    <div className="nc-viewport min-h-screen p-3" style={bg}>{css}
      <GlobalErrorBanner />
      <div className={`${shellClass} mx-auto`} style={shellStyle}>
        <Plate className="p-2 mb-2">
          <div className="text-center mb-1.5"><Label>Ranking dos Operadores</Label></div>
          <div className="flex gap-1">
            {[['geral', 'GERAL'], ['partidas', 'PARTIDAS'], ['graficos', 'GRÁFICOS']].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} aria-label={`Ver aba de ${l.toLowerCase()}`} aria-selected={tab === k} style={{ flex: 1, borderRadius: 4, padding: '6px 0', fontSize: 8, fontWeight: 'bold', letterSpacing: '.08em',
                background: tab === k ? 'linear-gradient(180deg,#0e7490,#0c4a5e)' : 'linear-gradient(180deg,#2a2f35,#1a1e23)',
                color: tab === k ? '#e0f2fe' : '#a1aab8', border: '1px solid #14181c',
                boxShadow: tab === k ? '0 0 10px rgba(6,182,212,.3)' : 'inset 0 2px 4px #000' }}>{l}</button>
            ))}
          </div>
        </Plate>

        {tab === 'geral' && (rows.length === 0
          ? <EmptyState
              icon="📊"
              title="Nenhum registro ainda"
              description="Complete algumas partidas para ver seu ranking"
              size="md"
            />
          : rows.map((r, i) => (
            <Plate key={r.n} className="p-2 mb-1.5" glow={r.n === player ? 'rgba(6,182,212,.35)' : null}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold" style={{ fontSize: 13, color: medal(i) }}>{i + 1}º</span>
                  <span className="font-mono font-bold" style={{ fontSize: 12, color: r.n === player ? '#7dd3fc' : '#e2e8f0' }}>{r.n}</span>
                </div>
                <span style={{ fontSize: 9, color: '#7dd3fc' }}>{TITLES[r.rank]}</span>
              </div>
              <div className="flex gap-1">
                {[['TOTAL', r.total], ['ACERTO', `${r.acc}%`], ['SEQ', r.streak], ['VITÓRIAS', `${r.wins}/${r.games}`]].map(([l, v], j) => (
                  <div key={j} style={{ flex: 1, textAlign: 'center', background: '#0a1418', boxShadow: DS.recess, borderRadius: 4, padding: '3px 0' }}>
                    <div style={{ fontSize: 6.5, color: '#a1aab8', letterSpacing: '.1em' }}>{l}</div>
                    <div className="font-mono font-bold" style={{ fontSize: 10, color: '#cbd5e1' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-1 mt-1">
                {[1,2,3,4,5].map(k => (
                  <div key={k} style={{ flex: 1, textAlign: 'center', borderRadius: 3, padding: '2px 0', background: r.best[k] ? 'rgba(6,182,212,.12)' : 'transparent', border: '1px solid #1c2126' }}>
                    <div style={{ fontSize: 6, color: '#a1aab8' }}>{DIFF[k].name.slice(0, 5)}</div>
                    <div className="font-mono" style={{ fontSize: 9, color: r.best[k] ? '#7dd3fc' : '#3f464e' }}>{r.best[k] || '—'}</div>
                  </div>
                ))}
              </div>
            </Plate>
          )))}

        {tab === 'partidas' && (matches.length === 0
          ? <EmptyState
              icon="🎮"
              title="Nenhuma partida registrada"
              description="Jogue uma partida para ver seu histórico aqui"
              size="md"
            />
          : <Plate className="p-2">
              <div className="flex px-1 pb-1 mb-1" style={{ borderBottom: '1px solid #171b1f' }}>
                <div style={{ width: 22 }}><Label size={6}>#</Label></div>
                <div style={{ flex: 1 }}><Label size={6}>Operador</Label></div>
                <div style={{ width: 42 }}><Label size={6}>Nível</Label></div>
                <div style={{ width: 34, textAlign: 'right' }}><Label size={6}>Pts</Label></div>
                <div style={{ width: 30, textAlign: 'right' }}><Label size={6}>Acer</Label></div>
                <div style={{ width: 26, textAlign: 'right' }}><Label size={6}>Seq</Label></div>
              </div>
              {matches.slice(0, 20).map((m, i) => (
                <div key={m.ts + '' + i} className="flex items-center px-1" style={{ padding: '3px 4px', borderRadius: 3, background: m.n === player ? 'rgba(6,182,212,.10)' : 'transparent' }}>
                  <div style={{ width: 22 }}><span className="font-mono font-bold" style={{ fontSize: 10, color: medal(i) }}>{i + 1}º</span></div>
                  <div style={{ flex: 1, overflow: 'hidden' }}><span className="font-mono" style={{ fontSize: 10, color: m.n === player ? '#7dd3fc' : '#e2e8f0' }}>{m.n}</span></div>
                  <div style={{ width: 42 }}><span style={{ fontSize: 7.5, color: m.d === 5 ? '#f87171' : '#c5cdd8' }}>{DIFF[m.d].name.slice(0, 6)}</span></div>
                  <div style={{ width: 34, textAlign: 'right' }}><span className="font-mono font-bold" style={{ fontSize: 10, color: '#fbbf24' }}>{m.pts}</span></div>
                  <div style={{ width: 30, textAlign: 'right' }}><span className="font-mono" style={{ fontSize: 9, color: m.acc >= 80 ? '#4ade80' : '#c5cdd8' }}>{m.acc}%</span></div>
                  <div style={{ width: 26, textAlign: 'right' }}><span className="font-mono" style={{ fontSize: 9, color: '#c5cdd8' }}>{m.streak}</span></div>
                </div>
              ))}
              <div className="text-center mt-1.5 pt-1.5" style={{ borderTop: '1px solid #171b1f' }}>
                <Label size={6.5}>{matches.length} partidas registradas · exibindo as 20 melhores</Label>
              </div>
            </Plate>)}

        {tab === 'graficos' && (rows.length === 0
          ? <EmptyState
              icon="📈"
              title="Nenhum registro ainda"
              description="Os gráficos aparecerão após algumas partidas"
              size="md"
            />
          : (() => {
            const top = rows.slice(0, 8);
            const radarData = [1,2,3,4,5].map(k => {
              const o = { fase: DIFF[k].name.slice(0, 6) };
              top.slice(0, 4).forEach(r => { o[r.n] = r.best[k] || 0; });
              return o;
            });
            const chrono = [...matches].sort((a, b) => a.ts - b.ts).slice(-12)
              .map((m, i) => ({ i: i + 1, pts: m.pts, acc: m.acc, n: m.n }));
            const byPlayer = {};
            [...matches].sort((a, b) => a.ts - b.ts).forEach(m => { (byPlayer[m.n] = byPlayer[m.n] || []).push(m); });
            const evoNames = top.slice(0, 4).map(r => r.n).filter(n => (byPlayer[n] || []).length > 0);
            const maxLen = Math.min(10, Math.max(0, ...evoNames.map(n => byPlayer[n].length)));
            const evo = [...Array(maxLen)].map((_, i) => {
              const row = { i: i + 1 };
              evoNames.forEach(n => {
                const list = byPlayer[n].slice(-maxLen);
                if (list[i]) row[n] = list[i].pts;
              });
              return row;
            });
            return (
              <>
                <Plate className="p-2 mb-1.5">
                  <Label className="mb-1">Pontuação total acumulada</Label>
                  <ResponsiveContainer width="100%" height={Math.max(90, top.length * 26)}>
                    <BarChart data={top} layout="vertical" margin={{ top: 4, right: 30, bottom: 0, left: 4 }}>
                      <XAxis type="number" tick={axisStyle} axisLine={{ stroke: '#2a3138' }} tickLine={false} />
                      <YAxis type="category" dataKey="n" width={58} tick={axisStyle} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tipStyle} cursor={{ fill: 'rgba(6,182,212,.08)' }} />
                      <Bar dataKey="total" name="Pontos" radius={[0, 3, 3, 0]}>
                        {top.map((r, i) => <Cell key={i} fill={r.n === player ? '#06b6d4' : CHART_COLORS[i % CHART_COLORS.length]} opacity={r.n === player ? 1 : .65} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Plate>

                <Plate className="p-2 mb-1.5">
                  <Label className="mb-1">Taxa de acerto por operador</Label>
                  <ResponsiveContainer width="100%" height={Math.max(90, top.length * 24)}>
                    <BarChart data={top} layout="vertical" margin={{ top: 4, right: 30, bottom: 0, left: 4 }}>
                      <XAxis type="number" domain={[0, 100]} tick={axisStyle} axisLine={{ stroke: '#2a3138' }} tickLine={false} />
                      <YAxis type="category" dataKey="n" width={58} tick={axisStyle} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tipStyle} cursor={{ fill: 'rgba(6,182,212,.08)' }} formatter={v => `${v}%`} />
                      <Bar dataKey="acc" name="Acerto" radius={[0, 3, 3, 0]}>
                        {top.map((r, i) => <Cell key={i} fill={r.acc >= 85 ? '#16a34a' : r.acc >= 70 ? '#ca8a04' : '#dc2626'} opacity={r.n === player ? 1 : .7} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Plate>

                {top.length > 1 && (
                  <Plate className="p-2 mb-1.5">
                    <Label className="mb-1">Alcance por fase · 4 primeiros</Label>
                    <ResponsiveContainer width="100%" height={190}>
                      <RadarChart data={radarData} outerRadius={62}>
                        <PolarGrid stroke="#2a3138" />
                        <PolarAngleAxis dataKey="fase" tick={{ fontSize: 7.5, fill: '#c5cdd8' }} />
                        {top.slice(0, 4).map((r, i) => (
                          <Radar key={r.n} name={r.n} dataKey={r.n} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={.18} strokeWidth={r.n === player ? 2.4 : 1.4} />
                        ))}
                        <Legend wrapperStyle={{ fontSize: 8, color: '#c5cdd8' }} iconSize={7} />
                        <Tooltip contentStyle={tipStyle} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Plate>
                )}

                {chrono.length > 1 && (
                  <Plate className="p-2 mb-1.5">
                    <Label className="mb-1">Evolução geral · pontos e acerto</Label>
                    <ResponsiveContainer width="100%" height={140}>
                      <LineChart data={chrono} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
                        <XAxis dataKey="i" tick={axisStyle} axisLine={{ stroke: '#2a3138' }} tickLine={false} />
                        <YAxis yAxisId="p" tick={{ fontSize: 8, fill: '#06b6d4' }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="a" orientation="right" domain={[0, 100]} tick={{ fontSize: 8, fill: '#f59e0b' }} axisLine={false} tickLine={false} width={26} />
                        <Tooltip contentStyle={tipStyle} labelFormatter={v => `Partida ${v} · ${(chrono[v - 1] || {}).n || ''}`} formatter={(val, name) => [name === 'Acerto %' ? `${val}%` : val, name]} />
                        <Line yAxisId="p" type="monotone" dataKey="pts" name="Pontos" stroke="#06b6d4" strokeWidth={2} dot={{ r: 2.5, fill: '#06b6d4' }} />
                        <Line yAxisId="a" type="monotone" dataKey="acc" name="Acerto %" stroke="#f59e0b" strokeWidth={1.6} strokeDasharray="4 3" dot={{ r: 2, fill: '#f59e0b' }} />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="text-center"><Label size={6.5}>Eixo esquerdo · pontos   |   direito · acerto %</Label></div>
                  </Plate>
                )}

                {evo.length > 1 && evoNames.length > 0 && (
                  <Plate className="p-2 mb-1.5">
                    <Label className="mb-1">Progresso individual · pontos por partida</Label>
                    <ResponsiveContainer width="100%" height={150}>
                      <LineChart data={evo} margin={{ top: 8, right: 6, bottom: 0, left: -20 }}>
                        <XAxis dataKey="i" tick={axisStyle} axisLine={{ stroke: '#2a3138' }} tickLine={false} label={{ value: 'partida do operador', position: 'insideBottom', offset: -2, style: { fontSize: 7, fill: '#4b5563' } }} />
                        <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tipStyle} labelFormatter={v => `Partida ${v}`} />
                        <Legend wrapperStyle={{ fontSize: 8, color: '#c5cdd8' }} iconSize={7} />
                        {evoNames.map((n, i) => (
                          <Line key={n} type="monotone" dataKey={n} name={n} stroke={CHART_COLORS[i % CHART_COLORS.length]}
                            strokeWidth={n === player ? 2.6 : 1.5} dot={{ r: n === player ? 3 : 2, fill: CHART_COLORS[i % CHART_COLORS.length] }} connectNulls />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="text-center"><Label size={6.5}>Cada linha começa na 1ª partida do próprio operador</Label></div>
                  </Plate>
                )}
              </>
            );
          })())}

        <button ref={triggerButtonRef} onClick={() => setMode(player ? 'menu' : 'login')} className="w-full mt-1.5" aria-label="Voltar para menu anterior">
          <Plate className="py-2 text-center"><Label>Voltar</Label></Plate>
        </button>
      </div>
    </div>
  );
}
