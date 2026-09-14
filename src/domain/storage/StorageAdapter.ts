export type StorageStatus = 'healthy' | 'degraded' | 'unavailable';

export type StorageHealth = {
  status: StorageStatus;
  lastError?: string;
  lastOperation?: 'read' | 'write' | 'merge' | 'clear';
  changedAt?: number;
};

export type HostStorageResult = { value?: string } | null;

export interface HostStorage {
  get(key: string, global: boolean): Promise<HostStorageResult>;
  set(key: string, value: string, global: boolean): Promise<boolean>;
}

export interface StorageEnvelope<T> {
  schemaVersion: 1;
  updatedAt: number;
  data: T;
}

export type StorageAuditEntry = {
  operation: 'read' | 'write' | 'merge' | 'clear';
  key: string;
  status: StorageStatus;
  at: number;
  error?: string;
};

export interface IStorageAdapter {
  read<T>(key: string): Promise<T | null>;
  write<T>(key: string, value: T): Promise<boolean>;
  merge<T extends Record<string, unknown>>(key: string, partial: Partial<T>): Promise<boolean>;
  clear(key: string): Promise<boolean>;
  getHealth(): StorageHealth;
  getAuditLog(): StorageAuditEntry[];
  clearError(): void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function decodeStoredValue<T>(value: unknown): T {
  if (isRecord(value) && value.schemaVersion === 1 && 'data' in value) {
    return value.data as T;
  }
  return value as T;
}

export function encodeStoredValue<T>(data: T, now = Date.now()): StorageEnvelope<T> {
  return { schemaVersion: 1, updatedAt: now, data };
}

export class StorageAdapter implements IStorageAdapter {
  private health: StorageHealth = { status: 'healthy' };
  private readonly audit: StorageAuditEntry[] = [];

  constructor(private readonly host?: HostStorage) {}

  async read<T>(key: string): Promise<T | null> {
    const host = this.resolveHost();
    if (!host) {
      this.record('read', key, 'unavailable', 'window.storage is unavailable');
      return null;
    }
    try {
      const result = await host.get(key, true);
      if (!result || !result.value) {
        this.record('read', key, 'healthy');
        return null;
      }
      const data = decodeStoredValue<T>(JSON.parse(result.value) as unknown);
      this.record('read', key, 'healthy');
      return data;
    } catch (error) {
      this.record('read', key, 'degraded', this.errorMessage(error));
      return null;
    }
  }

  async write<T>(key: string, value: T): Promise<boolean> {
    const host = this.resolveHost();
    if (!host) {
      this.record('write', key, 'unavailable', 'window.storage is unavailable');
      return false;
    }
    if (this.health.status === 'degraded' || this.health.status === 'unavailable') {
      this.record('write', key, this.health.status, 'write blocked after storage health failure');
      return false;
    }
    try {
      const ok = await host.set(key, JSON.stringify(encodeStoredValue(value)), true);
      if (!ok) {
        this.record('write', key, 'degraded', 'host rejected the write');
        return false;
      }
      this.record('write', key, 'healthy');
      return true;
    } catch (error) {
      this.record('write', key, 'degraded', this.errorMessage(error));
      return false;
    }
  }

  async merge<T extends Record<string, unknown>>(key: string, partial: Partial<T>): Promise<boolean> {
    const current = await this.read<T>(key);
    if (this.health.status !== 'healthy') {
      this.record('merge', key, this.health.status, 'merge blocked after read failure');
      return false;
    }
    return this.write(key, { ...(current || {}), ...partial } as T);
  }

  async clear(key: string): Promise<boolean> {
    const host = this.resolveHost();
    if (!host) {
      this.record('clear', key, 'unavailable', 'window.storage is unavailable');
      return false;
    }
    try {
      const ok = await host.set(key, '', true);
      if (!ok) {
        this.record('clear', key, 'degraded', 'host rejected the clear operation');
        return false;
      }
      this.record('clear', key, 'healthy');
      return true;
    } catch (error) {
      this.record('clear', key, 'degraded', this.errorMessage(error));
      return false;
    }
  }

  getHealth(): StorageHealth {
    return { ...this.health };
  }

  getAuditLog(): StorageAuditEntry[] {
    return this.audit.map(entry => ({ ...entry }));
  }

  clearError(): void {
    this.health = { status: 'healthy' };
  }

  private resolveHost(): HostStorage | undefined {
    if (this.host) return this.host;
    if (typeof window === 'undefined') return undefined;
    const candidate = window.storage;
    if (!candidate || typeof candidate.get !== 'function' || typeof candidate.set !== 'function') return undefined;
    return candidate;
  }

  private record(operation: StorageAuditEntry['operation'], key: string, status: StorageStatus, error?: string): void {
    const changedAt = Date.now();
    this.health = { status, lastError: error, lastOperation: operation, changedAt };
    this.audit.push({ operation, key, status, at: changedAt, ...(error ? { error } : {}) });
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown storage error';
  }
}

export const storageAdapter = new StorageAdapter();

declare global {
  interface Window {
    storage?: HostStorage;
  }
}

export type MergePolicy = 'spread' | 'deep';
