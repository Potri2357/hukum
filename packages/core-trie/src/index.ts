export type SuggestionType = 'phrase' | 'product' | 'brand' | 'category';

export interface SuggestionItem {
  id: string;
  text: string;
  type: SuggestionType;
  score: number;
  metadata?: {
    category?: string;
    imageUrl?: string;
    price?: number;
    searchCount?: number;
    inStock?: boolean;
    brand?: string;
  };
}

export interface TrieScoreWeights {
  w1_searchCount: number;      // log(searchCount)
  w2_recencyDecay: number;     // 1 / (1 + daysAgo)
  w3_ctr: number;              // click-through rate (0..1)
  w4_productPopularity: number;// sold count / views
  w5_inStockBoost: number;     // 1.2x boost if in stock
}

export const DEFAULT_SCORE_WEIGHTS: TrieScoreWeights = {
  w1_searchCount: 0.35,
  w2_recencyDecay: 0.20,
  w3_ctr: 0.15,
  w4_productPopularity: 0.20,
  w5_inStockBoost: 0.10,
};

export function calculateScore(
  searchCount: number = 1,
  daysAgo: number = 0,
  ctr: number = 0.05,
  popularity: number = 10,
  inStock: boolean = true,
  weights: TrieScoreWeights = DEFAULT_SCORE_WEIGHTS
): number {
  const s1 = Math.log10(Math.max(1, searchCount));
  const s2 = 1 / (1 + daysAgo * 0.1);
  const s3 = Math.min(1, ctr * 2);
  const s4 = Math.log10(Math.max(1, popularity));
  const s5 = inStock ? 1.0 : 0.2;

  const total =
    weights.w1_searchCount * s1 +
    weights.w2_recencyDecay * s2 +
    weights.w3_ctr * s3 +
    weights.w4_productPopularity * s4 +
    weights.w5_inStockBoost * s5;

  return Number(total.toFixed(4));
}

export class TrieNode {
  public char: string;
  public children: Map<string, TrieNode> = new Map();
  public isEndOfWord: boolean = false;
  public topK: SuggestionItem[] = []; // Precomputed top-K for O(prefix length) lookup

  constructor(char: string = '') {
    this.char = char;
  }
}

export class AutocompleteTrie {
  private root: TrieNode;
  private topKLimit: number;
  private allItems: Map<string, SuggestionItem> = new Map();

  constructor(topKLimit: number = 10) {
    this.root = new TrieNode();
    this.topKLimit = topKLimit;
  }

  public normalize(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, ' ');
  }

  /**
   * Inserts an item and updates precomputed topK lists on each ancestor node.
   */
  public insert(item: SuggestionItem): void {
    this.allItems.set(item.id, item);
    const normalized = this.normalize(item.text);
    if (!normalized) return;

    let current = this.root;
    this.updateTopK(current, item);

    for (const char of normalized) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode(char));
      }
      current = current.children.get(char)!;
      this.updateTopK(current, item);
    }

    current.isEndOfWord = true;
  }

  private updateTopK(node: TrieNode, item: SuggestionItem): void {
    // Check if item is already in topK
    const existingIndex = node.topK.findIndex((it) => it.id === item.id);
    if (existingIndex !== -1) {
      node.topK[existingIndex] = item;
    } else {
      node.topK.push(item);
    }

    // Sort descending by score
    node.topK.sort((a, b) => b.score - a.score);

    // Prune to topK limit
    if (node.topK.length > this.topKLimit) {
      node.topK = node.topK.slice(0, this.topKLimit);
    }
  }

  /**
   * O(prefix length) search returning precomputed top suggestions.
   */
  public search(prefix: string, limit: number = this.topKLimit): SuggestionItem[] {
    const normalized = this.normalize(prefix);
    if (!normalized) return [];

    let current = this.root;
    for (const char of normalized) {
      if (!current.children.has(char)) {
        // Fallback to typo tolerance if empty or < 3 results
        return this.searchTypoFallback(normalized, limit);
      }
      current = current.children.get(char)!;
    }

    return current.topK.slice(0, limit);
  }

  /**
   * Typo tolerance: edit-distance-1 fallback (transposition, replacement, insertion, deletion)
   */
  private searchTypoFallback(prefix: string, limit: number): SuggestionItem[] {
    if (prefix.length < 3) return [];

    // Check all items for edit distance <= 1 on prefix
    const candidates: Array<{ item: SuggestionItem; dist: number }> = [];

    for (const item of this.allItems.values()) {
      const itemNormalized = this.normalize(item.text);
      const prefixSlice = itemNormalized.slice(0, prefix.length);
      const dist = levenshteinDistance(prefix, prefixSlice);
      if (dist <= 1) {
        candidates.push({ item, dist });
      }
    }

    candidates.sort((a, b) => {
      if (a.dist !== b.dist) return a.dist - b.dist;
      return b.item.score - a.item.score;
    });

    return candidates.slice(0, limit).map((c) => c.item);
  }

  /**
   * Builds trie inspector tree for visualization in System Lab.
   */
  public inspectPrefix(prefix: string) {
    const normalized = this.normalize(prefix);
    const pathNodes: Array<{
      char: string;
      topKSamples: string[];
      childrenCount: number;
    }> = [];

    let current = this.root;
    pathNodes.push({
      char: 'ROOT',
      topKSamples: current.topK.map((i) => i.text).slice(0, 3),
      childrenCount: current.children.size,
    });

    for (const char of normalized) {
      if (current.children.has(char)) {
        current = current.children.get(char)!;
        pathNodes.push({
          char,
          topKSamples: current.topK.map((i) => i.text).slice(0, 3),
          childrenCount: current.children.size,
        });
      } else {
        pathNodes.push({
          char: `${char} (MISS)`,
          topKSamples: [],
          childrenCount: 0,
        });
        break;
      }
    }

    return {
      prefix: normalized,
      path: pathNodes,
      results: current ? current.topK.slice(0, this.topKLimit) : [],
      totalCatalogIndexed: this.allItems.size,
    };
  }

  public getItemCount(): number {
    return this.allItems.size;
  }
}

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}
