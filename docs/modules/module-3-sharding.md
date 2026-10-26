# Module 3 — Horizontal Database Sharding (MongoDB)

## Product Function
Ensures high availability and horizontal scaling for high-write collections: orders, carts, events, reviews, and links.

## Shard Key Strategy
- `orders`: `{ userId: "hashed" }` (Single-shard targeted reads for customer order history)
- `carts`: `{ userId: "hashed" }`
- `reviews`: `{ productId: "hashed" }` (Single-shard targeted reads for product reviews)
- `events`: `{ _id: "hashed" }`
- `links`: `{ _id: "hashed" }`
- `products`: `{ category: 1, _id: 1 }` (Ranged sharding with zone pin support)

## Shard Explorer Features in System Lab
- Cluster topology with replica sets.
- Query Routing Explain: highlights whether queries are `TARGETED` (single shard) or `SCATTER_GATHER` (broadcast to all shards).
- Hot-Shard Demonstration: compares monotonic timestamp keys (100% write hotspot) vs hashed keys (load deviation ≤ 15%).
- Dynamic Shard Addition & Chunk Rebalancing animation.
