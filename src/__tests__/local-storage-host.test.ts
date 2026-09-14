import { afterEach, describe, expect, it } from 'vitest';
import { installLocalStorageHost } from '@/dev/localStorageHost';

afterEach(() => {
  window.__resetLocalStorageHost?.();
  delete window.storage;
});

describe('local development storage host', () => {
  it('round-trips values using the window.storage contract', async () => {
    installLocalStorageHost();

    expect(await window.storage?.get('missing', true)).toBeNull();
    expect(await window.storage?.set('partidas', '{"ok":true}', true)).toBe(true);
    expect(await window.storage?.get('partidas', true)).toEqual({ value: '{"ok":true}' });
  });

  it('simulates read and write failures without browser storage APIs', async () => {
    installLocalStorageHost();

    window.__resetLocalStorageHost?.({ failGet: true });
    await expect(window.storage?.get('operadores', true)).rejects.toThrow('read failed');

    window.__resetLocalStorageHost?.({ failSet: true });
    expect(await window.storage?.set('operadores', '{}', true)).toBe(false);
  });
});
