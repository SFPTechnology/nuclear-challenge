import { describe, it, expect, beforeEach } from 'vitest';

interface OperatorData {
  best: Record<number, number>;
  games: number;
  ops: number;
  hits: number;
  streak: number;
  rank: number;
  wins: number;
  studyLog: Record<string, unknown>;
}

describe('Operator Exclusion Flow', () => {
  let mockPlayers: Record<string, OperatorData>;

  beforeEach(() => {
    mockPlayers = {
      'João': { best: {}, games: 5, ops: 100, hits: 80, streak: 3, rank: 1, wins: 2, studyLog: {} },
      'Maria': { best: {}, games: 3, ops: 60, hits: 45, streak: 2, rank: 0, wins: 1, studyLog: {} },
      'Pedro': { best: {}, games: 2, ops: 40, hits: 30, streak: 1, rank: 0, wins: 0, studyLog: {} },
    };
  });

  it('should have initial players', () => {
    expect(Object.keys(mockPlayers).length).toBe(3);
    expect(mockPlayers['João']).toBeDefined();
  });

  it('should exclude operator from list', () => {
    const operatorToRemove = 'João';
    const filtered = Object.entries(mockPlayers)
      .filter(([name]) => name !== operatorToRemove)
      .reduce<Record<string, OperatorData>>((acc, [name, data]) => ({ ...acc, [name]: data }), {});

    expect(Object.keys(filtered).length).toBe(2);
    expect(filtered['João']).toBeUndefined();
    expect(filtered['Maria']).toBeDefined();
    expect(filtered['Pedro']).toBeDefined();
  });

  it('should preserve operator data before exclusion', () => {
    const operatorToRemove = 'Maria';
    const operatorData = mockPlayers[operatorToRemove];

    expect(operatorData.games).toBe(3);
    expect(operatorData.ops).toBe(60);
    expect(operatorData.hits).toBe(45);
  });

  it('should handle exclusion of all operators', () => {
    const allOperators = Object.keys(mockPlayers);
    let current: Record<string, OperatorData> = { ...mockPlayers };

    allOperators.forEach(op => {
      current = Object.entries(current)
        .filter(([name]) => name !== op)
        .reduce<Record<string, OperatorData>>((acc, [name, data]) => ({ ...acc, [name]: data }), {});
    });

    expect(Object.keys(current).length).toBe(0);
  });

  it('should not affect exclusion if operator does not exist', () => {
    const nonExistentOperator = 'NonExistent';
    const filtered = Object.entries(mockPlayers)
      .filter(([name]) => name !== nonExistentOperator)
      .reduce<Record<string, OperatorData>>((acc, [name, data]) => ({ ...acc, [name]: data }), {});

    expect(Object.keys(filtered).length).toBe(3);
    expect(filtered).toEqual(mockPlayers);
  });

  it('should maintain operator ranking after exclusion', () => {
    const operatorToRemove = 'Pedro';
    const filtered = Object.entries(mockPlayers)
      .filter(([name]) => name !== operatorToRemove)
      .reduce<Record<string, OperatorData>>((acc, [name, data]) => ({ ...acc, [name]: data }), {});

    expect(filtered['João'].rank).toBe(1);
    expect(filtered['Maria'].rank).toBe(0);
  });
});
