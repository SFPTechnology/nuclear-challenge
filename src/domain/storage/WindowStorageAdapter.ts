import { IStorageAdapter } from './StorageAdapter';

export class WindowStorageAdapter implements IStorageAdapter {
  private lastError: string | undefined;
  private okStore = true;

  async read<T>(key: string): Promise<T | null> {
    try {
      if (!window.storage) return null;
      const data = window.storage[key];
      if (!data) return null;

      const parsed = JSON.parse(data);
      this.lastError = undefined;
      this.okStore = true;
      return parsed as T;
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      this.okStore = false;
      return null;
    }
  }

  async write<T>(key: string, value: T): Promise<void> {
    if (!this.okStore) {
      throw new Error('Cannot write: storage read failed. Data corruption risk.');
    }

    try {
      window.storage[key] = JSON.stringify(value);
      this.lastError = undefined;
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : 'Write failed';
      throw new Error(`Storage write failed: ${this.lastError}`);
    }
  }

  async merge<T>(key: string, partial: Partial<T>): Promise<void> {
    if (!this.okStore) {
      throw new Error('Cannot merge: storage read failed.');
    }

    try {
      const current = await this.read<T>(key);
      const merged = { ...current, ...partial }; // Spread merge = preserves unknown fields
      await this.write(key, merged);
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : 'Merge failed';
      throw error;
    }
  }

  async clear(key: string): Promise<void> {
    try {
      delete window.storage[key];
      this.lastError = undefined;
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : 'Clear failed';
    }
  }

  getHealth() {
    return {
      ok: this.okStore,
      lastError: this.lastError,
    };
  }

  clearError() {
    this.lastError = undefined;
    this.okStore = true;
  }
}
