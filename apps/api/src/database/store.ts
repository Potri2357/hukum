import crypto from 'crypto';

export interface Document {
  _id: string;
  [key: string]: any;
}

export interface ShardInfo {
  id: string;
  name: string;
  status: 'ACTIVE' | 'DRAINING';
  chunksCount: number;
  documentsCount: number;
  memoryEstimateKb: number;
}

export interface QueryRoutingExplain {
  query: any;
  collection: string;
  shardKey: string;
  queryType: 'TARGETED' | 'SCATTER_GATHER';
  shardsContacted: string[];
  totalShards: number;
  executionTimeMs: number;
  explanation: string;
}

/**
 * Universal Store providing in-memory MongoDB compatibility and
 * a complete horizontal MongoDB Sharding Simulator.
 */
export class MemoryStore {
  private collections: Map<string, Map<string, Document>> = new Map();

  // Sharding Simulator state
  private shards: Map<string, ShardInfo> = new Map();
  private shardKeyConfig: Map<string, string> = new Map();
  private chunkPlacements: Map<string, string> = new Map(); // hashPrefix -> shardId

  constructor() {
    this.initDefaultCollections();
    this.initDefaultShards();
  }

  private initDefaultCollections() {
    const defaultCols = [
      'users',
      'products',
      'categories',
      'orders',
      'carts',
      'links',
      'reviews',
      'coupons',
      'crawl_jobs',
      'crawled_items',
      'events',
      'audit_logs',
    ];
    for (const col of defaultCols) {
      this.collections.set(col, new Map());
    }

    // Shard keys per PRD §7.3
    this.shardKeyConfig.set('orders', 'userId');
    this.shardKeyConfig.set('carts', 'userId');
    this.shardKeyConfig.set('reviews', 'productId');
    this.shardKeyConfig.set('links', '_id');
    this.shardKeyConfig.set('events', '_id');
    this.shardKeyConfig.set('products', 'category');
  }

  private initDefaultShards() {
    this.shards.set('shard-a', {
      id: 'shard-a',
      name: 'Shard A (Primary RS 1)',
      status: 'ACTIVE',
      chunksCount: 34,
      documentsCount: 0,
      memoryEstimateKb: 120,
    });
    this.shards.set('shard-b', {
      id: 'shard-b',
      name: 'Shard B (Primary RS 2)',
      status: 'ACTIVE',
      chunksCount: 33,
      documentsCount: 0,
      memoryEstimateKb: 118,
    });
    this.shards.set('shard-c', {
      id: 'shard-c',
      name: 'Shard C (Primary RS 3)',
      status: 'ACTIVE',
      chunksCount: 33,
      documentsCount: 0,
      memoryEstimateKb: 115,
    });
  }

  public getCollection(name: string): Map<string, Document> {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Map());
    }
    return this.collections.get(name)!;
  }

  public insertOne<T extends Document>(collectionName: string, doc: T): T {
    const col = this.getCollection(collectionName);
    if (!doc._id) {
      doc._id = crypto.randomUUID();
    }
    col.set(doc._id, { ...doc });
    this.updateShardMetrics(collectionName, doc);
    return doc;
  }

  public insertMany<T extends Document>(collectionName: string, docs: T[]): T[] {
    return docs.map((d) => this.insertOne(collectionName, d));
  }

  public findById<T extends Document>(collectionName: string, id: string): T | null {
    const col = this.getCollection(collectionName);
    const item = col.get(id);
    return item ? ({ ...item } as T) : null;
  }

  public find<T extends Document>(collectionName: string, filter: Record<string, any> = {}): T[] {
    const col = this.getCollection(collectionName);
    const results: T[] = [];

    for (const doc of col.values()) {
      let matches = true;
      for (const [key, val] of Object.entries(filter)) {
        if (val !== undefined && doc[key] !== val) {
          matches = false;
          break;
        }
      }
      if (matches) {
        results.push({ ...doc } as T);
      }
    }

    return results;
  }

  public findOne<T extends Document>(collectionName: string, filter: Record<string, any>): T | null {
    const items = this.find<T>(collectionName, filter);
    return items.length > 0 ? items[0] : null;
  }

  public updateOne<T extends Document>(
    collectionName: string,
    id: string,
    update: Partial<T>
  ): T | null {
    const col = this.getCollection(collectionName);
    const item = col.get(id);
    if (!item) return null;

    const updated = { ...item, ...update, _id: id };
    col.set(id, updated);
    return updated as T;
  }

  public deleteOne(collectionName: string, id: string): boolean {
    const col = this.getCollection(collectionName);
    return col.delete(id);
  }

  public count(collectionName: string, filter: Record<string, any> = {}): number {
    return this.find(collectionName, filter).length;
  }

  // --- Horizontal Sharding Simulation Engine ---

  /**
   * Explains query routing: identifies if a query is TARGETED or SCATTER-GATHER.
   */
  public explainRouting(collectionName: string, query: Record<string, any>): QueryRoutingExplain {
    const shardKey = this.shardKeyConfig.get(collectionName) || '_id';
    const hasShardKey = query[shardKey] !== undefined;

    const allShardIds = Array.from(this.shards.keys());
    let shardsContacted: string[] = [];
    let queryType: 'TARGETED' | 'SCATTER_GATHER';
    let explanation: string;

    if (hasShardKey) {
      queryType = 'TARGETED';
      const hashVal = crypto.createHash('md5').update(String(query[shardKey])).digest('hex');
      const shardIdx = parseInt(hashVal.slice(0, 4), 16) % allShardIds.length;
      shardsContacted = [allShardIds[shardIdx]];
      explanation = `Optimal single-shard targeted query. mongos router hashed '${shardKey}' to route directly to ${shardsContacted[0]} with zero network scatter.`;
    } else {
      queryType = 'SCATTER_GATHER';
      shardsContacted = [...allShardIds];
      explanation = `Scatter-Gather query! Filter lacks shard key '${shardKey}'. mongos broadcast query to ALL ${allShardIds.length} shards and merged results, increasing cluster latency.`;
    }

    return {
      query,
      collection: collectionName,
      shardKey,
      queryType,
      shardsContacted,
      totalShards: allShardIds.length,
      executionTimeMs: queryType === 'TARGETED' ? 1.2 : 4.8,
      explanation,
    };
  }

  public getShardTopology() {
    return Array.from(this.shards.values());
  }

  public addSimulatedShard(shardId: string, name: string): ShardInfo {
    const newShard: ShardInfo = {
      id: shardId,
      name,
      status: 'ACTIVE',
      chunksCount: 0,
      documentsCount: 0,
      memoryEstimateKb: 0,
    };
    this.shards.set(shardId, newShard);
    this.rebalanceChunks();
    return newShard;
  }

  private rebalanceChunks() {
    const shardList = Array.from(this.shards.values());
    const totalChunks = 100;
    const chunksPerShard = Math.floor(totalChunks / shardList.length);
    let remainder = totalChunks % shardList.length;

    for (const shard of shardList) {
      shard.chunksCount = chunksPerShard + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
    }
  }

  private updateShardMetrics(collectionName: string, doc: Document) {
    const shardKey = this.shardKeyConfig.get(collectionName) || '_id';
    const keyVal = doc[shardKey] || doc._id;
    const hashVal = crypto.createHash('md5').update(String(keyVal)).digest('hex');
    const allShardIds = Array.from(this.shards.keys());
    const shardIndex = parseInt(hashVal.slice(0, 4), 16) % allShardIds.length;
    const targetShard = this.shards.get(allShardIds[shardIndex]);
    if (targetShard) {
      targetShard.documentsCount++;
      targetShard.memoryEstimateKb += 1.5;
    }
  }

  /**
   * Hot Shard Demo: Generates 1,000 synthetic inserts with either:
   * 1. Monotonic timestamp key (causing 100% of writes to hotspot on 1 shard)
   * 2. Hashed shard key (producing uniform load distribution across all shards)
   */
  public runHotShardDemo(useHashedKey: boolean) {
    const shardLoads: Record<string, number> = {};
    const shardIds = Array.from(this.shards.keys());
    for (const sid of shardIds) shardLoads[sid] = 0;

    const sampleCount = 1000;
    const now = Date.now();

    for (let i = 0; i < sampleCount; i++) {
      let keyToHash: string;
      if (useHashedKey) {
        // Hashed key: random user UUID creates even hash distribution
        keyToHash = `usr_${crypto.randomBytes(8).toString('hex')}`;
      } else {
        // Poor monotonic key: sequential timestamp causes single shard hotspot
        const timestamp = now + i * 10;
        keyToHash = `time_${Math.floor(timestamp / 1000000)}`;
      }

      const hashVal = crypto.createHash('md5').update(keyToHash).digest('hex');
      const idx = parseInt(hashVal.slice(0, 4), 16) % shardIds.length;
      shardLoads[shardIds[idx]]++;
    }

    const loads = Object.values(shardLoads);
    const mean = sampleCount / shardIds.length;
    const maxSkewPct = Math.max(...loads.map((l) => Math.abs(l - mean) / mean)) * 100;

    return {
      strategy: useHashedKey ? 'HASHED_KEY (userId)' : 'POOR_MONOTONIC_KEY (createdAt)',
      sampleCount,
      shardLoads,
      maxSkewPct: Number(maxSkewPct.toFixed(2)),
      verdict: maxSkewPct <= 15 ? 'BALANCED (Skew ≤ 15%)' : 'HOTSPOT DETECTED (High Skew)',
    };
  }
}

export const db = new MemoryStore();
