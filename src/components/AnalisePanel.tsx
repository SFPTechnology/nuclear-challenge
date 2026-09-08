import React, { Ref } from 'react';
import { EmptyState } from './EmptyState';
import { GlobalErrorBanner } from './GlobalErrorBanner';
import { Label } from './Label';
import { Plate } from './Plate';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { localDay } from '@utils/viewport';

const DS = {
  recess: 'inset 0 3px 8px rgba(0,0,0,.85), inset 0 -1px 0 rgba(255,255,255,.06)',
};

const axisStyle = { fontSize: 8, fill: '#c5cdd8' };
const tipStyle = { background: '#0a1418', border: '1px solid #0891b2', borderRadius: 4, fontSize: 10, color: '#cbd5e1' };

interface AnalisePanelProps {
  player: string | null;
  players: Record<string, any>;
  calendarCursor: Date;
  setCalendarCursor: (date: Date) => void;
  bg: React.CSSProperties;
  css: React.ReactNode;
  shellClass: string;
  shellStyle: React.CSSProperties;
  setMode: (mode: string) => void;
}

export function AnalisePanel({
  player, players, calendarCursor, setCalendarCursor,
  bg, css, shellClass, shellStyle, setMode
}: AnalisePanelProps) {
  const S = (players[player] && players[player].stats) || { tabs: {}, ops: {}, forms: {} };
  const pctOf = v => v && (v.h + v.m) > 0 ? Math.round((v.h / (v.h + v.m)) * 100) : null;
  const colOf = p => p === null ? '#2a2f35' : p >= 90 ? '#16a34a' : p >= 75 ? '#65a30d' : p >= 60 ? '#ca8a04' : p >= 40 ? '#ea580c' : '#dc2626';
  const tabRows = Object.entries(S.tabs).map(([k, v]) => ({ k: +k, n: v.h + v.m, p: pctOf(v), h: v.h, m: v.m })).filter(r => r.n >= 3);
  const fracos = [...tabRows].sort((a, b) => a.p - b.p).slice(0, 3);
  const fortes = [...tabRows].sort((a, b) => b.p - a.p).slice(0, 3);
  const totalOps = Object.values(S.ops).reduce((a, v) => a + v.h + v.m, 0);
  const studyLog = (players[player] && players[player].studyLog) || {};
  const cursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1);
  const monthStart = cursor.getDay();
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const calendarCells = [...Array(monthStart + daysInMonth)].map((_, i) => i < monthStart ? null : localDay(new Date(cursor.getFullYear(), cursor.getMonth(), i - monthStart + 1)));
  const monthDays = calendarCells.filter(Boolean).map(d => ({ ...d, record: studyLog[d.key] })).filter(d => d.record);
  const monthTotal = monthDays.reduce((sum, d) => sum + d.record.total, 0);
  const monthHits = monthDays.reduce((sum, d) => sum + d.record.hits, 0);
  const priority = Object.entries(studyLog).reduce((rows, [, day]) => {
    Object.entries(day.tables || {}).forEach(([table, value]) => {
      const total = value.hits + value.misses;
      if (total < 2) return;
      const current = rows.find(r => r.key === `tab-${table}`) || { key: `tab-${table}`, label: `Tabuada do ${table}`, hits: 0, misses: 0 };
      current.hits += value.hits; current.misses += value.misses;
      if (!rows.includes(current)) rows.push(current);
    });
    Object.entries(day.types || {}).forEach(([type, value]) => {
      const total = value.hits + value.misses;
      if (total < 2) return;
      const labels = { multiplication: 'Multiplicacao', division: 'Divisao', direct: 'Conta direta', inverse: 'Conta inversa' };
      const current = rows.find(r => r.key === `type-${type}`) || { key: `type-${type}`, label: labels[type], hits: 0, misses: 0 };
      current.hits += value.hits; current.misses += value.misses;
      if (!rows.includes(current)) rows.push(current);
    });
    return rows;
  }, []).map(row => ({ ...row, total: row.hits + row.misses, accuracy: Math.round((row.hits / Math.max(1, row.hits + row.misses)) * 100) }))
    .sort((a, b) => (b.misses - a.misses) || (a.accuracy - b.accuracy) || (b.total - a.total)).slice(0, 6);
  const monthLabel = cursor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const FORM = { result: 'Resultado oculto · 7 × 8 = ?', left: 'Fator esquerdo · ? × 8 = 56', right: 'Fator direito · 7 × ? = 56' };

  return (
    <div className="nc-viewport min-h-screen p-3" style={bg}>{css}
      <GlobalErrorBanner />
      <div className={`${shellClass} mx-auto`} style={shellStyle}>
        <Plate className="p-3 mb-2 text-center">
          <Label>Análise de Desempenho</Label>
          <div className="font-mono font-bold mt-1" style={{ fontSize: 13, color: '#7dd3fc' }}>{player}</div>
          <div style={{ fontSize: 9, color: '#a1aab8' }}>{totalOps} operações analisadas</div>
        </Plate>

        <Plate className="p-2 mb-1.5">
          <div className="flex justify-between items-center mb-1.5">
            <button onClick={() => setCalendarCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Mês anterior" className="rounded" style={{ padding: '3px 8px', color: '#7dd3fc', background: '#0a1418' }}>‹</button>
            <div className="text-center"><Label>Registro de treino</Label><div className="font-mono font-bold" style={{ fontSize: 11, color: '#cbd5e1', textTransform: 'capitalize' }}>{monthLabel}</div></div>
            <button onClick={() => setCalendarCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Próximo mês" className="rounded" style={{ padding: '3px 8px', color: '#7dd3fc', background: '#0a1418' }}>›</button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((name, i) => <Label key={`${name}-${i}`} size={6}>{name}</Label>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((day, i) => {
              const record = day && studyLog[day.key];
              const accuracy = record ? Math.round((record.hits / Math.max(1, record.total)) * 100) : null;
              return <div key={i} style={{ minHeight: 35, borderRadius: 4, padding: '3px 2px', background: record ? colOf(accuracy) : '#0a1418', opacity: day ? 1 : .35, border: record ? '1px solid rgba(255,255,255,.12)' : '1px solid #171b1f' }}>
                {day && <><div className="font-mono font-bold" style={{ fontSize: 9, color: '#fff' }}>{day.day}</div>{record && <div className="font-mono" style={{ fontSize: 6.5, color: '#fff' }}>{record.hits}/{record.total}</div>}</>}
              </div>;
            })}
          </div>
          <div className="flex justify-between mt-1.5"><Label size={6}>{monthTotal} contas registradas</Label><Label size={6}>{monthTotal ? Math.round((monthHits / monthTotal) * 100) : 0}% de acerto no mes</Label></div>
        </Plate>

        {priority.length > 0 && <Plate className="p-2 mb-1.5" glow="rgba(245,158,11,.25)">
          <Label className="mb-1.5">Prioridade de estudo</Label>
          {priority.map((item, index) => <div key={item.key} className="flex items-center gap-1.5 mb-1">
            <div className="font-mono font-bold" style={{ width: 18, textAlign: 'center', color: index < 2 ? '#f87171' : '#fbbf24' }}>{index + 1}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 8.5, color: '#cbd5e1' }}>{item.label}</div><div style={{ height: 4, marginTop: 2, borderRadius: 3, background: '#0a0e11', overflow: 'hidden' }}><div style={{ height: '100%', width: `${100 - item.accuracy}%`, background: item.accuracy < 60 ? 'repeating-linear-gradient(45deg, #dc2626, #dc2626 2px, #991b1b 2px, #991b1b 4px)' : 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 2px, #b45309 2px, #b45309 4px)' }} /></div></div>
            <span className="font-mono" style={{ width: 76, textAlign: 'right', fontSize: 8, color: item.accuracy < 60 ? '#f87171' : '#fbbf24' }}>{item.accuracy}% · {item.misses} erros</span>
          </div>)}
          <div style={{ fontSize: 8, color: '#c5cdd8', marginTop: 5 }}>A ordem combina erros acumulados, taxa de acerto e volume praticado.</div>
        </Plate>}

        {totalOps < 10 ? (
          <Plate className="p-4 text-center">
            <Label>Dados insuficientes</Label>
            <div style={{ fontSize: 11, color: '#c5cdd8', marginTop: 6 }}>Jogue algumas partidas para que a análise identifique seus pontos fortes e fracos.</div>
          </Plate>
        ) : (
          <>
            <Plate className="p-2 mb-1.5">
              <Label className="mb-1.5">Mapa das Tabuadas</Label>
              <div className="flex flex-wrap gap-1">
                {[2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(n => {
                  const v = S.tabs[n], p = pctOf(v), tries = v ? v.h + v.m : 0;
                  return (
                    <div key={n} style={{ width: 'calc(14.28% - 4px)', textAlign: 'center', borderRadius: 4, padding: '4px 0', background: colOf(p), opacity: tries === 0 ? .25 : 1, boxShadow: 'inset 0 -2px 4px rgba(0,0,0,.4)' }}>
                      <div className="font-mono font-bold" style={{ fontSize: 11, color: '#fff' }}>{n}</div>
                      <div className="font-mono" style={{ fontSize: 7, color: '#ffffffcc' }}>{p === null ? '—' : `${p}%`}</div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1.5 px-1">
                <Label size={6}>◼ Menos de 40%</Label><Label size={6}>◼ Acima de 90%</Label>
              </div>
            </Plate>

            <Plate className="p-2 mb-1.5">
              <Label className="mb-1">Acerto por tabuada</Label>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={tabRows.sort((a, b) => a.k - b.k)} margin={{ top: 6, right: 6, bottom: 0, left: -24 }}>
                  <XAxis dataKey="k" tick={axisStyle} axisLine={{ stroke: '#2a3138' }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tipStyle} labelFormatter={v => `Tabuada do ${v}`} formatter={(v, n, p) => [`${v}% · ${p.payload.h} acertos, ${p.payload.m} erros`, 'Desempenho']} cursor={{ fill: 'rgba(6,182,212,.08)' }} />
                  <Bar dataKey="p" radius={[3, 3, 0, 0]}>
                    {tabRows.map((r, i) => <Cell key={i} fill={colOf(r.p)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Plate>

            {fracos.length > 0 && (
              <Plate className="p-2 mb-1.5" glow="rgba(220,38,38,.25)">
                <Label className="mb-1.5">Reforçar com prioridade</Label>
                {fracos.map(r => (
                  <div key={r.k} className="flex items-center gap-2 mb-1">
                    <div className="font-mono font-bold" style={{ width: 26, textAlign: 'center', fontSize: 12, color: '#fff', background: colOf(r.p), borderRadius: 3, padding: '2px 0' }}>{r.k}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 5, borderRadius: 3, background: '#0a0e11', boxShadow: DS.recess, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${r.p}%`, background: colOf(r.p) }} />
                      </div>
                    </div>
                    <span className="font-mono" style={{ fontSize: 9, color: '#c5cdd8', width: 62, textAlign: 'right' }}>{r.p}% · {r.m} erro{r.m === 1 ? '' : 's'}</span>
                  </div>
                ))}
                <div style={{ fontSize: 9, color: '#c5cdd8', marginTop: 4, lineHeight: 1.4 }}>
                  Treine a tabuada do <b style={{ color: '#f87171' }}>{fracos[0].k}</b> antes da próxima partida — é onde você mais perde calor do reator.
                </div>
              </Plate>
            )}

            {fortes.length > 0 && (
              <Plate className="p-2 mb-1.5" glow="rgba(22,163,74,.2)">
                <Label className="mb-1.5">Domínio consolidado</Label>
                <div className="flex gap-1">
                  {fortes.map(r => (
                    <div key={r.k} style={{ flex: 1, textAlign: 'center', background: '#0a1418', boxShadow: DS.recess, borderRadius: 4, padding: '4px 0' }}>
                      <div className="font-mono font-bold" style={{ fontSize: 13, color: '#4ade80' }}>{r.k}</div>
                      <div className="font-mono" style={{ fontSize: 8, color: '#c5cdd8' }}>{r.p}% · {r.n}x</div>
                    </div>
                  ))}
                </div>
              </Plate>
            )}

            <Plate className="p-2 mb-1.5">
              <Label className="mb-1.5">Multiplicação vs Divisão</Label>
              {['×', '÷'].map(s => {
                const v = S.ops[s], p = pctOf(v);
                if (!v) return null;
                return (
                  <div key={s} className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold" style={{ width: 16, fontSize: 14, color: '#cbd5e1' }}>{s}</span>
                    <div style={{ flex: 1, height: 7, borderRadius: 3, background: '#0a0e11', boxShadow: DS.recess, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p}%`, background: colOf(p), transition: 'width .4s' }} />
                    </div>
                    <span className="font-mono" style={{ fontSize: 9, color: '#c5cdd8', width: 66, textAlign: 'right' }}>{p}% · {v.h + v.m} ops</span>
                  </div>
                );
              })}
            </Plate>

            <Plate className="p-2 mb-1.5">
              <Label className="mb-1.5">Formato da Pergunta</Label>
              {Object.entries(FORM).map(([k, l]) => {
                const v = S.forms[k], p = pctOf(v);
                if (!v) return null;
                return (
                  <div key={k} className="mb-1.5">
                    <div className="flex justify-between mb-0.5">
                      <span style={{ fontSize: 8.5, color: '#c5cdd8' }}>{l}</span>
                      <span className="font-mono" style={{ fontSize: 9, color: colOf(p) }}>{p}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: '#0a0e11', boxShadow: DS.recess, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p}%`, background: colOf(p) }} />
                    </div>
                  </div>
                );
              })}
              {(() => {
                const r = pctOf(S.forms.result), inv = pctOf(S.forms.left) !== null || pctOf(S.forms.right) !== null
                  ? Math.round((((S.forms.left || { h: 0, m: 0 }).h + (S.forms.right || { h: 0, m: 0 }).h) / Math.max(1, (S.forms.left || { h: 0, m: 0 }).h + (S.forms.left || { h: 0, m: 0 }).m + (S.forms.right || { h: 0, m: 0 }).h + (S.forms.right || { h: 0, m: 0 }).m)) * 100) : null;
                if (r === null || inv === null) return null;
                const gap = r - inv;
                return <div style={{ fontSize: 9, color: '#c5cdd8', lineHeight: 1.4, marginTop: 2 }}>
                  {gap > 15
                    ? <>Você acerta {gap} pontos a mais quando o resultado está oculto. Isso indica que a <b style={{ color: '#fbbf24' }}>operação inversa</b> ainda não está automática — vale treinar "qual número vezes 8 dá 56?".</>
                    : gap < -15
                      ? <>Curiosamente você vai melhor nas formas invertidas. Reforce o cálculo direto para equilibrar.</>
                      : <>Seu desempenho é equilibrado entre cálculo direto e inverso — bom sinal de compreensão da operação.</>}
                </div>;
              })()}
            </Plate>
          </>
        )}

        <button onClick={() => setMode('menu')} className="w-full mt-1" aria-label="Voltar para menu principal">
          <Plate className="py-2 text-center"><Label>Voltar</Label></Plate>
        </button>
      </div>
    </div>
  );
}
