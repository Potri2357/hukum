import crypto from 'crypto';

/**
 * 32-bit MurmurHash3 implementation.
 */
export function murmurHash3(key: string, seed: number = 0): number {
  let h1 = seed >>> 0;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;

  const bytes = Buffer.from(key, 'utf8');
  const remainder = bytes.length & 3;
  const numBlocks = (bytes.length - remainder) / 4;

  for (let i = 0; i < numBlocks; i++) {
    const offset = i * 4;
    let k1 =
      (bytes[offset] & 0xff) |
      ((bytes[offset + 1] & 0xff) << 8) |
      ((bytes[offset + 2] & 0xff) << 16) |
      ((bytes[offset + 3] & 0xff) << 24);

    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = Math.imul(h1, 5) + 0xe6546b64;
  }

  let k1 = 0;
  const tailIndex = numBlocks * 4;
  if (remainder === 3) k1 ^= (bytes[tailIndex + 2] & 0xff) << 16;
  if (remainder >= 2) k1 ^= (bytes[tailIndex + 1] & 0xff) << 8;
  if (remainder >= 1) {
    k1 ^= bytes[tailIndex] & 0xff;
    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);
    h1 ^= k1;
  }

  h1 ^= bytes.length;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
}

export function md5Hash32(key: string): number {
  const hash = crypto.createHash('md5').update(key).digest();
  return hash.readUInt32BE(0);
}

export type HashAlgorithm = 'murmur3' | 'md5';

export interface RingOptions {
  vnodes?: number;
  replicas?: number;
  algorithm?: HashAlgorithm;
}

export interface VNodeEntry {
  hash: number;
  nodeId: string;
  vnodeIndex: number;
}

export class ConsistentHashRing {
  private vnodes: number;
  private replicas: number;
  private algorithm: HashAlgorithm;
  private ring: VNodeEntry[] = [];
  private nodes: Set<string> = new Set();

  constructor(options: RingOptions = {}) {
    this.vnodes = options.vnodes ?? 150;
    this.replicas = options.replicas ?? 2;
    this.algorithm = options.algorithm ?? 'murmur3';
  }

  public hash(key: string): number {
    if (this.algorithm === 'md5') {
      return md5Hash32(key);
    }
    return murmurHash3(key);
  }

  public addNode(nodeId: string): void {
    if (this.nodes.has(nodeId)) return;
    this.nodes.add(nodeId);

    for (let i = 0; i < this.vnodes; i++) {
      const vnodeKey = `${nodeId}#vnode#${i}`;
      const hashVal = this.hash(vnodeKey);
      this.ring.push({
        hash: hashVal,
        nodeId,
        vnodeIndex: i,
      });
    }

    this.ring.sort((a, b) => a.hash - b.hash);
  }

  public removeNode(nodeId: string): void {
    if (!this.nodes.has(nodeId)) return;
    this.nodes.delete(nodeId);
    this.ring = this.ring.filter((entry) => entry.nodeId !== nodeId);
  }

  public getNodes(): string[] {
    return Array.from(this.nodes);
  }

  public getNodeCount(): number {
    return this.nodes.size;
  }

  public getVNodes(): VNodeEntry[] {
    return [...this.ring];
  }

  /**
   * Finds the primary node responsible for the given key using binary search on the ring.
   */
  public getNode(key: string): string | null {
    if (this.ring.length === 0) return null;

    const keyHash = this.hash(key);
    let low = 0;
    let high = this.ring.length - 1;

    // Binary search for first entry with entry.hash >= keyHash
    let targetIndex = 0;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (this.ring[mid].hash >= keyHash) {
        targetIndex = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    // Wrap-around if keyHash is greater than all hashes in the ring
    if (this.ring[targetIndex].hash < keyHash) {
      targetIndex = 0;
    }

    return this.ring[targetIndex].nodeId;
  }

  /**
   * Returns R distinct physical replica nodes for fault tolerance.
   */
  public getReplicas(key: string, count: number = this.replicas): string[] {
    if (this.ring.length === 0) return [];
    const keyHash = this.hash(key);

    let low = 0;
    let high = this.ring.length - 1;
    let startIndex = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (this.ring[mid].hash >= keyHash) {
        startIndex = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    const distinctNodes: string[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < this.ring.length; i++) {
      const index = (startIndex + i) % this.ring.length;
      const node = this.ring[index].nodeId;
      if (!seen.has(node)) {
        seen.add(node);
        distinctNodes.push(node);
        if (distinctNodes.length >= count || distinctNodes.length >= this.nodes.size) {
          break;
        }
      }
    }

    return distinctNodes;
  }

  /**
   * Returns the key distribution across all physical nodes.
   */
  public getDistribution(sampleKeys: string[]): Record<string, { count: number; percentage: number }> {
    const counts: Record<string, number> = {};
    for (const node of this.nodes) {
      counts[node] = 0;
    }

    for (const key of sampleKeys) {
      const node = this.getNode(key);
      if (node && counts[node] !== undefined) {
        counts[node]++;
      }
    }

    const total = sampleKeys.length || 1;
    const distribution: Record<string, { count: number; percentage: number }> = {};
    for (const node of this.nodes) {
      const count = counts[node] || 0;
      distribution[node] = {
        count,
        percentage: Number(((count / total) * 100).toFixed(2)),
      };
    }

    return distribution;
  }
}

/**
 * Rebalancing analysis: compares Consistent Hashing with Modulo N hashing
 * when adding a node to a cluster of N nodes.
 */
export function analyzeRebalancing(
  initialNodeCount: number,
  keys: string[],
  vnodes: number = 150
) {
  // Consistent Hashing
  const ring = new ConsistentHashRing({ vnodes });
  for (let i = 1; i <= initialNodeCount; i++) {
    ring.addNode(`node-${i}`);
  }

  const initialMapping: Record<string, string> = {};
  for (const k of keys) {
    initialMapping[k] = ring.getNode(k)!;
  }

  // Add (N+1)-th node
  const newNode = `node-${initialNodeCount + 1}`;
  ring.addNode(newNode);

  let ringRemapped = 0;
  for (const k of keys) {
    const newTarget = ring.getNode(k)!;
    if (newTarget !== initialMapping[k]) {
      ringRemapped++;
    }
  }

  // Modulo Hashing
  let moduloRemapped = 0;
  for (const k of keys) {
    const h = murmurHash3(k);
    const oldNode = h % initialNodeCount;
    const newNodeIndex = h % (initialNodeCount + 1);
    if (oldNode !== newNodeIndex) {
      moduloRemapped++;
    }
  }

  const total = keys.length;
  const theoreticalRingRemap = 1 / (initialNodeCount + 1);
  const actualRingPct = (ringRemapped / total) * 100;
  const moduloPct = (moduloRemapped / total) * 100;

  return {
    initialNodeCount,
    newNodeCount: initialNodeCount + 1,
    totalKeys: total,
    consistentHashing: {
      keysRemapped: ringRemapped,
      percentageRemapped: Number(actualRingPct.toFixed(2)),
      theoreticalPercentage: Number((theoreticalRingRemap * 100).toFixed(2)),
      deviationMultiplier: Number((actualRingPct / (theoreticalRingRemap * 100)).toFixed(2)),
    },
    moduloHashing: {
      keysRemapped: moduloRemapped,
      percentageRemapped: Number(moduloPct.toFixed(2)),
    },
  };
}
