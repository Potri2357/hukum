# Module 5 — API Rate Limiter Using Token Bucket

## Product Function
Protects login, OTP, checkout, search, and public APIs from abuse, scraping, and brute force while permitting legitimate bursty shoppers.

## Algorithm & Architecture
1. **Token Bucket Math**:
   - Bucket capacity $C$, steady refill rate $r$ tokens/second.
   - Refill: `tokens = min(C, tokens + (now - lastRefill) * r)`.
   - Consume: deduct request cost; if insufficient tokens, return HTTP 429 with `Retry-After`.
2. **Distributed Redis Lua Script**:
   - Atomic state update in Redis hash using Redis `TIME` for cross-node clock synchronization.
   - Fallback in-memory token bucket for local resilience and fail-open mode.
3. **Policy Contract**:
   - Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
   - Rejection: HTTP 429 + JSON envelope `{ error: "rate_limited", retryAfterMs: ... }`.
4. **Burst Simulator**:
   - System Lab tool firing a 200-request burst to visually inspect token drain, reject threshold, and refill rate.
