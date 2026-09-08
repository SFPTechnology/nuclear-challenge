// Type augmentation for window.storage
declare global {
  interface Window {
    storage: Record<string, string>;
  }
}

export { IStorageAdapter, MergePolicy } from './StorageAdapter';
export { WindowStorageAdapter } from './WindowStorageAdapter';
