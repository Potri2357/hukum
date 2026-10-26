import { Router, Request, Response } from 'express';
import { db } from '../database/store';
import { cache } from '../cache/cache-service';
import { rateLimiterManager, ROUTE_POLICIES } from '../ratelimit/ratelimit-middleware';
import { trie } from '../suggest/suggest-controller';
import { ConsistentHashRing, analyzeRebalancing } from '@hukum/core-ring';
import { distributedSort } from '@hukum/core-sort';
import { simulateCollisions } from '@hukum/core-hash';
import { simulateRateLimiters } from '@hukum/core-ratelimit';

export const labRouter = Router();

// Lab Ring Instance for interactive canvas visualizer
export const labRing = new ConsistentHashRing({ vnodes: 150 });
for (let i = 1; i <= 5; i++) {
  labRing.addNode(`Node-${i}`);
}

/**
 * System Overview Metrics
 */
labRouter.get('/lab/overview', (_req: Request, res: Response) => {
  const cacheMetrics = cache.getMetrics();
  const rlStats = rateLimiterManager.getStats();
  const shardTopology = db.getShardTopology();

  res.json({
    status: 'HEALTHY',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    metrics: {
      totalRequests: cacheMetrics.totalRequests + rlStats.allowedCount + rlStats.blockedCount,
      cacheHitRatioPct: cacheMetrics.hitRatioPct,
      cacheEnabled: cacheMetrics.isCacheEnabled,
      rateLimiterEnabled: rlStats.isEnabled,
      activeShards: shardTopology.length,
      ringNodes: labRing.getNodeCount(),
      catalogCount: db.count('products'),
      ordersCount: db.count('orders'),
      autocompleteIndexed: trie.getItemCount(),
    },
  });
});

/**
 * Cache Monitor & Controls
 */
labRouter.get('/lab/cache/metrics', (_req: Request, res: Response) => {
  res.json(cache.getMetrics());
});

labRouter.post('/lab/cache/toggle', (req: Request, res: Response) => {
  const { enabled } = req.body;
  if (typeof enabled === 'boolean') {
    cache.setCacheEnabled(enabled);
  }
  res.json({ message: `Cache ${cache.isCacheEnabled ? 'ENABLED' : 'DISABLED'}`, cacheMetrics: cache.getMetrics() });
});

labRouter.post('/lab/cache/reset', (_req: Request, res: Response) => {
  cache.resetMetrics();
  res.json({ message: 'Cache metrics reset', cacheMetrics: cache.getMetrics() });
});

/**
 * Shard Explorer: Topology & Routing Explain
 */
labRouter.get('/lab/shards', (_req: Request, res: Response) => {
  res.json({
    shards: db.getShardTopology(),
  });
});

labRouter.post('/lab/shards/explain', (req: Request, res: Response) => {
  const { collection = 'orders', query = {} } = req.body;
  const explain = db.explainRouting(collection, query);
  res.json({ explain });
});

labRouter.post('/lab/shards/add', (req: Request, res: Response) => {
  const { shardId = 'shard-d', name = 'Shard D (Dynamic Rebalance RS)' } = req.body;
  const newShard = db.addSimulatedShard(shardId, name);
  res.json({
    message: `Shard ${shardId} added and cluster chunks auto-rebalanced!`,
    newShard,
    allShards: db.getShardTopology(),
  });
});

labRouter.post('/lab/shards/hot-shard-demo', (req: Request, res: Response) => {
  const { useHashedKey = true } = req.body;
  const report = db.runHotShardDemo(Boolean(useHashedKey));
  res.json({ report });
});

/**
 * Consistent Hash Ring & Distributed Sort
 */
labRouter.get('/lab/ring', (_req: Request, res: Response) => {
  res.json({
    nodes: labRing.getNodes(),
    vnodesCount: labRing.getVNodes().length,
    vnodesSample: labRing.getVNodes().slice(0, 30),
  });
});

labRouter.post('/lab/ring/nodes', (req: Request, res: Response) => {
  const { nodeId, action = 'add' } = req.body;
  if (!nodeId) return res.status(400).json({ error: 'nodeId is required' });

  if (action === 'add') {
    labRing.addNode(nodeId);
  } else if (action === 'remove') {
    labRing.removeNode(nodeId);
  }

  res.json({
    message: `Node ${nodeId} ${action === 'add' ? 'added to' : 'removed from'} ring`,
    nodes: labRing.getNodes(),
    totalNodes: labRing.getNodeCount(),
  });
});

labRouter.post('/lab/ring/rebalance-analysis', (req: Request, res: Response) => {
  const { initialNodes = 5, keyCount = 1000 } = req.body;
  const keys = Array.from({ length: keyCount }, (_, i) => `product_key_${i}`);
  const report = analyzeRebalancing(initialNodes, keys);
  res.json({ report });
});

/**
 * Distributed Sort API
 */
labRouter.get('/lab/sort', (req: Request, res: Response) => {
  const { by = 'minPrice', order = 'asc', k = '50', nodes = '5' } = req.query;
  const products = db.find('products').map((p) => ({ id: p._id, ...p }));

  const result = distributedSort(products, {
    sortKey: String(by),
    order: (order as any) === 'desc' ? 'desc' : 'asc',
    k: parseInt(String(k), 10) || 50,
    nodeCount: parseInt(String(nodes), 10) || 5,
  });

  res.json({ result });
});

/**
 * Rate Limiter Monitor & Burst Simulator
 */
labRouter.get('/lab/ratelimit/stats', (_req: Request, res: Response) => {
  res.json(rateLimiterManager.getStats());
});

labRouter.post('/lab/ratelimit/toggle', (req: Request, res: Response) => {
  const { enabled } = req.body;
  if (typeof enabled === 'boolean') {
    rateLimiterManager.setEnabled(enabled);
  }
  res.json({ message: `Rate limiter ${rateLimiterManager.isEnabled ? 'ENABLED' : 'DISABLED'}` });
});

labRouter.post('/lab/ratelimit/burst-simulate', (req: Request, res: Response) => {
  const { totalRequests = 200, intervalMs = 20, capacity = 30, refillPerSec = 5 } = req.body;
  const simulation = simulateRateLimiters(totalRequests, intervalMs, capacity, refillPerSec);
  res.json({ simulation });
});

/**
 * URL Shortener Collision Simulation
 */
labRouter.post('/lab/shortener/collision-simulate', (req: Request, res: Response) => {
  const { sampleSize = 10000, length = 7 } = req.body;
  const report = simulateCollisions(sampleSize, length);
  res.json({ report });
});
