import { describe, expect, it, vi } from 'vitest';
import { StorageAdapter, type HostStorage } from '@domain/storage/StorageAdapter';

describe('StorageAdapter health transitions', () => {
  it('returns to healthy after clearError and a successful read', async () => {
    const host: HostStorage = {
      get: vi.fn(async () => ({ value: '{broken' })),
      set: vi.fn(async () => true),
    };
    const adapter = new StorageAdapter(host);

    await adapter.read('record');
    expect(adapter.getHealth().status).toBe('degraded');

    adapter.clearError();
    expect(adapter.getHealth().status).toBe('healthy');
    host.get = vi.fn(async () => ({ value: JSON.stringify({ ok: true }) }));
    await expect(adapter.read('record')).resolves.toEqual({ ok: true });
    expect(adapter.getHealth().status).toBe('healthy');
  });
});
