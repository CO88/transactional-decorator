import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Type for the storage key
 */
export type StorageKey = string | symbol;

class Als {
  private static instance: Als = new Als();
  private asyncLocalStorage = new AsyncLocalStorage<Map<StorageKey, unknown>>();

  private constructor() {}

  static getInstance(): Als {
    if (Als.instance) {
      return Als.instance;
    }
    return (Als.instance = new Als());
  }

  async run(fn: (...args: any[]) => any): Promise<any> {
    return await this.asyncLocalStorage.run(new Map(), fn);
  }

  store(): Map<StorageKey, unknown> | undefined {
    return this.asyncLocalStorage.getStore();
  }

  set<T>(key: StorageKey, value: T): void {
    this.store()!.set(key, value);
  }

  get<T>(key: StorageKey): T | undefined {
    if (!this.store()) {
      return undefined;
    }
    return this.store()!.get(key) as T | undefined;
  }
}

export const AlsService = Als.getInstance();
