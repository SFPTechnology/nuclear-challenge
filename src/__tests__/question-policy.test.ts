import { describe, expect, it } from 'vitest';
import { buildQuestionCandidates, LEVEL_GOAL_POINTS, LEVEL_QUESTION_RANGES, loadSeenFacts, pickQuestion, questionFactKey, ROUTINE_REINFORCEMENT_INTERVAL, saveSeenFacts, shuffledQuestionCycle } from '@domain/core/QuestionPolicy';

describe('question policy', () => {
  it('uses the requested routine and priority ranges in every level', () => {
    expect(LEVEL_QUESTION_RANGES).toEqual({
      1: { routine: [2, 7], priority: [6, 10] },
      2: { routine: [3, 7], priority: [6, 10] },
      3: { routine: [4, 8], priority: [7, 10] },
      4: { routine: [5, 8], priority: [7, 12] },
      5: { routine: [6, 11], priority: [8, 15] },
    });
  });

  it('reinforces the routine every second pair and increases the level target by 50%', () => {
    expect(ROUTINE_REINFORCEMENT_INTERVAL).toBe(2);
    expect(LEVEL_GOAL_POINTS).toBe(1500);
  });

  it('enumerates every routine and priority possibility exactly once per deck', () => {
    [1, 2, 3, 4, 5].forEach((level) => {
      const operations = level === 1 ? ['*'] as const : ['*', '/'] as const;
      ([
        ['routine', false],
        ['routine', true],
        ['priority', false],
      ] as const).forEach(([profile, surge]) => {
        const candidates = buildQuestionCandidates(level, operations, profile, surge);
        const cycle = shuffledQuestionCycle(candidates);

        expect(candidates.length).toBeGreaterThan(0);
        expect(new Set(candidates.map(candidate => candidate.key)).size).toBe(candidates.length);
        expect(new Set(cycle.map(candidate => candidate.key)).size).toBe(cycle.length);
        expect(cycle.map(candidate => candidate.key).sort()).toEqual(candidates.map(candidate => candidate.key).sort());
      });
    });
  });

  it('only starts a new cycle after the active deck has been fully consumed', () => {
    const deck = shuffledQuestionCycle(buildQuestionCandidates(1, ['*'], 'routine'));
    const shown: string[] = [];

    while (deck.length > 0) shown.push(deck.shift()!.key);

    expect(shown).toHaveLength(buildQuestionCandidates(1, ['*'], 'routine').length);
    expect(new Set(shown)).toHaveLength(shown.length);
  });

  it('never repeats an account before every account was shown, across profiles and hidden slots', () => {
    // Seeded PRNG keeps the draw sequence reproducible across runs.
    const seeded = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
    const routine = buildQuestionCandidates(3, ['*', '/'], 'routine');
    const priority = buildQuestionCandidates(3, ['*', '/'], 'priority');
    const pools = { routine: new Set(routine.map(questionFactKey)), priority: new Set(priority.map(questionFactKey)) };

    [1, 7, 42, 1234, 99999].forEach((seed) => {
      const random = seeded(seed);
      const seen = new Set<string>();
      const shown: { fact: string; pool: keyof typeof pools }[] = [];
      for (let i = 0; i < 150; i += 1) {
        shown.push({ fact: questionFactKey(pickQuestion(routine, seen, [], random)), pool: 'routine' });
        shown.push({ fact: questionFactKey(pickQuestion(priority, seen, [], random)), pool: 'priority' });
      }

      // Facts overlap between profiles, so a repeat must be judged against the
      // pool of the list that drew it: that whole pool was shown before it.
      shown.forEach(({ fact, pool }, i) => {
        const before = new Set(shown.slice(0, i).map(entry => entry.fact));
        if (!before.has(fact)) return;
        expect([...pools[pool]].filter(f => !before.has(f)), `seed ${seed}: ${pool} repeated ${fact} at draw ${i}`).toEqual([]);
      });
    });
  });

  it('brings a wrong account back in the next round even if already seen', () => {
    const candidates = buildQuestionCandidates(1, ['*'], 'routine');
    const seen = new Set<string>();
    const reinforce = new Set<string>();
    const missed = questionFactKey(pickQuestion(candidates, seen, [], Math.random, reinforce));
    reinforce.add(missed);

    expect(questionFactKey(pickQuestion(candidates, seen, [], Math.random, reinforce))).toBe(missed);
    expect(reinforce.size).toBe(0);
    expect(questionFactKey(pickQuestion(candidates, seen, [], Math.random, reinforce))).not.toBe(missed);
  });

  it('persists the reinforcement queue per operator', () => {
    saveSeenFacts('op-r', new Set(['5 × 6']), 'reinforce');
    expect([...loadSeenFacts('op-r', 'reinforce')]).toEqual(['5 × 6']);
    expect(loadSeenFacts('op-r').has('5 × 6')).toBe(false);
  });

  it('persists the cycle per operator and recycles only after exhaustion', () => {
    const candidates = buildQuestionCandidates(1, ['*'], 'routine');
    const facts = new Set(candidates.map(questionFactKey));
    const seen = loadSeenFacts('op-test');
    for (let i = 0; i < facts.size - 1; i += 1) pickQuestion(candidates, seen);
    saveSeenFacts('op-test', seen);

    const restored = loadSeenFacts('op-test');
    const last = questionFactKey(pickQuestion(candidates, restored));
    expect(seen.has(last)).toBe(false);
    expect(restored.size).toBe(facts.size);
    const nextCycle = Array.from({ length: facts.size }, () => questionFactKey(pickQuestion(candidates, restored)));
    expect(new Set(nextCycle).size).toBe(facts.size);
  });
});
