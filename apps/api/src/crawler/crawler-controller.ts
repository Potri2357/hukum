import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { RobotsParser, isSafeUrl, extractProductFromHtml, discoverLinks } from '@hukum/crawler';
import { db } from '../database/store';
import { rebuildAutocompleteTrie } from '../suggest/suggest-controller';

export const crawlerRouter = Router();

const CRAWLER_ALLOWLIST = (process.env.CRAWLER_ALLOWLIST || 'mock-seller-site,localhost,127.0.0.1').split(',');

/**
 * Start Crawl Job
 */
crawlerRouter.post('/crawler/jobs', async (req: Request, res: Response) => {
  const { seedUrl = 'http://localhost:5050', maxPages = 10 } = req.body;

  // SSRF Protection Check
  const ssrfCheck = isSafeUrl(seedUrl, CRAWLER_ALLOWLIST);
  if (!ssrfCheck.safe) {
    return res.status(400).json({ error: `Crawl rejected by SSRF guard: ${ssrfCheck.reason}` });
  }

  const jobId = `cj_${crypto.randomBytes(6).toString('hex')}`;
  const job = db.insertOne('crawl_jobs', {
    _id: jobId,
    seedUrl,
    status: 'RUNNING',
    maxPages,
    pagesCrawled: 0,
    itemsFound: 0,
    startedAt: new Date().toISOString(),
    logs: [`Initialized job ${jobId} targeting ${seedUrl}`],
  });

  // Execute crawl asynchronously
  runCrawl(jobId, seedUrl, maxPages);

  res.status(202).json({
    message: 'Crawl job scheduled and started',
    jobId,
    status: job.status,
  });
});

async function runCrawl(jobId: string, seedUrl: string, maxPages: number) {
  const logs: string[] = [`Starting crawl at ${seedUrl}`];
  let pagesCrawled = 0;
  let itemsFound = 0;

  try {
    const origin = new URL(seedUrl).origin;
    logs.push(`Fetching robots.txt from ${origin}/robots.txt`);

    // 1. Fetch robots.txt
    let robotsParser: RobotsParser;
    try {
      const robotsRes = await fetch(`${origin}/robots.txt`);
      if (robotsRes.ok) {
        const text = await robotsRes.text();
        robotsParser = new RobotsParser(text, 'HukumBot');
        logs.push(`Robots.txt parsed successfully. Crawl-delay: ${robotsParser.getCrawlDelay()}s`);
      } else {
        robotsParser = new RobotsParser('', 'HukumBot');
      }
    } catch {
      robotsParser = new RobotsParser('', 'HukumBot');
    }

    // 2. URL Frontier
    const queue = [seedUrl];
    const visited = new Set<string>();

    while (queue.length > 0 && pagesCrawled < maxPages) {
      const currentUrl = queue.shift()!;
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);

      const parsed = new URL(currentUrl);
      if (!robotsParser.isAllowed(parsed.pathname)) {
        logs.push(`🛡️ Blocked by robots.txt: ${currentUrl}`);
        continue;
      }

      logs.push(`Fetching page: ${currentUrl}`);
      try {
        const response = await fetch(currentUrl, {
          headers: { 'User-Agent': 'HukumBot/1.0 (+http://localhost:3000/bot)' },
        });

        if (!response.ok) {
          logs.push(`Failed to fetch ${currentUrl} (Status: ${response.status})`);
          continue;
        }

        const html = await response.text();
        pagesCrawled++;

        // 3. Extract product if present
        const product = extractProductFromHtml(html, currentUrl);
        if (product) {
          itemsFound++;
          logs.push(`📦 Extracted Product: "${product.title}" (₹${product.price}) using ${product.extractionMethod}`);

          db.insertOne('crawled_items', {
            _id: `item_${crypto.randomBytes(6).toString('hex')}`,
            jobId,
            product,
            status: 'PENDING_REVIEW',
            crawledAt: new Date().toISOString(),
          });
        }

        // 4. Discover new internal links
        const internalLinks = discoverLinks(html, currentUrl);
        for (const link of internalLinks) {
          if (!visited.has(link) && !queue.includes(link) && queue.length < 50) {
            queue.push(link);
          }
        }

        // Respect politeness delay
        await new Promise((r) => setTimeout(r, 200));
      } catch (err: any) {
        logs.push(`Error crawling ${currentUrl}: ${err.message}`);
      }
    }

    db.updateOne('crawl_jobs', jobId, {
      status: 'DONE',
      pagesCrawled,
      itemsFound,
      finishedAt: new Date().toISOString(),
      logs,
    });
  } catch (fatal: any) {
    logs.push(`Fatal crawler error: ${fatal.message}`);
    db.updateOne('crawl_jobs', jobId, { status: 'FAILED', logs });
  }
}

/**
 * Get Crawl Job Status & Logs
 */
crawlerRouter.get('/crawler/jobs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const job = db.findById('crawl_jobs', id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json({ job });
});

/**
 * List Review Queue
 */
crawlerRouter.get('/crawler/review-queue', (_req: Request, res: Response) => {
  const items = db.find('crawled_items');
  res.json({ items });
});

/**
 * Approve & Publish Crawled Product
 */
crawlerRouter.post('/crawler/review-queue/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = db.findById('crawled_items', id);
  if (!item) return res.status(404).json({ error: 'Item not found in review queue' });

  const p = item.product;
  const slug = p.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

  // Insert into live catalog
  const publishedProduct = db.insertOne('products', {
    _id: `prod_crawled_${crypto.randomBytes(4).toString('hex')}`,
    slug,
    title: p.title,
    brand: p.brand || 'Generic',
    category: p.category || 'General',
    price: p.price,
    minPrice: p.price,
    originalPrice: p.originalPrice || Math.round(p.price * 1.25),
    description: p.description || p.title,
    media: p.images || [],
    sku: p.sku || `SKU-CRW-${Date.now().toString().slice(-4)}`,
    stock: 25,
    ratingAvg: 4.6,
    ratingCount: 12,
    soldCount: 0,
    inStock: true,
    isCrawled: true,
    sourceUrl: p.sourceUrl,
    createdAt: new Date().toISOString(),
  });

  db.updateOne('crawled_items', id, { status: 'APPROVED' });

  // Update Autocomplete Trie
  rebuildAutocompleteTrie();

  res.json({
    message: 'Crawled item approved and published to store catalog!',
    publishedProduct,
  });
});

/**
 * Reject Crawled Product
 */
crawlerRouter.post('/crawler/review-queue/:id/reject', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = db.findById('crawled_items', id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  db.updateOne('crawled_items', id, { status: 'REJECTED' });
  res.json({ message: 'Item rejected' });
});
