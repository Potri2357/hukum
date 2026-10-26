/**
 * Atomic Redis Lua script for Token Bucket rate limiting.
 * KEYS[1]: rate limit key, e.g. "rl:checkout:usr_123"
 * ARGV[1]: capacity C (max tokens)
 * ARGV[2]: refill rate r (tokens per second)
 * ARGV[3]: request cost (tokens to consume)
 * ARGV[4]: current time in seconds (float or int)
 *
 * Returns:
 * [1 (allowed) | 0 (rejected), remaining_tokens, retry_after_ms, reset_timestamp_sec]
 */
export const TOKEN_BUCKET_LUA = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local cost = tonumber(ARGV[3])
local now = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(data[1])
local last_refill = tonumber(data[2])

if not tokens then
  tokens = capacity
  last_refill = now
else
  local delta = math.max(0, now - last_refill)
  tokens = math.min(capacity, tokens + delta * refill_rate)
  last_refill = now
end

local allowed = 0
local retry_after_ms = 0

if tokens >= cost then
  tokens = tokens - cost
  allowed = 1
else
  local missing = cost - tokens
  retry_after_ms = math.ceil((missing / refill_rate) * 1000)
end

redis.call('HMSET', key, 'tokens', tokens, 'last_refill', last_refill)
local ttl = math.ceil(capacity / refill_rate) * 2
redis.call('EXPIRE', key, math.max(ttl, 60))

local reset_time = math.ceil(now + (capacity - tokens) / refill_rate)

return { allowed, math.floor(tokens), retry_after_ms, reset_time }
`;

export interface RateLimitPolicy {
  capacity: number;
  refillRate: number; // tokens per second
  cost?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterMs: number;
  resetSeconds: number;
  headers: {
    'X-RateLimit-Limit': string;
    'X-RateLimit-Remaining': string;
    'X-RateLimit-Reset': string;
    'Retry-After'?: string;
  };
}

export interface BucketState {
  tokens: number;
  lastRefillTime: number; // in milliseconds
}

/**
 * In-Memory Token Bucket limiter for local dev, testing, or fail-open resilience.
 */
export class InMemoryTokenBucket {
  private buckets: Map<string, BucketState> = new Map();

  public consume(
    key: string,
    capacity: number,
    refillRate: number,
    cost: number = 1,
    nowMs: number = Date.now()
  ): RateLimitResult {
    let state = this.buckets.get(key);

    if (!state) {
      state = {
        tokens: capacity,
        lastRefillTime: nowMs,
      };
      this.buckets.set(key, state);
    } else {
      const elapsedSeconds = Math.max(0, (nowMs - state.lastRefillTime) / 1000);
      state.tokens = Math.min(capacity, state.tokens + elapsedSeconds * refillRate);
      state.lastRefillTime = nowMs;
    }

    let allowed = false;
    let retryAfterMs = 0;

    if (state.tokens >= cost) {
      state.tokens -= cost;
      allowed = true;
    } else {
      const missingTokens = cost - state.tokens;
      retryAfterMs = Math.ceil((missingTokens / refillRate) * 1000);
    }

    const remaining = Math.max(0, Math.floor(state.tokens));
    const secondsToFull = Math.ceil((capacity - state.tokens) / refillRate);
    const resetSeconds = Math.ceil(nowMs / 1000) + secondsToFull;

    const headers: RateLimitResult['headers'] = {
      'X-RateLimit-Limit': String(capacity),
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(resetSeconds),
    };

    if (!allowed) {
      headers['Retry-After'] = String(Math.ceil(retryAfterMs / 1000));
    }

    return {
      allowed,
      limit: capacity,
      remaining,
      retryAfterMs,
      resetSeconds,
      headers,
    };
  }

  public getBucket(key: string): BucketState | undefined {
    return this.buckets.get(key);
  }

  public clear(): void {
    this.buckets.clear();
  }
}

/**
 * Alternative algorithms for comparative simulation in System Lab.
 */
export class FixedWindowLimiter {
  private windows: Map<string, { count: number; windowStart: number }> = new Map();

  public consume(key: string, limit: number, windowSeconds: number, nowMs: number = Date.now()): boolean {
    const windowMs = windowSeconds * 1000;
    const currentWindowStart = Math.floor(nowMs / windowMs) * windowMs;

    let entry = this.windows.get(key);
    if (!entry || entry.windowStart !== currentWindowStart) {
      entry = { count: 0, windowStart: currentWindowStart };
      this.windows.set(key, entry);
    }

    if (entry.count < limit) {
      entry.count++;
      return true;
    }
    return false;
  }
}

export class SlidingWindowLogLimiter {
  private logs: Map<string, number[]> = new Map();

  public consume(key: string, limit: number, windowSeconds: number, nowMs: number = Date.now()): boolean {
    const windowMs = windowSeconds * 1000;
    const threshold = nowMs - windowMs;

    let timestamps = this.logs.get(key) || [];
    timestamps = timestamps.filter((t) => t > threshold);

    if (timestamps.length < limit) {
      timestamps.push(nowMs);
      this.logs.set(key, timestamps);
      return true;
    }

    this.logs.set(key, timestamps);
    return false;
  }
}

/**
 * Runs a comparative burst simulation for the System Lab.
 * Demonstrates how Token Bucket allows immediate burst up to capacity C then sustains at rate r,
 * while Fixed Window has boundary spike anomalies and Sliding Window log has higher memory overhead.
 */
export function simulateRateLimiters(
  totalRequests: number,
  intervalMs: number,
  capacity: number = 20,
  refillPerSec: number = 5
) {
  const tokenBucket = new InMemoryTokenBucket();
  const fixedWindow = new FixedWindowLimiter();
  const slidingWindow = new SlidingWindowLogLimiter();

  const results: Array<{
    reqIndex: number;
    timeMs: number;
    tokenBucketAllowed: boolean;
    fixedWindowAllowed: boolean;
    slidingWindowAllowed: boolean;
    tokenBucketTokens: number;
  }> = [];

  const startTime = 1000000;
  for (let i = 0; i < totalRequests; i++) {
    const currentTime = startTime + i * intervalMs;
    const tbRes = tokenBucket.consume('sim_user', capacity, refillPerSec, 1, currentTime);
    const fwAllowed = fixedWindow.consume('sim_user', capacity, 4, currentTime);
    const swAllowed = slidingWindow.consume('sim_user', capacity, 4, currentTime);

    results.push({
      reqIndex: i + 1,
      timeMs: i * intervalMs,
      tokenBucketAllowed: tbRes.allowed,
      fixedWindowAllowed: fwAllowed,
      slidingWindowAllowed: swAllowed,
      tokenBucketTokens: tbRes.remaining,
    });
  }

  const tbAllowedTotal = results.filter((r) => r.tokenBucketAllowed).length;
  const fwAllowedTotal = results.filter((r) => r.fixedWindowAllowed).length;
  const swAllowedTotal = results.filter((r) => r.slidingWindowAllowed).length;

  return {
    totalRequests,
    capacity,
    refillPerSec,
    summary: {
      tokenBucket: { allowed: tbAllowedTotal, rejected: totalRequests - tbAllowedTotal },
      fixedWindow: { allowed: fwAllowedTotal, rejected: totalRequests - fwAllowedTotal },
      slidingWindow: { allowed: swAllowedTotal, rejected: totalRequests - swAllowedTotal },
    },
    timeline: results,
  };
}
