import { CacheEntry } from "./types";

const DEFAULT_TTL = 300;

class MemoryCache<T> {
  private entry: CacheEntry<T> | null = null;
  private ttlSeconds: number;

  constructor() {
    this.ttlSeconds = parseInt(process.env.CACHE_TTL_SECONDS || "", 10) || DEFAULT_TTL;
  }

  get(): T | null {
    if (!this.entry) {
      console.log("[cache] MISS — no entry");
      return null;
    }

    const age = (Date.now() - this.entry.timestamp) / 1000;

    if (age < this.ttlSeconds) {
      console.log(`[cache] HIT — age: ${Math.round(age)}s / ttl: ${this.ttlSeconds}s`);
      return this.entry.data;
    }

    console.log(`[cache] EXPIRED — age: ${Math.round(age)}s / ttl: ${this.ttlSeconds}s`);
    this.entry.valid = false;
    return null;
  }

  getStale(): T | null {
    if (!this.entry) return null;
    console.log("[cache] STALE — returning expired data as fallback");
    return this.entry.data;
  }

  set(data: T): void {
    this.entry = {
      data,
      timestamp: Date.now(),
      valid: true,
    };
    console.log("[cache] SET — data cached");
  }

  invalidate(): void {
    if (this.entry) {
      this.entry.valid = false;
      this.entry.timestamp = 0;
    }
    console.log("[cache] INVALIDATED");
  }

  isValid(): boolean {
    if (!this.entry) return false;
    const age = (Date.now() - this.entry.timestamp) / 1000;
    return age < this.ttlSeconds;
  }
}

const globalCache = globalThis as unknown as { __appDataCache?: MemoryCache<unknown> };

export function getCache<T>(): MemoryCache<T> {
  if (!globalCache.__appDataCache) {
    globalCache.__appDataCache = new MemoryCache<unknown>();
  }
  return globalCache.__appDataCache as MemoryCache<T>;
}
