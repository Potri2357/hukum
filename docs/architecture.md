# Hukum — Technical Architecture & Reference Design

## 1. Overview
Hukum is a high-scale e-commerce marketplace (Flipkart-class) built with Next.js 14, Node.js / TypeScript, Redis, and MongoDB. It implements seven production-grade distributed systems modules as first-class product features.

```
                         ┌───────────────────────────┐
   Browser / PWA ───────▶│  Next.js Storefront (3000)│
                         └─────────────┬─────────────┘
                                       ▼
                         ┌───────────────────────────┐
                         │  Nginx Load Balancer      │  (Round-Robin / Least-Conn)
                         └──────┬──────────┬─────────┘
                                ▼          ▼
                      ┌────────────┐  ┌────────────┐
                      │ API Node 1 │  │ API Node 2 │  (Stateless Node.js)
                      │ ┌────────┐ │  │ ┌────────┐ │
                      │ │TokenBkt│ │  │ │TokenBkt│ │  ← Rate Limiter (Lua + Memory)
                      │ └────────┘ │  │ └────────┘ │
                      └─────┬──────┘  └─────┬──────┘
         ┌──────────────────┼────────────────┼───────────────────────┐
         ▼                  ▼                ▼                       ▼
  ┌─────────────┐   ┌──────────────┐  ┌──────────────┐     ┌────────────────┐
  │ Redis       │   │ In-Memory    │  │ Shortener    │     │ Crawler        │
  │ (cache-aside│   │ Radix Trie   │  │ Service      │     │ Workers        │
  │ buckets)    │   │ (Top-K)      │  │ (SHA-256)    │     │ (Robots.txt)   │
  └─────────────┘   └──────────────┘  └──────────────┘     └────────────────┘
                                       ▼
                       ┌───────────────── MongoDB Sharded Cluster ─────────────────┐
                       │ mongos router → Config RS → Shard A | Shard B | Shard C   │
                       └───────────────────────────────────────────────────────────┘
```

## 2. Seven Distributed Systems Capabilities

| # | System capability | Where it lives in the product |
|---|---|---|
| 1 | URL shortener using hashing + Redis | Branded short links (`spk.link/aB3xY9q`) on PDP, cart, and wishlist |
| 2 | Redis caching to speed up shortener | Cache-aside on redirect path with stampede lock, negative cache, hit-ratio metrics |
| 3 | Horizontal DB sharding with MongoDB | Orders & carts hashed on `userId`, reviews on `productId`, explain query routing |
| 4 | Distributed sorting with consistent hashing | Scatter-Sort-Merge on MurmurHash3 ring with 150 vnodes & K-way Min-Heap |
| 5 | API rate limiter using Token Bucket | Route-specific bucket policies with atomic Lua scripts and burst simulator |
| 6 | Autocomplete with prefix matching | In-memory Trie with precomputed top-K scoring and typo-tolerance fallback |
| 7 | Web crawler for automated content delivery | Polite crawler parsing JSON-LD Product schemas, robots.txt compliance, SSRF guard |

## 3. Zero-Cost Policy Enforcement
All services run on free, self-hosted, open-source technology. Payments are 100% simulated via the in-house Payment Simulator (`PAYMENT_MODE=simulation`). No paid API, cloud gateway, or credit card is required.
