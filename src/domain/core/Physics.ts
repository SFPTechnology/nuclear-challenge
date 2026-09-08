export interface PhysicsState {
  heat: number;      // 0-100%
  integrity: number; // 0-100%
  coolant: number;   // 0-100%
  phase: number;     // 1-5
}

export class PhysicsEngine {
  constructor(private state: PhysicsState) {}

  // CLI-invocable: compute new state after operation
  applyOperation(opId: number, difficulty: number): PhysicsState {
    const delta = this.computeDelta(opId, difficulty);

    this.state = {
      ...this.state,
      heat: Math.min(100, Math.max(0, this.state.heat + delta.heat)),
      integrity: Math.max(0, Math.min(100, this.state.integrity + delta.integrity)),
      coolant: Math.max(0, Math.min(100, this.state.coolant + delta.coolant)),
    };
    return this.state;
  }

  // Private: compute state change
  private computeDelta(opId: number, difficulty: number) {
    // Physics formulas (not bound to React)
    return {
      heat: opId % 3 === 0 ? 5 * difficulty : -2 * difficulty,
      integrity: opId % 2 === 0 ? 3 * difficulty : -1 * difficulty,
      coolant: opId % 5 === 0 ? -4 * difficulty : 1 * difficulty,
    };
  }

  getState(): PhysicsState {
    return { ...this.state };
  }
}

export function createPhysics(initialState?: Partial<PhysicsState>): PhysicsEngine {
  return new PhysicsEngine({
    heat: 50,
    integrity: 100,
    coolant: 75,
    phase: 1,
    ...initialState,
  });
}
