export interface ScoreState {
  current: number;
  best: number;
  phase: number;
  phase_best: number;
}

export class Scorer {
  constructor(private state: ScoreState) {}

  recordPoint(points: number): ScoreState {
    const newCurrent = this.state.current + points;
    const newBest = Math.max(this.state.best, newCurrent);
    const newPhaseBest = Math.max(this.state.phase_best, points);

    this.state = {
      current: newCurrent,
      best: newBest,
      phase: this.state.phase,
      phase_best: newPhaseBest,
    };

    return { ...this.state };
  }

  nextPhase(): ScoreState {
    this.state = {
      ...this.state,
      phase: this.state.phase + 1,
      current: 0,
    };
    return { ...this.state };
  }

  getState(): ScoreState {
    return { ...this.state };
  }
}

export function createScorer(): Scorer {
  return new Scorer({ current: 0, best: 0, phase: 1, phase_best: 0 });
}
