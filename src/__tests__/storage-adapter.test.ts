import { describe, it, expect, beforeEach } from 'vitest';
import { WindowStorageAdapter } from '../domain/storage/WindowStorageAdapter';
import '../domain/storage'; // Import type augmentation

describe('StorageAdapter Integration', () => {
  let adapter: WindowStorageAdapter;

  beforeEach(() => {
    adapter = new WindowStorageAdapter();
    window.storage = {};
  });

  it('should preserve unknown fields on merge', async () => {
    // Setup
    const testRecord: Record<string, unknown> = {
      code: '5B',
      teacher: 'Maria Silva',
      createdAt: 1630000000000,
      customField_v2: 'future extension',
    };
    window.storage.turma = JSON.stringify(testRecord);

    // Read
    const current = await adapter.read<Record<string, unknown>>('turma');
    expect((current as Record<string, unknown>)?.customField_v2).toBe('future extension');

    // Merge - update code and teacher but preserve customField_v2
    await adapter.merge('turma', { code: '5C', teacher: 'João Silva' } as Partial<Record<string, unknown>>);

    // Verify unknown field still exists after merge
    const updated = await adapter.read<Record<string, unknown>>('turma');
    expect((updated as Record<string, unknown>)?.customField_v2).toBe('future extension');
    expect((updated as Record<string, unknown>)?.code).toBe('5C');
    expect((updated as Record<string, unknown>)?.teacher).toBe('João Silva');
  });

  it('should handle read failure gracefully', async () => {
    window.storage.turma = 'invalid json {';

    const result = await adapter.read<Record<string, unknown>>('turma');
    expect(result).toBeNull();

    const health = adapter.getHealth();
    expect(health.ok).toBe(false);

    // Should not allow write after failed read
    await expect(adapter.write('turma', {} as Record<string, unknown>)).rejects.toThrow();
  });

  it('should recover after error clearance', async () => {
    // Fail read
    window.storage.turma = 'invalid';
    await adapter.read<Record<string, unknown>>('turma');

    // Clear error
    adapter.clearError();
    const health = adapter.getHealth();
    expect(health.ok).toBe(true);

    // Should allow write now
    window.storage.turma = JSON.stringify({});
    const testData: Record<string, unknown> = { test: 'data' };
    await adapter.write('turma', testData);
    const result = await adapter.read<Record<string, unknown>>('turma');
    expect((result as any)?.test).toBe('data');
  });

  it('should return null when key does not exist', async () => {
    const result = await adapter.read<Record<string, unknown>>('nonexistent');
    expect(result).toBeNull();
  });

  it('should write and read data correctly', async () => {
    const testData: Record<string, unknown> = { id: 1, name: 'test', score: 100 };
    await adapter.write('test', testData);

    const result = await adapter.read<Record<string, unknown>>('test');
    expect(result).toEqual(testData);
  });

  it('should clear data correctly', async () => {
    window.storage.test = JSON.stringify({ data: 'value' });
    await adapter.clear('test');
    expect(window.storage.test).toBeUndefined();
  });

  it('should merge data preserving spread semantics', async () => {
    const original: Record<string, unknown> = {
      id: 1,
      name: 'test',
      score: 100,
      legacyField: 'old',
    };
    window.storage.test = JSON.stringify(original);

    const partial: Partial<Record<string, unknown>> = { score: 150, name: 'updated' };
    await adapter.merge('test', partial);

    const result = await adapter.read<Record<string, unknown>>('test');
    expect((result as any)?.id).toBe(1);
    expect((result as any)?.name).toBe('updated');
    expect((result as any)?.score).toBe(150);
    expect((result as any)?.legacyField).toBe('old'); // Preserved
  });

  it('I4: Merge with unknown fields preserved', async () => {
    const previousRecord: Record<string, unknown> = {
      name: 'Alice',
      score: 100,
      customField_v2: 'future extension',
      legacyField: 'old version',
    };

    window.storage.record = JSON.stringify(previousRecord);

    const updates: Partial<Record<string, unknown>> = {
      name: 'Alice',
      score: 150,
    };

    await adapter.merge('record', updates);

    const result = await adapter.read<Record<string, unknown>>('record');
    expect((result as any)?.customField_v2).toBe('future extension');
    expect((result as any)?.legacyField).toBe('old version');
    expect((result as any)?.score).toBe(150);
    expect((result as any)?.name).toBe('Alice');
  });

  it('should report health status correctly', () => {
    const health = adapter.getHealth();
    expect(health.ok).toBe(true);
    expect(health.lastError).toBeUndefined();
  });

  it('should track error status on failed read', async () => {
    window.storage.bad = 'not json';
    await adapter.read<Record<string, unknown>>('bad');

    const health = adapter.getHealth();
    expect(health.ok).toBe(false);
    expect(health.lastError).toBeDefined();
  });
});
