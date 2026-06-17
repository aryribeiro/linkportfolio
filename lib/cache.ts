import { CacheEntry } from "./types";

const DEFAULT_TTL = 60;

class MemoryCache<T> {
  private entry: CacheEntry<T> | null = null;
  private ttlSeconds: number;

  constructor() {
    this.ttlSeconds = parseInt(process.env.CACHE_TTL_SECONDS || "", 10) || DEFAULT_TTL;
  }

  get(): T | null {
    if (!this.entry) return null;

    const age = (Date.now() - this.entry.timestamp) / 1000;

    if (age < this.ttlSeconds) {
      return this.entry.data;
    }

    this.entry.valid = false;
    return null;
  }

  getStale(): T | null {
    if (!this.entry) return null;
    return this.entry.data;
  }

  set(data: T): void {
    this.entry = {
      data,
      timestamp: Date.now(),
      valid: true,
    };
  }

  invalidate(): void {
    this.entry = null;
  }
}

const globalCache = globalThis as unknown as { __appDataCache?: MemoryCache<unknown> };

export function getCache<T>(): MemoryCache<T> {
  if (!globalCache.__appDataCache) {
    globalCache.__appDataCache = new MemoryCache<unknown>();
  }
  return globalCache.__appDataCache as MemoryCache<T>;
}
