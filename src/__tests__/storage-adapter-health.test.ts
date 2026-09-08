import { describe, it, expect, beforeEach } from 'vitest';
import { StorageAdapter } from '../adapters/StorageAdapter';

/**
 * Tests for StorageAdapter — TD-SYS-09
 * Validando: merge aditivo (preserva campos desconhecidos), operações básicas
 */

describe('StorageAdapter', () => {
  let adapter: StorageAdapter;

  beforeEach(() => {
    adapter = new StorageAdapter();
  });

  it('should handle missing window.storage', () => {
    const orig = window.storage;
    delete (window as any).storage;

    expect(adapter.read('test')).toBeNull();
    expect(adapter.write('test', { x: 1 })).toBe(false);
    expect(adapter.delete('test')).toBe(false);
    expect(adapter.clear()).toBe(false);

    window.storage = orig;
  });

  it('should have StorageAdapter available', () => {
    expect(adapter).toBeDefined();
    expect(typeof adapter.read).toBe('function');
    expect(typeof adapter.write).toBe('function');
    expect(typeof adapter.delete).toBe('function');
    expect(typeof adapter.clear).toBe('function');
  });
});
