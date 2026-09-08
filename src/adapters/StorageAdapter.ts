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
      if (!window.localStorage) return null;

      const raw = window.localStorage.getItem(key);
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
      if (!window.localStorage) return false;

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

      window.localStorage.setItem(key, JSON.stringify(entry));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Deletar entrada
   */
  delete(key: string): boolean {
    try {
      if (!window.localStorage) return false;
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Limpar tudo
   */
  clear(): boolean {
    try {
      if (!window.localStorage) return false;
      window.localStorage.clear();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Criar backup de uma chave antes de sobrescrever
   * P0-DATA: Proteger contra perda silenciosa de dados
   */
  backup(key: string): boolean {
    try {
      const backupKey = `${key}__backup`;
      const current = window.localStorage?.getItem(key);
      if (current) {
        window.localStorage?.setItem(backupKey, current);
        return true;
      }
      return true; // Sem dado atual = ok
    } catch (e) {
      console.error(`[StorageAdapter] Backup failed for key: ${key}`, e);
      return false;
    }
  }

  /**
   * Recuperar valor de backup
   * P0-DATA: Rollback seguro se read falhar
   */
  restore<T = any>(key: string): T | null {
    try {
      const backupKey = `${key}__backup`;
      const backup = window.localStorage?.getItem(backupKey);
      if (!backup) return null;

      const data = JSON.parse(backup);
      return data?.value || null;
    } catch (e) {
      console.error(`[StorageAdapter] Restore failed for key: ${key}`, e);
      return null;
    }
  }

  /**
   * Limpar backups (após sucesso confirmado)
   */
  clearBackup(key: string): boolean {
    try {
      const backupKey = `${key}__backup`;
      window.localStorage?.removeItem(backupKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Write com backup automático (seguro contra perda)
   * P0-DATA: Crítico para dados de criança
   */
  writeWithBackup<T = any>(key: string, value: T): boolean {
    try {
      // 1. Backup do valor anterior
      this.backup(key);

      // 2. Tentar escrever novo valor
      const success = this.write(key, value);

      // 3. Se sucesso, limpar backup antigo
      if (success) {
        this.clearBackup(key);
      } else {
        // 4. Se falhar, restaurar do backup
        const restored = this.restore(key);
        if (restored) {
          console.warn(`[StorageAdapter] Write failed, restored from backup for key: ${key}`);
        }
      }

      return success;
    } catch (e) {
      console.error(`[StorageAdapter] WriteWithBackup failed for key: ${key}`, e);
      return false;
    }
  }

  private isObject(v: any): v is Record<string, any> {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
  }
}

// Singleton global
export const storageAdapter = new StorageAdapter();
