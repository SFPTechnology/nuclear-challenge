import { describe, it, expect } from 'vitest';
import { createPhysics } from '../domain/core/Physics';
import { createScorer } from '../domain/core/Scoring';
import { createRegistry } from '../domain/core/OperatorRegistry';
import { createStudyLog } from '../domain/core/StudyLog';

describe('Domain Services - CLI Invocable', () => {
  describe('PhysicsEngine', () => {
    it('should initialize with default state', () => {
      const physics = createPhysics();
      const state = physics.getState();

      expect(state.heat).toBe(50);
      expect(state.integrity).toBe(100);
      expect(state.coolant).toBe(75);
      expect(state.phase).toBe(1);
    });

    it('should allow custom initial state', () => {
      const physics = createPhysics({ heat: 80, phase: 3 });
      const state = physics.getState();

      expect(state.heat).toBe(80);
      expect(state.phase).toBe(3);
      expect(state.integrity).toBe(100); // Default
    });

    it('should apply operations and compute delta', () => {
      const physics = createPhysics();
      const newState = physics.applyOperation(3, 2); // opId=3, difficulty=2

      // opId % 3 === 0: heat = 5 * 2 = 10
      // opId % 2 === 1: integrity = -1 * 2 = -2
      // opId % 5 === 3: coolant = 1 * 2 = 2
      expect(newState.heat).toBe(60); // 50 + 10
      expect(newState.integrity).toBe(98); // 100 - 2
      expect(newState.coolant).toBe(77); // 75 + 2
    });

    it('I5: Physics properties evolve independently', () => {
      const physics = createPhysics();

      // Apply operation 1 (opId % 3 != 0, opId % 2 == 1): heat -= 2, integrity -= 1
      const state1 = physics.applyOperation(1, 1);
      expect(state1.heat).toBe(48); // 50 - 2
      expect(state1.integrity).toBe(99); // 100 - 1
      expect(state1.coolant).toBe(76); // 75 + 1 (opId % 5 != 0)

      // Apply operation 3 (opId % 3 == 0, opId % 2 == 1): heat += 5, integrity -= 1
      const state2 = physics.applyOperation(3, 1);
      expect(state2.heat).toBeGreaterThan(state1.heat); // 48 + 5 = 53
      expect(state2.integrity).toBeLessThan(state1.integrity); // 99 - 1 = 98
    });

    it('should clamp values to 0-100 range', () => {
      const physics = createPhysics({ heat: 95, integrity: 5 });
      const newState = physics.applyOperation(3, 5); // Large difficulty

      expect(newState.heat).toBeLessThanOrEqual(100);
      expect(newState.integrity).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Scorer', () => {
    it('should initialize with zero score', () => {
      const scorer = createScorer();
      const state = scorer.getState();

      expect(state.current).toBe(0);
      expect(state.best).toBe(0);
      expect(state.phase).toBe(1);
      expect(state.phase_best).toBe(0);
    });

    it('should record points and update best', () => {
      const scorer = createScorer();
      scorer.recordPoint(10);
      let state = scorer.getState();

      expect(state.current).toBe(10);
      expect(state.best).toBe(10);

      scorer.recordPoint(5);
      state = scorer.getState();

      expect(state.current).toBe(15);
      expect(state.best).toBe(15);
    });

    it('should update phase_best for highest individual point', () => {
      const scorer = createScorer();
      scorer.recordPoint(10);
      scorer.recordPoint(5);
      scorer.recordPoint(20);

      const state = scorer.getState();
      expect(state.phase_best).toBe(20);
    });

    it('I8: Scores monotonic per phase', () => {
      const scorer = createScorer();
      scorer.recordPoint(10);
      scorer.recordPoint(15);
      scorer.recordPoint(12);
      scorer.recordPoint(20);

      const state = scorer.getState();
      expect(state.best).toBe(57); // 10+15+12+20 accumulated
      expect(state.current).toBe(57); // Cumulative
      expect(state.phase_best).toBe(20); // Max single point value
    });

    it('should reset current on phase advance', () => {
      const scorer = createScorer();
      scorer.recordPoint(50);
      scorer.nextPhase();

      const state = scorer.getState();
      expect(state.current).toBe(0);
      expect(state.best).toBe(50); // Best preserved
      expect(state.phase).toBe(2);
    });
  });

  describe('OperatorRegistry', () => {
    it('should register and retrieve operators', () => {
      const registry = createRegistry();
      const op = { id: 'uuid-1', name: 'João', email: 'joao@test.com', createdAt: Date.now() };

      registry.register(op);
      const retrieved = registry.get('uuid-1');

      expect(retrieved).toEqual(op);
    });

    it('should list all operators', () => {
      const registry = createRegistry();
      registry.register({ id: 'uuid-1', name: 'João', createdAt: Date.now() });
      registry.register({ id: 'uuid-2', name: 'Maria', createdAt: Date.now() });

      const list = registry.list();
      expect(list.length).toBe(2);
    });

    it('should prevent duplicate registration', () => {
      const registry = createRegistry();
      const op = { id: 'uuid-1', name: 'João', createdAt: Date.now() };

      registry.register(op);
      expect(() => registry.register(op)).toThrow('already registered');
    });

    it('should unregister operators', () => {
      const registry = createRegistry();
      registry.register({ id: 'uuid-1', name: 'João', createdAt: Date.now() });
      registry.unregister('uuid-1');

      expect(registry.get('uuid-1')).toBeUndefined();
    });

    it('should clear all operators', () => {
      const registry = createRegistry();
      registry.register({ id: 'uuid-1', name: 'João', createdAt: Date.now() });
      registry.register({ id: 'uuid-2', name: 'Maria', createdAt: Date.now() });

      registry.clear();
      expect(registry.list().length).toBe(0);
    });
  });

  describe('StudyLog', () => {
    it('I3: mergeStudyLog preserves prior records', () => {
      const log1 = createStudyLog();
      log1.recordDay('2025-01-01', { date: '2025-01-01', phaseCount: 2, bestScore: 100, totalTime: 300 });
      log1.recordDay('2025-01-02', { date: '2025-01-02', phaseCount: 3, bestScore: 150, totalTime: 400 });

      const log2 = createStudyLog();
      log2.recordDay('2025-01-03', { date: '2025-01-03', phaseCount: 2, bestScore: 200, totalTime: 350 });

      log1.mergeLog(log2);
      const list = log1.list();

      expect(list.length).toBe(3);
      expect(list[0].date).toBe('2025-01-01');
      expect(list[2].date).toBe('2025-01-03');
    });

    it('should not overwrite existing dates on merge', () => {
      const log1 = createStudyLog();
      log1.recordDay('2025-01-01', { date: '2025-01-01', phaseCount: 2, bestScore: 100, totalTime: 300 });

      const log2 = createStudyLog();
      log2.recordDay('2025-01-01', { date: '2025-01-01', phaseCount: 5, bestScore: 500, totalTime: 600 });

      log1.mergeLog(log2);
      const day = log1.getDay('2025-01-01');

      expect(day?.phaseCount).toBe(2); // Original preserved
    });

    it('should list days in date order', () => {
      const log = createStudyLog();
      log.recordDay('2025-01-03', { date: '2025-01-03', phaseCount: 1, bestScore: 100, totalTime: 100 });
      log.recordDay('2025-01-01', { date: '2025-01-01', phaseCount: 2, bestScore: 200, totalTime: 200 });
      log.recordDay('2025-01-02', { date: '2025-01-02', phaseCount: 3, bestScore: 300, totalTime: 300 });

      const list = log.list();

      expect(list[0].date).toBe('2025-01-01');
      expect(list[1].date).toBe('2025-01-02');
      expect(list[2].date).toBe('2025-01-03');
    });

    it('should filter by date range', () => {
      const log = createStudyLog();
      log.recordDay('2025-01-01', { date: '2025-01-01', phaseCount: 1, bestScore: 100, totalTime: 100 });
      log.recordDay('2025-01-02', { date: '2025-01-02', phaseCount: 2, bestScore: 200, totalTime: 200 });
      log.recordDay('2025-01-03', { date: '2025-01-03', phaseCount: 3, bestScore: 300, totalTime: 300 });

      const filtered = log.list('2025-01-02', '2025-01-02');

      expect(filtered.length).toBe(1);
      expect(filtered[0].date).toBe('2025-01-02');
    });
  });
});
