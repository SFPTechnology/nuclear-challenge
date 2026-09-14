import type { PlayerData } from '@/hooks/useTurmaRegistry';
import { requireSupabase } from '@/lib/supabase';

export type Match = { n: string; d: number; pts: number; acc: number; streak: number; secs: number; out: 'win' | 'lose' | 'quit'; ts: number };
export type Operator = { id: string; label: string; data: PlayerData };

type ProgressRow = { best_by_difficulty: Record<string, number> | null; games: number | null; operations: number | null; hits: number | null; best_streak: number | null; rank_index: number | null; wins: number | null } | null;
type MetricCounterRow = { operator_id: string; dimension_kind: 'table' | 'operation' | 'form'; dimension_key: string; hits: number; misses: number };
type StudyDayRow = { operator_id: string; study_date: string; total: number; hits: number; misses: number; updated_at: string };
type StudyDayMetricRow = { operator_id: string; study_date: string; dimension_kind: 'table' | 'operation' | 'form'; dimension_key: string; hits: number; misses: number };
type MistakeRow = { operator_id: string; expression: string; errors: number; correct: number; last_seen_at: string | null };

const fail = (error: unknown): never => { throw error instanceof Error ? error : new Error(String(error)); };

/** Maps normalized Supabase rows back to the UI's persisted PlayerData contract. */
export function hydrateOperatorData(
  operatorId: string,
  progress: ProgressRow,
  counters: MetricCounterRow[],
  studyDays: StudyDayRow[],
  studyDayMetrics: StudyDayMetricRow[],
  mistakes: MistakeRow[],
): PlayerData {
  const stats: NonNullable<PlayerData['stats']> = { tabs: {}, ops: {}, forms: {}, mistakes: {} };
  const studyLog: NonNullable<PlayerData['studyLog']> = {};

  for (const row of counters) {
    if (row.operator_id !== operatorId) continue;
    const group = row.dimension_kind === 'table' ? stats.tabs : row.dimension_kind === 'operation' ? stats.ops : stats.forms;
    group[row.dimension_key] = { h: row.hits, m: row.misses };
  }
  for (const row of mistakes) {
    if (row.operator_id !== operatorId) continue;
    stats.mistakes![row.expression] = { expression: row.expression, errors: row.errors, correct: row.correct, lastSeen: row.last_seen_at ? Date.parse(row.last_seen_at) : 0 };
  }
  for (const row of studyDays) {
    if (row.operator_id !== operatorId) continue;
    const [year, month, day] = row.study_date.split('-').map(Number);
    studyLog[row.study_date] = {
      key: row.study_date, year, month, day, weekday: new Date(`${row.study_date}T00:00:00Z`).getUTCDay(),
      total: row.total, hits: row.hits, misses: row.misses,
      types: {
        multiplication: { hits: 0, misses: 0 }, division: { hits: 0, misses: 0 },
        direct: { hits: 0, misses: 0 }, inverse: { hits: 0, misses: 0 },
      },
      tables: {}, updatedAt: Date.parse(row.updated_at),
    };
  }
  for (const row of studyDayMetrics) {
    if (row.operator_id !== operatorId) continue;
    const day = studyLog[row.study_date];
    if (!day) continue;
    if (row.dimension_kind === 'table') day.tables[row.dimension_key] = { hits: row.hits, misses: row.misses };
    else if (row.dimension_kind === 'operation' && (row.dimension_key === 'multiplication' || row.dimension_key === 'division')) day.types[row.dimension_key] = { hits: row.hits, misses: row.misses };
    else if (row.dimension_kind === 'form' && (row.dimension_key === 'direct' || row.dimension_key === 'inverse')) day.types[row.dimension_key] = { hits: row.hits, misses: row.misses };
  }
  return {
    operatorId,
    best: progress?.best_by_difficulty ?? {}, games: progress?.games ?? 0, ops: progress?.operations ?? 0,
    hits: progress?.hits ?? 0, streak: progress?.best_streak ?? 0, rank: progress?.rank_index ?? 0,
    wins: progress?.wins ?? 0, stats, studyLog,
  };
}

export class GameRepository {
  private client = requireSupabase();

  async load(): Promise<{ operators: Operator[]; matches: Match[]; hasPausedSession: boolean }> {
    const [profilesResult, countersResult, studyDaysResult, studyDayMetricsResult, mistakesResult, sessionsResult, pausedResult] = await Promise.all([
      this.client.from('operator_profiles').select('id,display_label,operator_progress(best_by_difficulty,games,operations,hits,best_streak,rank_index,wins)').is('deleted_at', null).order('created_at'),
      this.client.from('operator_metric_counters').select('operator_id,dimension_kind,dimension_key,hits,misses'),
      this.client.from('operator_study_days').select('operator_id,study_date,total,hits,misses,updated_at'),
      this.client.from('operator_study_day_metrics').select('operator_id,study_date,dimension_kind,dimension_key,hits,misses'),
      this.client.from('operator_mistakes').select('operator_id,expression,errors,correct,last_seen_at'),
      this.client.from('game_sessions').select('difficulty,points,accuracy,best_streak,duration_seconds,status,ended_at,operator_profiles(display_label)').in('status', ['win','lose','quit']).order('ended_at', { ascending: false }),
      this.client.from('game_sessions').select('id', { count: 'exact', head: true }).eq('status', 'paused'),
    ]);
    const error = profilesResult.error ?? countersResult.error ?? studyDaysResult.error ?? studyDayMetricsResult.error ?? mistakesResult.error ?? sessionsResult.error ?? pausedResult.error;
    if (error) fail(error);
    const profiles = profilesResult.data;
    const operators = (profiles ?? []).map((row: any) => {
      const p = Array.isArray(row.operator_progress) ? row.operator_progress[0] : row.operator_progress;
      return {
        id: row.id,
        label: row.display_label,
        data: hydrateOperatorData(row.id, p, (countersResult.data ?? []) as MetricCounterRow[], (studyDaysResult.data ?? []) as StudyDayRow[], (studyDayMetricsResult.data ?? []) as StudyDayMetricRow[], (mistakesResult.data ?? []) as MistakeRow[]),
      };
    });
    const sessions = sessionsResult.data;
    const matches = (sessions ?? []).map((s: any) => ({ n: s.operator_profiles?.display_label ?? 'OPERADOR', d:s.difficulty, pts:s.points, acc:Number(s.accuracy ?? 0), streak:s.best_streak, secs:s.duration_seconds, out:s.status, ts:Date.parse(s.ended_at) }));
    return { operators, matches, hasPausedSession: (pausedResult.count ?? 0) > 0 };
  }
  async createOperator(label: string): Promise<Operator> {
    const { data, error } = await this.client.rpc('create_operator', { p_display_label: label }); if (error) fail(error);
    return { id: data.id, label: data.display_label, data: { operatorId:data.id,best:{},games:0,ops:0,hits:0,streak:0,rank:0,wins:0,studyLog:{} } };
  }
  async deleteOperator(id: string) { const { error } = await this.client.rpc('delete_operator',{p_operator_id:id}); if(error) fail(error); }
  async start(operatorId:string, difficulty:number, snapshot:unknown) { const { data,error }=await this.client.rpc('start_game_session',{p_operator_id:operatorId,p_difficulty:difficulty,p_snapshot:snapshot}); if(error) fail(error); return data.id as string; }
  async resume(operatorId: string) {
    const { data, error } = await this.client.from('game_sessions').select('id,state_snapshot,difficulty').eq('operator_id', operatorId).eq('status', 'paused').order('updated_at', { ascending: false }).limit(1).maybeSingle();
    if (error) fail(error);
    return data ? { id: data.id as string, difficulty: data.difficulty as number, snapshot: data.state_snapshot as Record<string, unknown> | null } : null;
  }
  async answer(sessionId:string,operatorId:string,sequence:number,question:unknown,correct:boolean,snapshot:unknown) { const {error}=await this.client.rpc('record_game_answer',{p_session_id:sessionId,p_operator_id:operatorId,p_sequence_number:sequence,p_question_data:question,p_is_correct:correct,p_resulting_state:snapshot}); if(error) fail(error); }
  async pause(sessionId:string,snapshot:unknown) { const {error}=await this.client.rpc('save_game_snapshot',{p_session_id:sessionId,p_snapshot:snapshot,p_paused:true}); if(error) fail(error); }
  async finish(sessionId:string,out:'win'|'lose'|'quit', points:number, accuracy:number, streak:number, seconds:number, snapshot:unknown, progress:unknown) { const {error}=await this.client.rpc('finish_game_session',{p_session_id:sessionId,p_outcome:out,p_points:points,p_accuracy:accuracy,p_best_streak:streak,p_duration_seconds:seconds,p_snapshot:snapshot,p_progress:progress}); if(error) fail(error); }
}
