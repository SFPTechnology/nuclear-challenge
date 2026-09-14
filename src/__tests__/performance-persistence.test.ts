import { describe, expect, it } from 'vitest';
import { buildSavedPlayer, type SessionStats } from '@domain/core/Performance';
import { StorageAdapter, type HostStorage } from '@domain/storage/StorageAdapter';
import type { PlayerData } from '@hooks/useTurmaRegistry';

function createHost() {
  const values: Record<string, string> = {};
  const host: HostStorage = {
    get: async key => values[key] ? { value: values[key] } : null,
    set: async (key, value) => { values[key] = value; return true; },
  };
  return { host, values };
}

describe('performance persistence round-trip', () => {
  it('consolidates the session and reads it back through the adapter', async () => {
    const session: SessionStats = {
      tabs: { '7': { h: 2, m: 1 } },
      ops: { multiplication: { h: 2, m: 1 } },
      forms: { direct: { h: 1, m: 0 }, inverse: { h: 1, m: 1 } },
      mistakes: { '7 × 8 = 56': { expression: '7 × 8 = 56', errors: 2, correct: 1, lastSeen: 10 } },
      daily: {
        '2026-09-10': {
          key: '2026-09-10', year: 2026, month: 8, day: 10, weekday: 4,
          total: 3, hits: 2, misses: 1,
          types: {
            multiplication: { hits: 2, misses: 1 }, division: { hits: 0, misses: 0 },
            direct: { hits: 1, misses: 0 }, inverse: { hits: 1, misses: 1 },
          },
          tables: { '7': { hits: 2, misses: 1 } }, updatedAt: 1,
        },
      },
    };
    const current: PlayerData = {
      best: {}, games: 0, ops: 0, hits: 0, streak: 0, rank: 0, wins: 0,
      studyLog: {}, futureExtension: { kept: true },
    };
    const next = buildSavedPlayer(current, {
      diff: 1, pts: 120, tot: 3, corr: 2, bestStrk: 2, rankIdx: 1, outcome: 'win', session,
    });
    const { host } = createHost();
    const first = new StorageAdapter(host);
    const second = new StorageAdapter(host);

    expect(await first.write('operadores', { ANA: next })).toBe(true);
    const restored = await second.read<Record<string, PlayerData>>('operadores');

    expect(restored?.ANA.games).toBe(1);
    expect(restored?.ANA.stats?.tabs['7']).toEqual({ h: 2, m: 1 });
    expect(restored?.ANA.stats?.mistakes?.['7 × 8 = 56']).toEqual({ expression: '7 × 8 = 56', errors: 2, correct: 1, lastSeen: 10 });
    expect(restored?.ANA.studyLog?.['2026-09-10'].hits).toBe(2);
    expect(restored?.ANA.futureExtension).toEqual({ kept: true });
  });
});
