# Module 2 — Redis Caching Layer

## Product Function
Accelerates short link redirects to sub-15ms latencies and protects database layers from viral traffic spikes.

## Implementation Architecture
1. **Cache-Aside Pattern**: `GET code` checks Redis `link:{code}`. On miss, queries DB, writes to cache with TTL, and returns.
2. **TTL Strategy with Jitter**: 24h TTL with ±10% random jitter to avoid cache stampede expiry synchronization.
3. **Negative Caching**: Non-existent codes cached as `NULL` for 60s to defend against sequential enumeration scans.
4. **Stampede Lock**: Per-key lock (`lock:link:{code}`) ensures single-flight fetching from database during cold key traffic bursts.
5. **Batched Click Counters**: `clicks:{code}` counts in Redis and flushes to database every 5 seconds.
6. **Live Telemetry & Toggle**: System Lab provides live hit-ratio gauge, average cached/uncached latencies, and an on-demand Cache ON/OFF switch.
