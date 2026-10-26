import { Request, Response, NextFunction } from 'express';
import { InMemoryTokenBucket, RateLimitResult } from '@hukum/core-ratelimit';

export interface RoutePolicy {
  capacity: number;
  refillRate: number; // tokens/second
  cost: number;
}

export const ROUTE_POLICIES: Record<string, RoutePolicy> = {
  default: { capacity: 120, refillRate: 2, cost: 1 },
  auth_login: { capacity: 5, refillRate: 1 / 30, cost: 1 },
  otp_send: { capacity: 3, refillRate: 1 / 300, cost: 1 },
  search_suggest: { capacity: 60, refillRate: 10, cost: 1 },
  checkout_payment: { capacity: 10, refillRate: 1 / 6, cost: 5 },
  shortener_create: { capacity: 20, refillRate: 1 / 10, cost: 1 },
  plus_user: { capacity: 600, refillRate: 10, cost: 1 },
};

export class RateLimiterManager {
  private bucket = new InMemoryTokenBucket();
  public isEnabled: boolean = true;
  private blockedCount: number = 0;
  private allowedCount: number = 0;

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public getStats() {
    return {
      isEnabled: this.isEnabled,
      allowedCount: this.allowedCount,
      blockedCount: this.blockedCount,
      policies: ROUTE_POLICIES,
    };
  }

  public checkRateLimit(
    scope: string,
    key: string,
    policy: RoutePolicy = ROUTE_POLICIES.default
  ): RateLimitResult {
    if (!this.isEnabled) {
      return {
        allowed: true,
        limit: policy.capacity,
        remaining: policy.capacity,
        retryAfterMs: 0,
        resetSeconds: Math.floor(Date.now() / 1000) + 60,
        headers: {
          'X-RateLimit-Limit': String(policy.capacity),
          'X-RateLimit-Remaining': String(policy.capacity),
          'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 60),
        },
      };
    }

    const bucketKey = `${scope}:${key}`;
    const result = this.bucket.consume(bucketKey, policy.capacity, policy.refillRate, policy.cost);

    if (result.allowed) {
      this.allowedCount++;
    } else {
      this.blockedCount++;
    }

    return result;
  }
}

export const rateLimiterManager = new RateLimiterManager();

export function createRateLimiter(scope: string, policy?: RoutePolicy) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Resolve client key: authenticated user ID or IP
    const clientKey = (req as any).user?.id || req.ip || req.socket.remoteAddress || 'unknown-client';
    const chosenPolicy = policy || ROUTE_POLICIES[scope] || ROUTE_POLICIES.default;

    const result = rateLimiterManager.checkRateLimit(scope, clientKey, chosenPolicy);

    // Apply contract headers
    res.setHeader('X-RateLimit-Limit', result.headers['X-RateLimit-Limit']);
    res.setHeader('X-RateLimit-Remaining', result.headers['X-RateLimit-Remaining']);
    res.setHeader('X-RateLimit-Reset', result.headers['X-RateLimit-Reset']);

    if (!result.allowed) {
      if (result.headers['Retry-After']) {
        res.setHeader('Retry-After', result.headers['Retry-After']);
      }
      return res.status(429).json({
        error: 'rate_limited',
        message: "You're going a bit fast — please wait before retrying.",
        retryAfterMs: result.retryAfterMs,
        resetSeconds: result.resetSeconds,
      });
    }

    next();
  };
}
