import { useState, useCallback } from 'react';

/**
 * Custom hook to encapsulate Operator/Turma (class) registry management.
 * Handles loading, saving, and isolation of operator data.
 *
 * @returns Object with operator state and management functions
 */
export interface PlayerData {
  best: { [diff: number]: number };
  games: number;
  ops: number;
  hits: number;
  streak: number;
  rank: number;
  wins: number;
  stats?: { tabs: Record<string, { h: number; m: number }>; ops: Record<string, { h: number; m: number }>; forms: Record<string, { h: number; m: number }>; mistakes?: Record<string, { expression: string; errors: number; correct: number; lastSeen: number }> };
  studyLog?: Record<string, any>;
  [key: string]: any; // Forward-compatible: allow unknown fields
}

export function useTurmaRegistry() {
  const [players, setPlayers] = useState<{ [name: string]: PlayerData }>({});
  const [player, setPlayer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeErr, setStoreErr] = useState(false);

  const okStore = useState(true)[1]; // Track storage health

  // Load all players from storage
  const loadAll = useCallback(async (storage: any) => {
    let storeHealth = true;
    try {
      const r = await storage.get('operadores', true);
      if (r && r.value) {
        setPlayers(JSON.parse(r.value));
      }
    } catch {
      storeHealth = false;
      setStoreErr(true);
    }

    setLoading(false);
    return storeHealth;
  }, []);

  // Persist players to storage
  const persist = useCallback(async (next: typeof players, storage: any) => {
    setPlayers(next);

    if (!okStore) {
      setStoreErr(true);
      return false;
    }

    try {
      const r = await storage.set('operadores', JSON.stringify(next), true);
      if (!r) {
        setStoreErr(true);
      } else {
        setStoreErr(false);
      }
      return !!r;
    } catch {
      setStoreErr(true);
      return false;
    }
  }, [okStore]);

  // Create new player
  const createPlayer = useCallback((name: string) => {
    const n = name.trim().slice(0, 14);
    if (!n) return false;

    if (!players[n]) {
      const newPlayers = {
        ...players,
        [n]: {
          best: {},
          games: 0,
          ops: 0,
          hits: 0,
          streak: 0,
          rank: 0,
          wins: 0,
          studyLog: {},
        },
      };
      setPlayers(newPlayers);
      return true;
    }
    return false;
  }, [players]);

  // Get current player data (with isolation guarantee)
  const getCurrentPlayerData = useCallback(() => {
    if (!player || !players[player]) return null;
    return players[player];
  }, [player, players]);

  // Update current player (isolated update)
  const updateCurrentPlayer = useCallback((updates: Partial<PlayerData>) => {
    if (!player || !players[player]) return false;

    const newPlayers = {
      ...players,
      [player]: {
        ...players[player],
        ...updates,
      },
    };
    setPlayers(newPlayers);
    return true;
  }, [player, players]);

  // Get all player names
  const getPlayerNames = useCallback(() => {
    return Object.keys(players);
  }, [players]);

  // Reset for new session
  const reset = useCallback(() => {
    setPlayer(null);
    setLoading(true);
    setStoreErr(false);
  }, []);

  return {
    // State
    players,
    player,
    loading,
    storeErr,

    // Setters
    setPlayer,
    setPlayers,
    setLoading,
    setStoreErr,

    // Operations
    loadAll,
    persist,
    createPlayer,
    getCurrentPlayerData,
    updateCurrentPlayer,
    getPlayerNames,
    reset,
  };
}
