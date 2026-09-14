import type { IStorageAdapter, StorageAuditEntry, StorageHealth } from './StorageAdapter';
import { requireSupabase } from '@/lib/supabase';

/**
 * Transitional blob adapter. It intentionally uses only the publishable client
 * and requires the authenticated user; domain-specific writes belong in RPCs.
 */
export class SupabaseStorageAdapter implements IStorageAdapter {
  private health: StorageHealth = { status: 'healthy' };
  private readonly audit: StorageAuditEntry[] = [];

  async read<T>(_key: string): Promise<T | null> {
    return this.unavailable<T>('read', 'Supabase adapter requires the domain repository mapping before use.');
  }

  async write<T>(_key: string, _value: T): Promise<boolean> {
    return this.unavailable<boolean>('write', 'Use domain RPCs for atomic Supabase writes.');
  }

  async merge<T extends Record<string, unknown>>(_key: string, _partial: Partial<T>): Promise<boolean> {
    return this.unavailable<boolean>('merge', 'Use domain RPCs for atomic Supabase writes.');
  }

  async clear(_key: string): Promise<boolean> {
    return this.unavailable<boolean>('clear', 'Use the authenticated operator deletion procedure.');
  }

  getHealth(): StorageHealth { return { ...this.health }; }
  getAuditLog(): StorageAuditEntry[] { return this.audit.map(entry => ({ ...entry })); }
  clearError(): void { this.health = { status: 'healthy' }; }

  private async unavailable<T>(operation: StorageAuditEntry['operation'], error: string): Promise<T> {
    try { requireSupabase().auth.getSession(); } catch (cause) { error = cause instanceof Error ? cause.message : error; }
    const at = Date.now();
    this.health = { status: 'unavailable', lastOperation: operation, lastError: error, changedAt: at };
    this.audit.push({ operation, key: 'domain', status: 'unavailable', error, at });
    return (operation === 'read' ? null : false) as T;
  }
}
