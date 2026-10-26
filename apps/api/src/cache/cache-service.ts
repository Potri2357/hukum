import { db } from '../database/store';

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  isNegative?: boolean;
}

export class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private locks: Map<string, number> = new Map();
  private pendingClicks: Map<string, number> = new Map();

  // Metrics
  private hits: number = 0;
  private misses: number = 0;
  private cachedLatencySumMs: number = 0;
  private uncachedLatencySumMs: number = 0;
  private hotKeys: Map<string, number> = new Map();

  // Lab Toggle: Cache ON/OFF
  public isCacheEnabled: boolean = true;

  constructor() {
    this.startClickFlushInterval();
  }

  public setCacheEnabled(enabled: boolean) {
    this.isCacheEnabled = enabled;
  }

  /**
   * Cache-aside getter with stampede lock and negative cache check.
   */
  public async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T | null>,
    ttlSeconds: number = 86400,
    jitterPct: number = 10
  ): Promise<{ value: T | null; hit: boolean; latencyMs: number }> {
    const start = performance.now();

    // If cache is toggled OFF from System Lab
    if (!this.isCacheEnabled) {
      const val = await fetchFn();
      const latency = performance.now() - start;
      this.uncachedLatencySumMs += latency;
      this.misses++;
      return { value: val, hit: false, latencyMs: Number(latency.toFixed(2)) };
    }

    // 1. Check L1 / L2 Cache
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      this.hits++;
      this.trackHotKey(key);
      const latency = performance.now() - start;
      this.cachedLatencySumMs += latency;

      if (cached.isNegative) {
        return { value: null, hit: true, latencyMs: Number(latency.toFixed(2)) };
      }
      return { value: cached.value as T, hit: true, latencyMs: Number(latency.toFixed(2)) };
    }

    // Cache Miss
    this.misses++;

    // 2. Stampede Protection (Simulated Redis SET key NX PX 3000)
    const lockExpiry = this.locks.get(`lock:${key}`);
    if (lockExpiry && lockExpiry > now) {
      // Coalescing: small backoff wait
      await new Promise((r) => setTimeout(r, 20));
      return this.getOrSet(key, fetchFn, ttlSeconds, jitterPct);
    }

    // Acquire lock
    this.locks.set(`lock:${key}`, now + 3000);

    try {
      // 3. Fetch from origin (Database)
      const data = await fetchFn();
      const latency = performance.now() - start;
      this.uncachedLatencySumMs += latency;

      // 4. Calculate Jittered TTL
      const jitterFactor = 1 + ((Math.random() * 2 - 1) * jitterPct) / 100;
      const actualTtl = Math.max(5, Math.floor(ttlSeconds * jitterFactor));

      if (data === null) {
        // Negative Caching (60 seconds)
        this.cache.set(key, {
          value: null,
          expiresAt: now + 60 * 1000,
          isNegative: true,
        });
      } else {
        this.cache.set(key, {
          value: data,
          expiresAt: now + actualTtl * 1000,
        });
      }

      this.trackHotKey(key);
      return { value: data, hit: false, latencyMs: Number(latency.toFixed(2)) };
    } finally {
      this.locks.delete(`lock:${key}`);
    }
  }

  public set<T>(key: string, value: T, ttlSeconds: number = 86400) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  public invalidate(key: string) {
    this.cache.delete(key);
  }

  public recordClick(code: string) {
    const cur = this.pendingClicks.get(code) || 0;
    this.pendingClicks.set(code, cur + 1);
  }

  private startClickFlushInterval() {
    setInterval(() => {
      if (this.pendingClicks.size === 0) return;
      for (const [code, count] of this.pendingClicks.entries()) {
        const link = db.findById('links', code);
        if (link) {
          db.updateOne('links', code, {
            clicks: (link.clicks || 0) + count,
          });
        }
      }
      this.pendingClicks.clear();
    }, 5000);
  }

  private trackHotKey(key: string) {
    const count = this.hotKeys.get(key) || 0;
    this.hotKeys.set(key, count + 1);
  }

  public getMetrics() {
    const total = this.hits + this.misses;
    const hitRatioPct = total > 0 ? (this.hits / total) * 100 : 0;
    const avgCachedMs = this.hits > 0 ? this.cachedLatencySumMs / this.hits : 0;
    const avgUncachedMs = this.misses > 0 ? this.uncachedLatencySumMs / this.misses : 0;

    // Top hot keys
    const sortedHotKeys = Array.from(this.hotKeys.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, hits]) => ({ key, hits }));

    return {
      isCacheEnabled: this.isCacheEnabled,
      totalRequests: total,
      hits: this.hits,
      misses: this.misses,
      hitRatioPct: Number(hitRatioPct.toFixed(2)),
      avgCachedLatencyMs: Number(avgCachedMs.toFixed(2)),
      avgUncachedLatencyMs: Number(avgUncachedMs.toFixed(2)),
      keyspaceSize: this.cache.size,
      hotKeys: sortedHotKeys,
    };
  }

  public resetMetrics() {
    this.hits = 0;
    this.misses = 0;
    this.cachedLatencySumMs = 0;
    this.uncachedLatencySumMs = 0;
    this.hotKeys.clear();
  }
}

export const cache = new CacheService();
