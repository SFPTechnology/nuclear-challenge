import { describe, expect, it, vi } from 'vitest';
import { StorageAdapter, type HostStorage } from '@domain/storage/StorageAdapter';

function createHost(initial: Record<string, string> = {}) {
  const values = { ...initial };
  const host: HostStorage = {
    get: vi.fn(async (key: string) => values[key] ? { value: values[key] } : null),
    set: vi.fn(async (key: string, value: string) => {
      if (value === '') delete values[key];
      else values[key] = value;
      return true;
    }),
  };
  return { host, values };
}

describe('StorageAdapter', () => {
  it('writes and reads a versioned envelope through the host', async () => {
    const { host, values } = createHost();
    const adapter = new StorageAdapter(host);

    expect(await adapter.write('operadores', { LOCAL: { games: 1 } })).toBe(true);
    expect(JSON.parse(values.operadores).schemaVersion).toBe(1);
    await expect(adapter.read<{ LOCAL: { games: number } }>('operadores')).resolves.toEqual({ LOCAL: { games: 1 } });
    expect(host.set).toHaveBeenCalledWith('operadores', expect.any(String), true);
  });

  it('reads legacy records without changing their shape', async () => {
    const { host } = createHost({ legacy: JSON.stringify({ games: 4, futureField: 'kept' }) });
    const adapter = new StorageAdapter(host);

    await expect(adapter.read<{ games: number; futureField: string }>('legacy')).resolves.toEqual({ games: 4, futureField: 'kept' });
  });

  it('merges without removing unknown fields', async () => {
    const { host } = createHost({ record: JSON.stringify({ id: 1, legacyField: 'kept', score: 10 }) });
    const adapter = new StorageAdapter(host);

    expect(await adapter.merge('record', { score: 20 })).toBe(true);
    await expect(adapter.read<Record<string, unknown>>('record')).resolves.toMatchObject({ id: 1, legacyField: 'kept', score: 20 });
  });

  it('blocks writes after a corrupted read and exposes degraded health', async () => {
    const { host } = createHost({ broken: '{invalid' });
    const adapter = new StorageAdapter(host);

    await expect(adapter.read('broken')).resolves.toBeNull();
    expect(adapter.getHealth().status).toBe('degraded');
    expect(await adapter.write('broken', { replacement: true })).toBe(false);
    expect(host.set).not.toHaveBeenCalled();
    expect(adapter.getAuditLog().some(entry => entry.operation === 'read' && entry.status === 'degraded')).toBe(true);
  });

  it('reports unavailable health when no host exists', async () => {
    const adapter = new StorageAdapter();

    await expect(adapter.read('missing')).resolves.toBeNull();
    expect(adapter.getHealth().status).toBe('unavailable');
    expect(await adapter.write('missing', {})).toBe(false);
  });

  it('clears a key through the host', async () => {
    const { host } = createHost({ record: JSON.stringify({ value: true }) });
    const adapter = new StorageAdapter(host);

    expect(await adapter.clear('record')).toBe(true);
    await expect(adapter.read('record')).resolves.toBeNull();
  });
});
