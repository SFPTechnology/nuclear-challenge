import type { HostStorage } from '@domain/storage/StorageAdapter';

export type LocalStorageHostOptions = {
  failGet?: boolean;
  failSet?: boolean;
};

const values = new Map<string, string>();
let options: LocalStorageHostOptions = {};

export function installLocalStorageHost(nextOptions: LocalStorageHostOptions = {}): void {
  options = { ...nextOptions };

  if (!window.storage) {
    const host: HostStorage = {
      async get(key: string, _global: boolean) {
        if (options.failGet) throw new Error('local development storage read failed');
        const value = values.get(key);
        return value === undefined ? null : { value };
      },
      async set(key: string, value: string, _global: boolean) {
        if (options.failSet) return false;
        values.set(key, value);
        return true;
      },
    };
    window.storage = host;
  }

  window.__resetLocalStorageHost = (resetOptions: LocalStorageHostOptions = {}) => {
    values.clear();
    options = { ...resetOptions };
  };
}

declare global {
  interface Window {
    __resetLocalStorageHost?: (options?: LocalStorageHostOptions) => void;
  }
}
