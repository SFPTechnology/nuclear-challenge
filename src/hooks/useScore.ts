import { useState, useCallback } from 'react';
import { createScorer } from '../domain/core/Scoring';

/**
 * Custom hook to encapsulate Scoring logic with React state management.
 * Provides monotonic score tracking and phase progression.
 *
 * @returns Object with score state and control functions
 */
export function useScore() {
  const [pts, setPts] = useState(0);
  const [goal, setGoal] = useState(1000);
  const [strk, setStrk] = useState(0);
  const [bestStrk, setBestStrk] = useState(0);

  const scorer = useCallback(() => {
    return createScorer();
  }, []);

  // Record points (always monotonic)
  const addPoints = useCallback((points: number) => {
    setPts(p => {
      const newPts = p + points;
      // Verify monotonicity (should always be true)
      if (newPts < p) {
        console.warn(`[Score] Monotonicity violation: ${p} → ${newPts}`);
      }
      return newPts;
    });
  }, []);

  // Update streak
  const setStreak = useCallback((value: number | ((prev: number) => number)) => {
    setStrk(value);
    if (typeof value === 'number') {
      setBestStrk(b => Math.max(b, value));
    }
  }, []);

  // Reset for new game
  const reset = useCallback((newGoal: number = 1000) => {
    setPts(0);
    setGoal(newGoal);
    setStrk(0);
    setBestStrk(0);
  }, []);

  // Increment goal (phase progression)
  const incrementGoal = useCallback((increment: number = 1000) => {
    setGoal(g => g + increment);
  }, []);

  return {
    // State
    pts,
    goal,
    strk,
    bestStrk,

    // Setters
    setPts,
    setGoal,
    setStrk,
    setBestStrk,
    setStreak,

    // Operations
    addPoints,
    reset,
    incrementGoal,

    // Access scorer for advanced operations
    scorer: scorer(),
  };
}
