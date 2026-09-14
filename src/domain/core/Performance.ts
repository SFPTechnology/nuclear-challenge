import { mergeStudyLog, type StudyDay } from '@utils/studyLog';
import type { PlayerData } from '@hooks/useTurmaRegistry';

export type HitMiss = { h: number; m: number };
export type MistakeRecord = { expression: string; errors: number; correct: number; lastSeen: number };

export type SessionStats = {
  tabs: Record<string, HitMiss>;
  ops: Record<string, HitMiss>;
  forms: Record<string, HitMiss>;
  mistakes?: Record<string, MistakeRecord>;
  daily: Record<string, StudyDay>;
};

export type ResultUpdate = {
  diff: number;
  pts: number;
  tot: number;
  corr: number;
  bestStrk: number;
  rankIdx: number;
  outcome: 'win' | 'lose' | 'quit';
  session: SessionStats;
};

export function mergeStats(old: Partial<SessionStats> = {}, add: SessionStats): Pick<SessionStats, 'tabs' | 'ops' | 'forms'> & { mistakes: Record<string, MistakeRecord> } {
  const out = {
    tabs: { ...(old.tabs || {}) },
    ops: { ...(old.ops || {}) },
    forms: { ...(old.forms || {}) },
    mistakes: { ...(old.mistakes || {}) },
  } as Pick<SessionStats, 'tabs' | 'ops' | 'forms'> & { mistakes: Record<string, MistakeRecord> };

  (['tabs', 'ops', 'forms'] as const).forEach(group => {
    Object.entries(add[group]).forEach(([key, value]) => {
      const previous = out[group][key] || { h: 0, m: 0 };
      out[group][key] = { h: previous.h + value.h, m: previous.m + value.m };
    });
  });
  Object.entries(add.mistakes || {}).forEach(([key, value]) => {
    const previous = out.mistakes[key] || { ...value, errors: 0, correct: 0 };
    out.mistakes[key] = {
      expression: value.expression,
      errors: previous.errors + value.errors,
      correct: previous.correct + value.correct,
      lastSeen: Math.max(previous.lastSeen, value.lastSeen),
    };
  });
  return out;
}

export function buildSavedPlayer(current: PlayerData, update: ResultUpdate): PlayerData {
  return {
    ...current,
    best: { ...current.best, [update.diff]: Math.max(current.best[update.diff] || 0, update.pts) },
    games: current.games + 1,
    ops: current.ops + update.tot,
    hits: current.hits + update.corr,
    streak: Math.max(current.streak, update.bestStrk),
    rank: Math.max(current.rank, update.rankIdx),
    wins: current.wins + (update.outcome === 'win' ? 1 : 0),
    stats: mergeStats(current.stats, update.session),
    studyLog: mergeStudyLog(current.studyLog, update.session.daily),
  };
}
