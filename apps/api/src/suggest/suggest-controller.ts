import { Router, Request, Response } from 'express';
import { AutocompleteTrie, calculateScore, SuggestionItem } from '@hukum/core-trie';
import { db } from '../database/store';
import { createRateLimiter } from '../ratelimit/ratelimit-middleware';

export const suggestRouter = Router();

export const trie = new AutocompleteTrie(10);

/**
 * Initializes and rebuilds the Trie from catalog products, brands, and categories.
 */
export function rebuildAutocompleteTrie() {
  const products = db.find('products');

  // 1. Index products
  for (const p of products) {
    const score = calculateScore(
      p.soldCount || 10,
      1,
      0.15,
      p.ratingCount || 50,
      p.inStock !== false
    );

    trie.insert({
      id: `prod_${p._id}`,
      text: p.title,
      type: 'product',
      score,
      metadata: {
        category: p.category,
        imageUrl: p.media?.[0] || p.image,
        price: p.minPrice || p.price,
        brand: p.brand,
      },
    });

    // 2. Index brands
    if (p.brand) {
      trie.insert({
        id: `brand_${p.brand.toLowerCase()}`,
        text: p.brand,
        type: 'brand',
        score: score * 1.1,
        metadata: { category: p.category },
      });
    }
  }

  // 3. Index categories
  const categories = db.find('categories');
  for (const c of categories) {
    trie.insert({
      id: `cat_${c._id}`,
      text: c.name,
      type: 'category',
      score: 1.5,
    });
  }

  // 4. Common e-commerce search phrases
  const popularPhrases = [
    'iphone 15 pro max',
    'samsung galaxy s24 ultra',
    'wireless noise cancelling headphones',
    'smart watch with calling',
    'mechanical keyboard rgb',
    'gaming laptop rtx 4060',
    'running shoes men',
    'bluetooth earphones under 2000',
    'fast charger 65w type c',
  ];

  for (const phrase of popularPhrases) {
    trie.insert({
      id: `phrase_${phrase.replace(/\s+/g, '_')}`,
      text: phrase,
      type: 'phrase',
      score: 1.2,
    });
  }
}

/**
 * Live Suggestion API
 */
suggestRouter.get(
  '/suggest',
  createRateLimiter('search_suggest'),
  (req: Request, res: Response) => {
    const start = performance.now();
    const { q, limit = '8' } = req.query;

    if (!q || typeof q !== 'string') {
      return res.json({ suggestions: [], latencyMs: 0 });
    }

    const maxLimit = Math.min(20, parseInt(String(limit), 10) || 8);
    const suggestions = trie.search(q, maxLimit);
    const latencyMs = Number((performance.now() - start).toFixed(2));

    res.json({
      query: q,
      count: suggestions.length,
      latencyMs,
      suggestions,
    });
  }
);

/**
 * Trending Searches
 */
suggestRouter.get('/search/trending', (_req: Request, res: Response) => {
  res.json({
    trending: [
      'iPhone 15',
      'ANC Headphones',
      'Smart Watch',
      'Mechanical Keyboard',
      'MacBook Air M3',
      'Fast Charger',
    ],
  });
});

/**
 * Trie Tree Inspector for System Lab
 */
suggestRouter.get('/suggest/inspect', (req: Request, res: Response) => {
  const { q = 'iph' } = req.query;
  const inspectorData = trie.inspectPrefix(String(q));
  res.json(inspectorData);
});
