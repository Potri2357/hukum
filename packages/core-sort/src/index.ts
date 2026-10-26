import { ConsistentHashRing } from '@hukum/core-ring';

export interface SortableRecord {
  id: string;
  [key: string]: any;
}

export type SortOrder = 'asc' | 'desc';

/**
 * Min-Max Heap implementation for K-Way streaming merge.
 */
export class Heap<T> {
  private data: T[] = [];
  private comparator: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this.comparator = comparator;
  }

  public push(item: T): void {
    this.data.push(item);
    this.bubbleUp(this.data.length - 1);
  }

  public pop(): T | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const bottom = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = bottom;
      this.bubbleDown(0);
    }
    return top;
  }

  public peek(): T | undefined {
    return this.data[0];
  }

  public size(): number {
    return this.data.length;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.comparator(this.data[index], this.data[parentIndex]) < 0) {
        const temp = this.data[index];
        this.data[index] = this.data[parentIndex];
        this.data[parentIndex] = temp;
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  private bubbleDown(index: number): void {
    const length = this.data.length;
    while (true) {
      let target = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.comparator(this.data[left], this.data[target]) < 0) {
        target = left;
      }
      if (right < length && this.comparator(this.data[right], this.data[target]) < 0) {
        target = right;
      }

      if (target !== index) {
        const temp = this.data[index];
        this.data[index] = this.data[target];
        this.data[target] = temp;
        index = target;
      } else {
        break;
      }
    }
  }
}

export interface NodePartition<T extends SortableRecord> {
  nodeId: string;
  records: T[];
}

export interface DistributedSortOptions {
  sortKey: string;
  order?: SortOrder;
  k?: number;
  offset?: number;
  nodeCount?: number;
}

export interface DistributedSortResult<T extends SortableRecord> {
  items: T[];
  totalRecords: number;
  k: number;
  nodesParticipating: number;
  perNodeItemCounts: Record<string, number>;
  executionTimeMs: number;
  correctnessVerified: boolean;
}

/**
 * Executes Scatter-Sort-Merge distributed sorting algorithm.
 */
export function distributedSort<T extends SortableRecord>(
  records: T[],
  options: DistributedSortOptions
): DistributedSortResult<T> {
  const startTime = performance.now();
  const sortKey = options.sortKey;
  const order = options.order ?? 'asc';
  const k = options.k ?? 100;
  const offset = options.offset ?? 0;
  const nodeCount = Math.max(1, options.nodeCount ?? 5);

  // 1. Partition data across nodes using consistent hash ring on record id
  const ring = new ConsistentHashRing({ vnodes: 150 });
  const nodeIds: string[] = [];
  for (let i = 1; i <= nodeCount; i++) {
    const n = `node-${i}`;
    nodeIds.push(n);
    ring.addNode(n);
  }

  const partitions: Map<string, T[]> = new Map();
  for (const n of nodeIds) {
    partitions.set(n, []);
  }

  for (const r of records) {
    const targetNode = ring.getNode(r.id) || nodeIds[0];
    partitions.get(targetNode)!.push(r);
  }

  // Record item distribution per node
  const perNodeCounts: Record<string, number> = {};
  for (const [nodeId, items] of partitions.entries()) {
    perNodeCounts[nodeId] = items.length;
  }

  // 2. Local Sort on each node (in parallel in real architecture)
  const compareFn = (a: T, b: T) => {
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (valA === valB) {
      return a.id.localeCompare(b.id); // Tie-break on id
    }
    if (order === 'asc') {
      return valA < valB ? -1 : 1;
    } else {
      return valA > valB ? -1 : 1;
    }
  };

  const sortedPartitions: Map<string, T[]> = new Map();
  for (const [nodeId, items] of partitions.entries()) {
    const sorted = [...items].sort(compareFn);
    // 3. Top-K Pruning: Each node returns only its top (k + offset)
    sortedPartitions.set(nodeId, sorted.slice(0, k + offset));
  }

  // 4. K-Way Merge using Min-Heap
  interface StreamPointer {
    nodeId: string;
    item: T;
    streamIndex: number;
  }

  const heap = new Heap<StreamPointer>((a, b) => compareFn(a.item, b.item));

  // Initialize heap with first item from each partition
  for (const [nodeId, items] of sortedPartitions.entries()) {
    if (items.length > 0) {
      heap.push({
        nodeId,
        item: items[0],
        streamIndex: 0,
      });
    }
  }

  const mergedItems: T[] = [];
  const targetCount = k + offset;

  while (heap.size() > 0 && mergedItems.length < targetCount) {
    const top = heap.pop()!;
    mergedItems.push(top.item);

    const partition = sortedPartitions.get(top.nodeId)!;
    const nextIndex = top.streamIndex + 1;
    if (nextIndex < partition.length) {
      heap.push({
        nodeId: top.nodeId,
        item: partition[nextIndex],
        streamIndex: nextIndex,
      });
    }
  }

  const finalItems = mergedItems.slice(offset, offset + k);
  const endTime = performance.now();

  // 5. Ground truth verification (Single-node global sort)
  const groundTruth = [...records].sort(compareFn).slice(offset, offset + k);
  const isCorrect =
    finalItems.length === groundTruth.length &&
    finalItems.every((item, idx) => item.id === groundTruth[idx].id);

  return {
    items: finalItems,
    totalRecords: records.length,
    k,
    nodesParticipating: nodeCount,
    perNodeItemCounts: perNodeCounts,
    executionTimeMs: Number((endTime - startTime).toFixed(2)),
    correctnessVerified: isCorrect,
  };
}
