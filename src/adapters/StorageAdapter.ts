/**
 * StorageAdapter — Wrapper simples mas sólido para window.storage
 *
 * TD-SYS-09: Contrato formal de leitura/escrita com merge aditivo
 * TD-DAT-01: Merge aditivo preserva campos desconhecidos
 */

export class StorageAdapter {
  /**
   * Ler valor do storage
   */
  read<T = any>(key: string): T | null {
    try {
      if (!window.storage) return null;

      const raw = window.storage.getItem(key);
      if (!raw) return null;

      const data = JSON.parse(raw);
      return data?.value || null;
    } catch {
      return null;
    }
  }

  /**
   * Escrever valor com merge aditivo
   * Preserva campos desconhecidos do valor anterior
   */
  write<T = any>(key: string, value: T): boolean {
    try {
      if (!window.storage) return false;

      // Merge aditivo: preservar campos desconhecidos
      let toWrite = value;
      if (this.isObject(value)) {
        const existing = this.read(key);
        if (this.isObject(existing)) {
          toWrite = { ...existing, ...value } as T;
        }
      }

      const entry = {
        value: toWrite,
        version: 1,
        timestamp: Date.now(),
      };

      const result = window.storage.setItem(key, JSON.stringify(entry));
      return !!result;
    } catch {
      return false;
    }
  }

  /**
   * Deletar entrada
   */
  delete(key: string): boolean {
    try {
      if (!window.storage) return false;
      const result = window.storage.removeItem(key);
      return !!result;
    } catch {
      return false;
    }
  }

  /**
   * Limpar tudo
   */
  clear(): boolean {
    try {
      if (!window.storage) return false;
      window.storage.clear();
      return true;
    } catch {
      return false;
    }
  }

  private isObject(v: any): v is Record<string, any> {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
  }
}

// Singleton global
export const storageAdapter = new StorageAdapter();
