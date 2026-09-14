import { describe, expect, it } from 'vitest';
import { hydrateOperatorData } from '@/domain/supabase/GameRepository';

describe('hydrateOperatorData', () => {
  it('rebuilds the analysis and study log from normalized Supabase rows', () => {
    const data = hydrateOperatorData(
      'operator-1',
      { best_by_difficulty: { '2': 200 }, games: 3, operations: 12, hits: 9, best_streak: 4, rank_index: 1, wins: 2 },
      [
        { operator_id: 'operator-1', dimension_kind: 'table', dimension_key: '7', hits: 4, misses: 1 },
        { operator_id: 'operator-1', dimension_kind: 'operation', dimension_key: '×', hits: 9, misses: 3 },
        { operator_id: 'another-operator', dimension_kind: 'form', dimension_key: 'direct', hits: 99, misses: 0 },
      ],
      [{ operator_id: 'operator-1', study_date: '2026-09-13', total: 5, hits: 4, misses: 1, updated_at: '2026-09-13T12:00:00.000Z' }],
      [
        { operator_id: 'operator-1', study_date: '2026-09-13', dimension_kind: 'table', dimension_key: '7', hits: 4, misses: 1 },
        { operator_id: 'operator-1', study_date: '2026-09-13', dimension_kind: 'operation', dimension_key: 'multiplication', hits: 4, misses: 1 },
        { operator_id: 'operator-1', study_date: '2026-09-13', dimension_kind: 'form', dimension_key: 'direct', hits: 4, misses: 1 },
      ],
      [{ operator_id: 'operator-1', expression: '7 × 8', errors: 1, correct: 2, last_seen_at: '2026-09-13T12:00:00.000Z' }],
    );

    expect(data.stats?.tabs['7']).toEqual({ h: 4, m: 1 });
    expect(data.stats?.ops['×']).toEqual({ h: 9, m: 3 });
    expect(data.stats?.forms.direct).toBeUndefined();
    expect(data.stats?.mistakes?.['7 × 8']).toMatchObject({ errors: 1, correct: 2 });
    expect(data.studyLog?.['2026-09-13']).toMatchObject({ total: 5, hits: 4, misses: 1, tables: { '7': { hits: 4, misses: 1 } } });
    expect(data.studyLog?.['2026-09-13'].types.multiplication).toEqual({ hits: 4, misses: 1 });
    expect(data.studyLog?.['2026-09-13'].types.direct).toEqual({ hits: 4, misses: 1 });
  });
});
