import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { generateShortCode, normalizeUrl, simulateCollisions, encodeBase62, decodeBase62 } from '../packages/core-hash/dist/index.js';
import { ConsistentHashRing, analyzeRebalancing, murmurHash3 } from '../packages/core-ring/dist/index.js';
import { InMemoryTokenBucket, simulateRateLimiters } from '../packages/core-ratelimit/dist/index.js';
import { AutocompleteTrie, calculateScore, levenshteinDistance } from '../packages/core-trie/dist/index.js';
import { distributedSort } from '../packages/core-sort/dist/index.js';
import { RobotsParser, isSafeUrl, extractProductFromHtml, computeSimHash } from '../packages/crawler/dist/index.js';

describe('Module 1: URL Shortener with Hashing & Base62', () => {
  test('Base62 encoding and decoding round-trip', () => {
    const original = 1420938491823n;
    const encoded = encodeBase62(original, 7);
    const decoded = decodeBase62(encoded);
    assert.equal(decoded, original);
  });

  test('URL normalization strips tracking params and sorts query', () => {
    const raw = 'HTTPS://Hukum.in/Product/123?utm_source=google&b=2&a=1#section';
    const normalized = normalizeUrl(raw);
    assert.equal(normalized, 'https://hukum.in/Product/123?a=1&b=2');
  });

  test('Idempotent short code generation for identical URL and salt', () => {
    const url = 'https://hukum.in/products/aurora-x-pro-5g';
    const res1 = generateShortCode(url, { salt: 'test_salt_123' });
    const res2 = generateShortCode(url, { salt: 'test_salt_123' });
    assert.equal(res1.code, res2.code);
    assert.equal(res1.code.length, 7);
  });

  test('Collision simulation maintains low collision rate at scale', () => {
    const sim = simulateCollisions(1000, 7);
    assert.equal(sim.collisions, 0);
  });
});

describe('Module 4: Consistent Hash Ring & Distributed Sort', () => {
  test('MurmurHash3 generates consistent 32-bit hashes', () => {
    const h1 = murmurHash3('product-key-1');
    const h2 = murmurHash3('product-key-1');
    assert.equal(h1, h2);
    assert.ok(h1 > 0);
  });

  test('Ring distributes keys evenly across physical nodes with vnodes', () => {
    const ring = new ConsistentHashRing({ vnodes: 150 });
    ring.addNode('node-1');
    ring.addNode('node-2');
    ring.addNode('node-3');

    const sampleKeys = Array.from({ length: 300 }, (_, i) => `key_${i}`);
    const dist = ring.getDistribution(sampleKeys);

    for (const [node, stats] of Object.entries(dist)) {
      assert.ok(stats.count > 60, `Node ${node} has count ${stats.count}, expected > 60`);
    }
  });

  test('Adding 1 node rebalances only ~ 1/(N+1) keys, outperforming naive modulo', () => {
    const keys = Array.from({ length: 1000 }, (_, i) => `order_${i}`);
    const analysis = analyzeRebalancing(4, keys);

    // Consistent hashing should move ~ 20% (1/5) of keys
    assert.ok(analysis.consistentHashing.percentageRemapped < 30);
    // Naive modulo reallocates ~ 80% (4/5) of keys
    assert.ok(analysis.moduloHashing.percentageRemapped > 70);
  });

  test('Distributed Scatter-Sort-Merge exactly matches single-node ground truth', () => {
    const dataset = Array.from({ length: 150 }, (_, i) => ({
      id: `prod_${i}`,
      title: `Product ${i}`,
      price: Math.floor(Math.random() * 50000) + 500,
    }));

    const distResult = distributedSort(dataset, {
      sortKey: 'price',
      order: 'asc',
      k: 25,
      nodeCount: 4,
    });

    assert.equal(distResult.items.length, 25);
    assert.equal(distResult.correctnessVerified, true);

    // Verify sorted ascending
    for (let i = 1; i < distResult.items.length; i++) {
      assert.ok(distResult.items[i].price >= distResult.items[i - 1].price);
    }
  });
});

describe('Module 5: Token Bucket Rate Limiter', () => {
  test('Allows bursts up to capacity then rate limits strictly', () => {
    const bucket = new InMemoryTokenBucket();
    const capacity = 10;
    const refillRate = 2; // 2 tokens/sec

    // Consume all 10 tokens
    for (let i = 0; i < capacity; i++) {
      const res = bucket.consume('client_1', capacity, refillRate, 1);
      assert.equal(res.allowed, true);
    }

    // 11th request must be rejected
    const blocked = bucket.consume('client_1', capacity, refillRate, 1);
    assert.equal(blocked.allowed, false);
    assert.ok(blocked.retryAfterMs > 0);
    assert.ok(blocked.headers['Retry-After']);
  });

  test('Comparative burst simulator differentiates algorithms', () => {
    const sim = simulateRateLimiters(50, 20, 10, 2);
    assert.ok(sim.summary.tokenBucket.allowed > 0);
    assert.ok(sim.summary.tokenBucket.rejected > 0);
  });
});

describe('Module 6: Trie Autocomplete with Top-K & Typo Fallback', () => {
  test('Precomputed top-K returns highest scoring results instantly', () => {
    const trie = new AutocompleteTrie(5);
    trie.insert({ id: '1', text: 'iphone 15 pro', type: 'product', score: 9.5 });
    trie.insert({ id: '2', text: 'iphone 14', type: 'product', score: 7.0 });
    trie.insert({ id: '3', text: 'ipad air', type: 'product', score: 8.0 });

    const results = trie.search('iph');
    assert.equal(results.length, 2);
    assert.equal(results[0].text, 'iphone 15 pro');
    assert.equal(results[1].text, 'iphone 14');
  });

  test('Typo tolerance fallback catches single character typos', () => {
    const trie = new AutocompleteTrie(5);
    trie.insert({ id: '1', text: 'samsung galaxy', type: 'product', score: 8.0 });

    // Typo: 'samsun' instead of 'samsung'
    const results = trie.search('samsun');
    assert.ok(results.length > 0);
    assert.equal(results[0].text, 'samsung galaxy');
  });
});

describe('Module 7: Web Crawler & Compliance Guardrails', () => {
  test('RobotsParser strictly enforces Disallow paths', () => {
    const robotsTxt = `
User-agent: *
Disallow: /admin/
Disallow: /checkout
Allow: /admin/public
Crawl-delay: 2
    `;

    const parser = new RobotsParser(robotsTxt, 'HukumBot');
    assert.equal(parser.isAllowed('/products/shoes'), true);
    assert.equal(parser.isAllowed('/admin/settings'), false);
    assert.equal(parser.isAllowed('/admin/public'), true);
    assert.equal(parser.getCrawlDelay(), 2);
  });

  test('SSRF Guard blocks private IP ranges and cloud metadata endpoints', () => {
    const awsMetadata = isSafeUrl('http://169.254.169.254/latest/meta-data/');
    assert.equal(awsMetadata.safe, false);

    const privateIp = isSafeUrl('http://192.168.1.1/router');
    assert.equal(privateIp.safe, false);

    const allowlisted = isSafeUrl('http://localhost:5050/products', ['localhost']);
    assert.equal(allowlisted.safe, true);
  });

  test('Cheerio extracts JSON-LD Product schema from HTML', () => {
    const mockHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Sony WH-1000XM5",
          "image": "https://example.com/sony.jpg",
          "description": "Industry leading noise cancelling headphones",
          "brand": { "@type": "Brand", "name": "Sony" },
          "offers": {
            "@type": "Offer",
            "price": "26990",
            "priceCurrency": "INR"
          }
        }
        </script>
      </head>
      <body><h1>Sony WH-1000XM5</h1></body>
      </html>
    `;

    const product = extractProductFromHtml(mockHtml, 'https://example.com/sony');
    assert.ok(product);
    assert.equal(product.title, 'Sony WH-1000XM5');
    assert.equal(product.price, 26990);
    assert.equal(product.brand, 'Sony');
    assert.equal(product.extractionMethod, 'json-ld');
  });

  test('SimHash produces deterministic hash for content deduplication', () => {
    const h1 = computeSimHash('Flagship smartphone with 120Hz display and 200MP camera');
    const h2 = computeSimHash('Flagship smartphone with 120Hz display and 200MP camera');
    assert.equal(h1, h2);
  });
});
