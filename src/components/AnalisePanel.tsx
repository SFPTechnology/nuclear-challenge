import React from 'react';
import { tokens } from '@design/tokens';
import { EmptyState } from './EmptyState';
import { GlobalErrorBanner } from './GlobalErrorBanner';
import { Label } from './Label';
import { Plate } from './Plate';
import { localDay } from '@utils/viewport';
import type { AppMode } from '@hooks/useUIState';

const DS = {
  recess: 'inset 0 3px 8px rgba(0,0,0,.85), inset 0 -1px 0 rgba(255,255,255,.06)',
};

type HitMiss = { h: number; m: number };
export const ANALYSIS_MINIMUM_RESPONSES = 10;
export const PRIORITY_MAX_ITEMS = 10;

/** Builds chart rows from every recorded table, including early practice data. */
export function buildTabRows(tabs: Record<string, HitMiss>) {
  return Object.entries(tabs)
    .map(([k, v]) => ({ k: +k, n: v.h + v.m, p: pctOf(v) as number, h: v.h, m: v.m }))
    .filter(row => row.n > 0);
}

export function hasEnoughAnswersForAnalysis(totalAnswers: number) {
  return totalAnswers >= ANALYSIS_MINIMUM_RESPONSES;
}

/**
 * Counts answered accounts from every persisted source. Operation counters can be
 * empty (e.g. older Supabase rows) while progress, table counters or the study log
 * still hold the real total — use the largest so analysis unlocks on the 10th answer.
 */
export function countAnsweredAccounts(
  stats: { tabs?: Record<string, HitMiss>; ops?: Record<string, HitMiss>; forms?: Record<string, HitMiss> },
  progressOps: number,
  studyLog: Record<string, { total?: number }> = {},
) {
  const sum = (group?: Record<string, HitMiss>) => Object.values(group || {}).reduce((a, v) => a + (v.h || 0) + (v.m || 0), 0);
  const logged = Object.values(studyLog).reduce((a, day) => a + (Number(day?.total) || 0), 0);
  return Math.max(sum(stats.ops), sum(stats.forms), Number(progressOps) || 0, logged);
}

type MistakeRecord = { expression: string; errors: number; correct: number; lastSeen: number };
type StatsShape = {
  tabs: Record<string, HitMiss>;
  ops: Record<string, HitMiss>;
  forms: Record<string, HitMiss>;
  mistakes: Record<string, MistakeRecord>;
};

/**
 * Builds the analysis stats for a single study day. Table and operation
 * counters come from the day record; question format is only stored as
 * direct/inverse per day, and mistakes carry no per-day split, so only those
 * last answered on the selected day are listed.
 */
export function statsForDay(
  day: { tables?: Record<string, { hits: number; misses: number }>; types?: Record<string, { hits: number; misses: number }> },
  mistakes: Record<string, MistakeRecord> = {},
  dayKey: string,
): StatsShape {
  const toHM = (v?: { hits: number; misses: number }) => ({ h: v?.hits || 0, m: v?.misses || 0 });
  const tabs = Object.fromEntries(Object.entries(day.tables || {}).map(([k, v]) => [k, toHM(v)]));
  const ops: Record<string, HitMiss> = {};
  if (day.types?.multiplication) ops['×'] = toHM(day.types.multiplication);
  if (day.types?.division) ops['÷'] = toHM(day.types.division);
  const forms: Record<string, HitMiss> = {};
  if (day.types?.direct) forms.result = toHM(day.types.direct);
  return {
    tabs,
    ops: Object.fromEntries(Object.entries(ops).filter(([, v]) => v.h + v.m > 0)),
    forms: Object.fromEntries(Object.entries(forms).filter(([, v]) => v.h + v.m > 0)),
    mistakes: Object.fromEntries(Object.entries(mistakes).filter(([, v]) => v.lastSeen && localDay(new Date(v.lastSeen)).key === dayKey)),
  };
}

function pctOf(v?: HitMiss | null) {
  return v && (v.h + v.m) > 0 ? Math.round((v.h / (v.h + v.m)) * 100) : null;
}
const analysisActionTones = {
  resume: { background: 'linear-gradient(180deg,#16a34a,#15803d)', border: '#15803d', color: '#dcfce7', glow: 'rgba(34,197,94,.32)' },
  back: { background: 'linear-gradient(180deg,#0e7490,#155e75)', border: '#0e7490', color: '#e0f2fe', glow: 'rgba(6,182,212,.3)' },
} as const;

function AnalysisActionButton({
  children,
  onClick,
  ariaLabel,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
  tone: keyof typeof analysisActionTones;
}) {
  const colors = analysisActionTones[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full mt-1 transition-transform active:translate-y-px"
      aria-label={ariaLabel}
      style={{
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

interface AnalisePanelProps {
  player: string | null;
  players: Record<string, any>;
  calendarCursor: Date;
  setCalendarCursor: (date: Date) => void;
  bg: React.CSSProperties;
  css: React.ReactNode;
  shellClass: string;
  shellStyle: React.CSSProperties;
  setMode: (mode: AppMode) => void;
  returnMode?: AppMode;
  resumeAvailable?: boolean;
  resumeGame?: () => void;
  storeErr: boolean;
}

export function AnalisePanel({
  player, players, calendarCursor, setCalendarCursor,
  bg, css, shellClass, shellStyle, setMode, returnMode = 'menu', resumeAvailable = false, resumeGame, storeErr
}: AnalisePanelProps) {
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);
  const allStats = ((players[player as string] && players[player as string].stats) || { tabs: {}, ops: {}, forms: {}, mistakes: {} }) as StatsShape;
  const colOf = (p: number | null) => p === null ? '#2a2f35' : p >= 90 ? '#16a34a' : p >= 75 ? '#65a30d' : p >= 60 ? '#ca8a04' : p >= 40 ? '#ea580c' : '#dc2626';
  const allStudyLog: Record<string, any> = (players[player as string] && players[player as string].studyLog) || {};
  const dayRecord = selectedDay ? allStudyLog[selectedDay] : null;
  const S = dayRecord ? statsForDay(dayRecord, allStats.mistakes, selectedDay!) : allStats;
  const studyLog: Record<string, any> = dayRecord ? { [selectedDay!]: dayRecord } : allStudyLog;
  const tabRows = buildTabRows(S.tabs);
  const fracos = [...tabRows].sort((a, b) => a.p - b.p).slice(0, 5);
  const fortes = [...tabRows].sort((a, b) => b.p - a.p).slice(0, 5);
  const totalOps = dayRecord ? Number(dayRecord.total) || 0 : countAnsweredAccounts(S, (players[player as string] && players[player as string].ops) || 0, allStudyLog);
  const changeMonth = (offset: number) => { setSelectedDay(null); setCalendarCursor(new Date(cursor.getFullYear(), cursor.getMonth() + offset, 1)); };
  const cursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1);
  const monthStart = cursor.getDay();
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const calendarCells = [...Array(monthStart + daysInMonth)].map((_, i) => i < monthStart ? null : localDay(new Date(cursor.getFullYear(), cursor.getMonth(), i - monthStart + 1)));
  const monthDays = calendarCells.filter((d): d is NonNullable<typeof d> => Boolean(d)).map(d => ({ ...d, record: studyLog[d.key] })).filter(d => d.record);
  const monthTotal = monthDays.reduce((sum, d) => sum + d.record.total, 0);
  const monthHits = monthDays.reduce((sum, d) => sum + d.record.hits, 0);
  type PriorityRow = { key: string; label: string; hits: number; misses: number };
  const priority = Object.entries(studyLog).reduce<PriorityRow[]>((rows, [, day]: [string, any]) => {
    Object.entries(day.tables || {}).forEach(([table, raw]) => {
      const value = raw as { hits: number; misses: number };
      const current = rows.find(r => r.key === `tab-${table}`) || { key: `tab-${table}`, label: `Tabuada do ${table}`, hits: 0, misses: 0 };
      current.hits += value.hits; current.misses += value.misses;
      if (!rows.includes(current)) rows.push(current);
    });
    Object.entries(day.types || {}).forEach(([type, raw]) => {
      const value = raw as { hits: number; misses: number };
      const labels: Record<string, string> = { multiplication: 'Multiplicacao', division: 'Divisao', direct: 'Conta direta', inverse: 'Conta inversa' };
      const current = rows.find(r => r.key === `type-${type}`) || { key: `type-${type}`, label: labels[type], hits: 0, misses: 0 };
      current.hits += value.hits; current.misses += value.misses;
      if (!rows.includes(current)) rows.push(current);
    });
    return rows;
  }, []).map(row => ({ ...row, total: row.hits + row.misses, accuracy: Math.round((row.hits / Math.max(1, row.hits + row.misses)) * 100) }))
    // Minimum volume applies to the accumulated total (not per day), and only
    // items with errors compete for the limited slots.
    .filter(row => row.total >= 2 && row.misses > 0)
    .sort((a, b) => (b.misses - a.misses) || (a.accuracy - b.accuracy) || (b.total - a.total)).slice(0, PRIORITY_MAX_ITEMS);
  const mistakes = Object.values(S.mistakes || {})
    .filter(item => item.errors > 0)
    .sort((a, b) => (b.errors - a.errors) || (b.lastSeen - a.lastSeen));
  const monthLabel = cursor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const FORM = { result: 'Resultado oculto · 7 × 8 = ?', left: 'Fator esquerdo · ? × 8 = 56', right: 'Fator direito · 7 × ? = 56' };

  return (
    <div className="nc-viewport min-h-screen p-3" style={bg}>{css}
      <GlobalErrorBanner visible={storeErr} />
      <div className={`${shellClass} mx-auto`} style={shellStyle}>
        <Plate className="p-3 mb-2 text-center">
          <Label>Análise de Desempenho</Label>
          <div className="font-mono font-bold mt-1" style={{ fontSize: tokens.typography.fontSize.xs_lg, color: '#7dd3fc' }}>{player}</div>
          <div style={{ fontSize: tokens.typography.fontSize.tiny, color: '#a1aab8' }}>{totalOps} operações analisadas</div>
        </Plate>

        <Plate className="p-2 mb-1.5">
          <div className="flex justify-between items-center mb-1.5">
            <button onClick={() => changeMonth(-1)} aria-label="Mês anterior" className="rounded" style={{ padding: '3px 8px', color: '#7dd3fc', background: '#0a1418' }}>‹</button>
            <div className="text-center"><Label>Registro de treino</Label><div className="font-mono font-bold" style={{ fontSize: tokens.typography.fontSize.xs0, color: '#cbd5e1', textTransform: 'capitalize' }}>{monthLabel}</div></div>
            <button onClick={() => changeMonth(1)} aria-label="Próximo mês" className="rounded" style={{ padding: '3px 8px', color: '#7dd3fc', background: '#0a1418' }}>›</button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((name, i) => <Label key={`${name}-${i}`} size={6}>{name}</Label>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((day, i) => {
              const record = day && allStudyLog[day.key];
              const accuracy = record ? Math.round((record.hits / Math.max(1, record.total)) * 100) : null;
              const selected = !!day && day.key === selectedDay;
              const cellStyle: React.CSSProperties = { minHeight: 40, width: '100%', textAlign: 'left', borderRadius: 4, padding: '4px 2px', background: record ? colOf(accuracy) : '#0a1418', opacity: day ? 1 : .35, border: selected ? '2px solid #7dd3fc' : record ? '1px solid rgba(255,255,255,.12)' : '1px solid #171b1f', boxShadow: selected ? '0 0 10px rgba(125,211,252,.6)' : undefined, cursor: day ? 'pointer' : 'default' };
              const content = day && <><div className="font-mono font-bold" style={{ fontSize: tokens.typography.fontSize.tiny, color: '#fff' }}>{day.day}</div>{record && <div className="font-mono" style={{ fontSize: tokens.typography.fontSize['2xs'], color: '#fff' }}>{record.hits}/{record.total}</div>}</>;
              if (!day) return <div key={i} style={cellStyle} />;
              return <button
                key={i}
                type="button"
                data-testid="calendar-day"
                aria-pressed={selected}
                title={record ? `${record.hits}/${record.total} acertos · ${accuracy}% de desempenho` : 'Sem treino neste dia'}
                aria-label={record ? `Filtrar dia ${day.day}: ${accuracy}% de desempenho` : `Filtrar dia ${day.day}: sem treino`}
                onClick={() => setSelectedDay(selected ? null : day.key)}
                style={cellStyle}
              >{content}</button>;
            })}
          </div>
          <div className="flex justify-between mt-1.5"><Label size={6}>{monthTotal} contas registradas</Label><Label size={6}>{monthTotal ? Math.round((monthHits / monthTotal) * 100) : 0}% de acerto no mes</Label></div>
          {selectedDay && <div className="flex justify-between items-center mt-1.5" data-testid="day-filter">
            <span style={{ fontSize: tokens.typography.fontSize.tiny, color: dayRecord ? '#7dd3fc' : '#f87171' }}>Filtrando: {selectedDay.split('-').reverse().join('/')}{dayRecord ? '' : ' · sem treino'}</span>
            <button type="button" onClick={() => setSelectedDay(null)} className="rounded" style={{ padding: '2px 8px', fontSize: tokens.typography.fontSize.tiny, color: '#e0f2fe', background: '#155e75' }}>Ver mês todo</button>
          </div>}
        </Plate>

        {priority.length > 0 && <Plate className="p-2 mb-1.5" glow="rgba(245,158,11,.25)">
          <Label className="mb-1.5">Prioridade de estudo</Label>
          {priority.map((item, index) => <div key={item.key} className="flex items-center gap-1.5 mb-2">
            <div className="font-mono font-bold" style={{ width: 18, textAlign: 'center', color: index < 2 ? '#f87171' : '#fbbf24' }}>{index + 1}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: tokens.typography.fontSize['0xs'], color: '#cbd5e1' }}>{item.label}</div><div style={{ height: 4, marginTop: 2, borderRadius: 3, background: '#0a0e11', overflow: 'hidden' }}><div style={{ height: '100%', width: `${100 - item.accuracy}%`, background: item.accuracy < 60 ? 'repeating-linear-gradient(45deg, #dc2626, #dc2626 2px, #991b1b 2px, #991b1b 4px)' : 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 2px, #b45309 2px, #b45309 4px)' }} /></div></div>
            <span className="font-mono" style={{ width: 94, textAlign: 'right', fontSize: tokens.typography.fontSize.micro, color: item.accuracy < 60 ? '#f87171' : '#fbbf24' }}>{item.accuracy}% · {item.misses} erros</span>
          </div>)}
          <div style={{ fontSize: tokens.typography.fontSize.micro, color: '#c5cdd8', marginTop: 7, lineHeight: tokens.typography.lineHeight.snug }}>A ordem combina erros acumulados, taxa de acerto e volume praticado.</div>
        </Plate>}

        {mistakes.length > 0 && <Plate className="p-2 mb-1.5" glow="rgba(220,38,38,.25)">
          <Label className="mb-1.5">Contas respondidas incorretamente</Label>
          {mistakes.map(item => (
            <div key={item.expression} className="flex items-center justify-between gap-2 mb-1.5" data-testid="mistake-record">
              <span className="font-mono" style={{ flex: 1, fontSize: tokens.typography.fontSize.tiny, color: '#cbd5e1' }}>{item.expression}</span>
              <span className="font-mono" style={{ fontSize: tokens.typography.fontSize.micro, color: '#f87171' }}>{item.errors} {item.errors === 1 ? 'erro' : 'erros'}</span>
            </div>
          ))}
          <div style={{ fontSize: tokens.typography.fontSize.micro, color: '#c5cdd8', marginTop: 7, lineHeight: tokens.typography.lineHeight.snug }}>As contas acima entram novamente na próxima rodada para reforço.</div>
        </Plate>}

        {!hasEnoughAnswersForAnalysis(totalOps) ? (
          <EmptyState
            icon="🔬"
            title="Nenhuma análise disponível"
            description="Jogue algumas partidas para que a análise identifique seus pontos fortes e fracos."
            actionLabel="Voltar ao menu"
            onAction={() => setMode('menu')}
            size="md"
            testId="empty-state-analise"
          />
        ) : (
          <>
            <Plate className="p-2 mb-1.5">
              <Label className="mb-1.5">Mapa das Tabuadas</Label>
              <div className="flex flex-wrap gap-1">
                {[2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(n => {
                  const v = S.tabs[n], p = pctOf(v), tries = v ? v.h + v.m : 0;
                  return (
                    <div key={n} style={{ width: 'calc(14.28% - 4px)', textAlign: 'center', borderRadius: 4, padding: '4px 0', background: colOf(p), opacity: tries === 0 ? .25 : 1, boxShadow: 'inset 0 -2px 4px rgba(0,0,0,.4)' }}>
                      <div className="font-mono font-bold" style={{ fontSize: tokens.typography.fontSize.xs0, color: '#fff' }}>{n}</div>
                      <div className="font-mono" style={{ fontSize: tokens.typography.fontSize.xs2, color: '#ffffffcc' }}>{p === null ? '—' : `${p}%`}</div>
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
              <div role="img" aria-label="Acertos por tabuada" style={{ height: 130, display: 'flex', alignItems: 'stretch', gap: 4, padding: '8px 4px 0', borderBottom: '1px solid #2a2f35' }}>
                {tabRows.slice().sort((a, b) => a.k - b.k).map(row => (
                  <div key={row.k} title={`Tabuada do ${row.k}: ${row.p}% - ${row.h} acertos, ${row.m} erros`} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 3 }}>
                    <span className="font-mono" style={{ fontSize: tokens.typography.fontSize['2xs'], color: '#cbd5e1' }}>{row.p}%</span>
                    <div aria-label={`Tabuada do ${row.k}: ${row.h} acertos e ${row.m} erros`} style={{ width: '100%', height: `${Math.max(4, row.p)}%`, minHeight: 4, borderRadius: '3px 3px 0 0', background: `linear-gradient(180deg,${colOf(row.p)},${colOf(row.p)}99)`, boxShadow: `0 0 8px ${colOf(row.p)}66` }} />
                    <span className="font-mono" style={{ fontSize: tokens.typography.fontSize['2xs'], color: '#8d959e' }}>{row.k}</span>
                  </div>
                ))}
              </div>
            </Plate>

            {fracos.length > 0 && (
              <Plate className="p-2 mb-1.5" glow="rgba(220,38,38,.25)">
                <Label className="mb-1.5">Reforçar com prioridade</Label>
                {fracos.map(r => (
                  <div key={r.k} className="flex items-center gap-2 mb-1" data-testid="priority-table-row">
                    <div className="font-mono font-bold" style={{ width: 26, textAlign: 'center', fontSize: tokens.typography.fontSize.xs, color: '#fff', background: colOf(r.p), borderRadius: 3, padding: '2px 0' }}>{r.k}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 5, borderRadius: 3, background: '#0a0e11', boxShadow: DS.recess, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${r.p}%`, background: colOf(r.p) }} />
                      </div>
                    </div>
                    <span className="font-mono" style={{ fontSize: tokens.typography.fontSize.tiny, color: '#c5cdd8', width: 84, textAlign: 'right' }}>{r.p}% · {r.m} erro{r.m === 1 ? '' : 's'}</span>
                  </div>
                ))}
                <div style={{ fontSize: tokens.typography.fontSize.tiny, color: '#c5cdd8', marginTop: 6, lineHeight: tokens.typography.lineHeight.snug }}>
                  Treine a tabuada do <b style={{ color: '#f87171' }}>{fracos[0].k}</b> antes da próxima partida — é onde você mais perde calor do reator.
                </div>
              </Plate>
            )}

            {fortes.length > 0 && (
              <Plate className="p-2 mb-1.5" glow="rgba(22,163,74,.2)">
                <Label className="mb-1.5">Domínio consolidado</Label>
                <div className="flex gap-1">
                  {fortes.map(r => (
                    <div key={r.k} data-testid="consolidated-table" style={{ flex: 1, textAlign: 'center', background: '#0a1418', boxShadow: DS.recess, borderRadius: 4, padding: '4px 0' }}>
                      <div className="font-mono font-bold" style={{ fontSize: tokens.typography.fontSize.xs_lg, color: '#4ade80' }}>{r.k}</div>
                      <div className="font-mono" style={{ fontSize: tokens.typography.fontSize.micro, color: '#c5cdd8' }}>{r.p}% · {r.n}x</div>
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
                    <span className="font-mono" style={{ fontSize: tokens.typography.fontSize.tiny, color: '#c5cdd8', width: 84, textAlign: 'right' }}>{p}% · {v.h + v.m} ops</span>
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
                    <div className="flex justify-between gap-2 mb-0.5">
                      <span style={{ minWidth: 0, fontSize: tokens.typography.fontSize['0xs'], lineHeight: tokens.typography.lineHeight.snug, color: '#c5cdd8', overflowWrap: 'anywhere' }}>{l}</span>
                      <span className="font-mono" style={{ fontSize: tokens.typography.fontSize.tiny, color: colOf(p) }}>{p}%</span>
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
                return <div style={{ fontSize: tokens.typography.fontSize.tiny, color: '#c5cdd8', lineHeight: tokens.typography.lineHeight.snug, marginTop: 6 }}>
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

        {resumeAvailable && resumeGame && (
          <AnalysisActionButton onClick={resumeGame} ariaLabel="Retornar ao jogo" tone="resume">
            RETORNAR AO JOGO
          </AnalysisActionButton>
        )}
        <AnalysisActionButton
          onClick={() => setMode(returnMode)}
          ariaLabel={returnMode === 'pause' ? 'Voltar para turno pausado' : 'Voltar para menu principal'}
          tone="back"
        >
          VOLTAR
        </AnalysisActionButton>
      </div>
    </div>
  );
}
