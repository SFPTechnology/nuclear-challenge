import { useState, useCallback } from 'react';
import { createPhysics } from '../domain/core/Physics';

/**
 * Custom hook to encapsulate Physics simulation with React state management.
 * Separates physics domain logic from component rendering.
 *
 * @param initialHeat - Initial heat percentage (0-100)
 * @returns Object with physics state and control functions
 */
export function usePhysics(initialHeat: number = 30) {
  const [heat, setHeat] = useState(initialHeat);
  const [integrity, setIntegrity] = useState(100);
  const [coolant, setCoolant] = useState(100);
  const [delta, setDelta] = useState(0);
  const [shownTemp, setShownTemp] = useState(280 + initialHeat * 4.2);

  const physicsEngine = useCallback(() => {
    return createPhysics({ heat, integrity, coolant, phase: 1 });
  }, [heat, integrity, coolant]);

  // Apply operation and return new state
  const applyOperation = useCallback((opId: number, difficulty: number) => {
    const engine = createPhysics({ heat, integrity, coolant });
    const newState = engine.applyOperation(opId, difficulty);

    setHeat(Math.max(0, Math.min(100, newState.heat)));
    setIntegrity(Math.max(0, Math.min(100, newState.integrity)));
    setCoolant(Math.max(0, Math.min(100, newState.coolant)));

    return newState;
  }, [heat, integrity, coolant]);

  // Direct setters for operations
  const addHeat = useCallback((v: number) => {
    setHeat(h => Math.min(100, Math.max(0, h + v)));
  }, []);

  const addIntegrity = useCallback((v: number) => {
    setIntegrity(i => Math.max(0, Math.min(100, i + v)));
  }, []);

  const addCoolant = useCallback((v: number) => {
    setCoolant(c => Math.max(0, Math.min(100, c + v)));
  }, []);

  // Reset physics for new game
  const reset = useCallback((newInitialHeat: number = 30) => {
    setHeat(newInitialHeat);
    setIntegrity(100);
    setCoolant(100);
    setShownTemp(280 + newInitialHeat * 4.2);
    setDelta(0);
  }, []);

  return {
    // State
    heat,
    integrity,
    coolant,
    delta,
    shownTemp,

    // Setters for direct state update
    setHeat,
    setIntegrity,
    setCoolant,
    setDelta,
    setShownTemp,

    // Operations
    applyOperation,
    addHeat,
    addIntegrity,
    addCoolant,
    reset,

    // Access engine for advanced operations
    physicsEngine: physicsEngine(),
  };
}
