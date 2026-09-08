export interface IStorageAdapter {
  // Read operation
  read<T>(key: string): Promise<T | null>;

  // Write operation (full replace)
  write<T>(key: string, value: T): Promise<void>;

  // Merge operation (preserves unknown fields)
  merge<T>(key: string, partial: Partial<T>): Promise<void>;

  // Clear operation
  clear(key: string): Promise<void>;

  // Error status tracking
  getHealth(): { ok: boolean; lastError?: string };

  // Clear error status
  clearError(): void;
}

// Merge policy type
export type MergePolicy = 'spread' | 'deep'; // spread = {...prev, ...new}
