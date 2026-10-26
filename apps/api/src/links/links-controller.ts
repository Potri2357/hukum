import { Router, Request, Response } from 'express';
import { generateShortCode, normalizeUrl } from '@hukum/core-hash';
import { db } from '../database/store';
import { cache } from '../cache/cache-service';
import { createRateLimiter } from '../ratelimit/ratelimit-middleware';

export const linksRouter = Router();

const HASH_SALT = process.env.HASH_SALT || 'hukum_salt_default_12345';
const SHORT_BASE_URL = process.env.SHORT_BASE_URL || 'http://localhost:8080';

/**
 * Create Short Link
 */
linksRouter.post(
  '/links',
  createRateLimiter('shortener_create'),
  async (req: Request, res: Response) => {
    const { url, type = 'product', customAlias, expiresAt } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid URL is required' });
    }

    const normalized = normalizeUrl(url);

    // Idempotency: check if identical link already exists
    const existing = db.findOne('links', { longUrl: normalized });
    if (existing) {
      return res.json({
        code: existing._id,
        shortUrl: `${SHORT_BASE_URL}/${existing._id}`,
        longUrl: existing.longUrl,
        type: existing.type,
        isExisting: true,
      });
    }

    let code: string;
    if (customAlias) {
      const aliasClean = customAlias.trim();
      const conflict = db.findById('links', aliasClean);
      if (conflict) {
        return res.status(409).json({ error: 'Custom alias already in use' });
      }
      code = aliasClean;
    } else {
      // Hashing strategy with collision retry loop
      let attempt = 0;
      let generated = generateShortCode(normalized, { salt: HASH_SALT, codeLength: 7 }, attempt);

      while (db.findById('links', generated.code) && attempt < 5) {
        attempt++;
        generated = generateShortCode(normalized, { salt: HASH_SALT, codeLength: 7 }, attempt);
      }

      code = generated.code;
    }

    const newLink = db.insertOne('links', {
      _id: code,
      longUrl: normalized,
      type,
      clicks: 0,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt || null,
    });

    // Write-through to cache
    cache.set(`link:${code}`, newLink, 86400);

    res.status(201).json({
      code: newLink._id,
      shortUrl: `${SHORT_BASE_URL}/${newLink._id}`,
      longUrl: newLink.longUrl,
      type: newLink.type,
      createdAt: newLink.createdAt,
    });
  }
);

/**
 * Redirect Endpoint (Cache-Aside + Stampede Lock + Negative Cache)
 */
linksRouter.get('/links/redirect/:code', async (req: Request, res: Response) => {
  const { code } = req.params;

  const result = await cache.getOrSet(
    `link:${code}`,
    async () => {
      const link = db.findById('links', code);
      return link ? link : null;
    },
    86400 // 24 hours
  );

  if (!result.value) {
    return res.status(404).json({
      error: 'Link not found or expired',
      code,
      cacheHit: result.hit,
      latencyMs: result.latencyMs,
    });
  }

  // Record click count in batched Redis counter
  cache.recordClick(code);

  // Return redirect metadata or 302
  if (req.headers.accept?.includes('application/json')) {
    return res.json({
      code,
      longUrl: result.value.longUrl,
      cacheHit: result.hit,
      latencyMs: result.latencyMs,
    });
  }

  res.redirect(302, result.value.longUrl);
});

/**
 * Link Stats
 */
linksRouter.get('/links/:code/stats', (req: Request, res: Response) => {
  const { code } = req.params;
  const link = db.findById('links', code);

  if (!link) {
    return res.status(404).json({ error: 'Link not found' });
  }

  res.json({
    code: link._id,
    longUrl: link.longUrl,
    clicks: link.clicks || 0,
    type: link.type,
    createdAt: link.createdAt,
  });
});
