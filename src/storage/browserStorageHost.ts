import type { HostStorage } from '@domain/storage/StorageAdapter';

const DATABASE_NAME = 'nuclear-challenge';
const STORE_NAME = 'values';
const memoryFallback = new Map<string, string>();
let database: Promise<IDBDatabase | null> | null = null;

function openDatabase(): Promise<IDBDatabase | null> {
  if (database) return database;
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);

  database = new Promise(resolve => {
    try {
      const request = indexedDB.open(DATABASE_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return database;
}

export function installBrowserStorageHost(): void {
  if (typeof window === 'undefined' || window.storage) return;

  const host: HostStorage = {
    async get(key: string) {
      const db = await openDatabase();
      if (!db) return memoryFallback.has(key) ? { value: memoryFallback.get(key) } : null;

      try {
        const value = await new Promise<string | undefined>((resolve, reject) => {
          const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
          request.onsuccess = () => resolve(request.result as string | undefined);
          request.onerror = () => reject(request.error);
        });
        if (value !== undefined) memoryFallback.set(key, value);
        return value === undefined ? null : { value };
      } catch {
        return memoryFallback.has(key) ? { value: memoryFallback.get(key) } : null;
      }
    },
    async set(key: string, value: string) {
      memoryFallback.set(key, value);
      const db = await openDatabase();
      if (!db) return true;

      try {
        await new Promise<void>((resolve, reject) => {
          const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(value, key);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
        return true;
      } catch {
        return true;
      }
    },
  };

  window.storage = host;
}
