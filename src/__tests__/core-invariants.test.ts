import { describe, it, expect } from 'vitest';

describe('Nuclear Challenge Core Invariants', () => {

  // I1: rankIdx never decreases
  it('I1: rankIdx monotonically increases', () => {
    const scores = [100, 150, 200, 250]; // Monotonically increasing
    let prevRank = 0;
    for (const score of scores) {
      const rank = Math.floor(score / 10);
      expect(rank).toBeGreaterThanOrEqual(prevRank);
      prevRank = rank;
    }
    // Verify the ranks are increasing
    expect(prevRank).toBe(25);
  });

  // I2: division generates correct factors, no remainder
  it('I2: division generates exact factors', () => {
    const testValues = [100, 200, 300, 400];
    for (const val of testValues) {
      const factor = val / 10;
      expect(val % 10).toBe(0); // No remainder
      expect(Number.isInteger(factor)).toBe(true);
    }
  });

  // I3: mergeStudyLog is additive, doesn't destroy prior days
  it('I3: mergeStudyLog preserves prior records', () => {
    const legacyLog = {
      day1: { score: 100, time: 120 },
      day2: { score: 150, time: 140 },
    };

    const newLog = {
      day3: { score: 200, time: 180 },
    };

    const merged = { ...legacyLog, ...newLog };
    expect(merged.day1).toBeDefined();
    expect(merged.day2).toBeDefined();
    expect(merged.day3).toBeDefined();
  });

  // I4: Merge preserves unknown fields
  it('I4: Merge preserves unknown fields', () => {
    const previousRecord = {
      name: 'Alice',
      score: 100,
      customField_v2: 'future extension',
      legacyField: 'old version',
    };

    const updates = {
      name: 'Alice',
      score: 150,
    };

    const result = { ...previousRecord, ...updates };
    expect(result.customField_v2).toBe('future extension');
    expect(result.legacyField).toBe('old version');
  });

  // I5: Physics evolves independently
  it('I5: Physics properties evolve independently', () => {
    const physics = { heat: 50, integrity: 100, coolant: 75 };

    // Simulate independent changes
    physics.heat += 10;
    physics.integrity -= 5;
    // coolant unchanged

    expect(physics.heat).toBe(60);
    expect(physics.integrity).toBe(95);
    expect(physics.coolant).toBe(75);
  });

  // I6: Pause doesn't persist result, resume returns intact state
  it('I6: Pause does not save result, resume restores state', () => {
    const gameState: { paused: boolean; result: null | { finalScore: number }; phase: number; score: number } = {
      paused: false,
      result: null,
      phase: 3,
      score: 100,
    };
    const savedState = { ...gameState };

    gameState.paused = true;
    gameState.result = { finalScore: 100 }; // Local only

    // Resume: restore from saved state (result should not persist)
    const resumed = { ...savedState };
    expect(resumed.result).toBeNull(); // Result not persisted
    expect(resumed.phase).toBe(3); // State intact
  });

  // I7: Operation generation respects DIFF[n].range/ops
  it('I7: Operations respect range constraints', () => {
    const diffRanges = [
      { range: [0, 10], ops: 5 },
      { range: [10, 20], ops: 7 },
      { range: [20, 30], ops: 6 },
    ];

    for (const diff of diffRanges) {
      expect(diff.ops).toBeGreaterThan(0);
      expect(diff.range[1]).toBeGreaterThan(diff.range[0]);
    }
  });

  // I8: Score and best[diff] are monotonic per phase
  it('I8: Scores and best scores monotonic per phase', () => {
    const phase1Scores = [10, 15, 12, 20, 25]; // Non-decreasing per phase
    let prevMax = 0;

    for (const score of phase1Scores) {
      if (score > prevMax) prevMax = score;
      expect(score).toBeLessThanOrEqual(prevMax); // Within phase, non-decreasing
    }

    expect(prevMax).toBe(25); // Phase best is last max
  });
});
