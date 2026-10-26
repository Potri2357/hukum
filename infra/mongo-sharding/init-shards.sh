#!/usr/bin/env bash
# ==============================================================================
# Hukum MongoDB Cluster Sharding Initializer
# Initializes Config RS, 3 Shard Replica Sets, and mongos routing
# ==============================================================================
set -e

echo "⏳ Waiting for mongos and shard replica sets to be ready..."

# 1. Initialize Config Replica Set
mongosh --host configsvr:27019 --eval '
rs.initiate({
  _id: "configRS",
  configsvr: true,
  members: [{ _id: 0, host: "configsvr:27019" }]
});
' || true

# 2. Initialize Shard Replica Sets
mongosh --host shard1:27018 --eval '
rs.initiate({
  _id: "shard1RS",
  members: [{ _id: 0, host: "shard1:27018" }]
});
' || true

mongosh --host shard2:27018 --eval '
rs.initiate({
  _id: "shard2RS",
  members: [{ _id: 0, host: "shard2:27018" }]
});
' || true

mongosh --host shard3:27018 --eval '
rs.initiate({
  _id: "shard3RS",
  members: [{ _id: 0, host: "shard3:27018" }]
});
' || true

# 3. Add Shards to mongos router
mongosh --host mongos:27017 --eval '
sh.addShard("shard1RS/shard1:27018");
sh.addShard("shard2RS/shard2:27018");
sh.addShard("shard3RS/shard3:27018");

// Enable Sharding on hukum database
sh.enableSharding("hukum");

// Shard key rules per PRD §7.3
sh.shardCollection("hukum.orders", { userId: "hashed" });
sh.shardCollection("hukum.carts", { userId: "hashed" });
sh.shardCollection("hukum.reviews", { productId: "hashed" });
sh.shardCollection("hukum.links", { _id: "hashed" });
sh.shardCollection("hukum.events", { _id: "hashed" });
sh.shardCollection("hukum.products", { category: 1, _id: 1 });

print("✅ Hukum MongoDB Sharded Cluster initialized successfully!");
' || true
