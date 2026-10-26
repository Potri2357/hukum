import * as cheerio from 'cheerio';
import crypto from 'crypto';

export interface ExtractedProduct {
  title: string;
  price: number;
  originalPrice?: number;
  currency: string;
  description: string;
  brand: string;
  category: string;
  images: string[];
  sku?: string;
  sourceUrl: string;
  extractionMethod: 'json-ld' | 'opengraph' | 'html-fallback';
  contentHash: string;
}

export interface CrawlJobConfig {
  jobId: string;
  seedUrls: string[];
  ownerId: string;
  allowedDomains: string[];
  maxDepth?: number;
  maxPages?: number;
  perHostRps?: number;
  respectRobots?: boolean;
}

export interface CrawledItemRecord {
  id: string;
  jobId: string;
  product: ExtractedProduct;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  crawledAt: string;
}

export class RobotsParser {
  private disallowPatterns: string[] = [];
  private allowPatterns: string[] = [];
  private crawlDelaySeconds: number = 0;

  constructor(robotsTxtContent: string, userAgent: string = 'HukumBot') {
    this.parse(robotsTxtContent, userAgent);
  }

  private parse(content: string, userAgent: string): void {
    const lines = content.split('\n');
    let appliesToBot = false;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const [directive, ...rest] = line.split(':');
      const key = directive.trim().toLowerCase();
      const val = rest.join(':').trim();

      if (key === 'user-agent') {
        appliesToBot = val === '*' || val.toLowerCase().includes(userAgent.toLowerCase());
      } else if (appliesToBot) {
        if (key === 'disallow') {
          if (val) this.disallowPatterns.push(val);
        } else if (key === 'allow') {
          if (val) this.allowPatterns.push(val);
        } else if (key === 'crawl-delay') {
          this.crawlDelaySeconds = parseFloat(val) || 0;
        }
      }
    }
  }

  public isAllowed(pathname: string): boolean {
    for (const allowed of this.allowPatterns) {
      if (pathname.startsWith(allowed)) return true;
    }
    for (const disallowed of this.disallowPatterns) {
      if (pathname.startsWith(disallowed)) return false;
    }
    return true;
  }

  public getCrawlDelay(): number {
    return this.crawlDelaySeconds;
  }
}

/**
 * SSRF Guard: Verifies that the URL does not point to internal metadata or prohibited private IPs
 * unless explicitly allowed in the config (e.g. mock-seller-site).
 */
export function isSafeUrl(rawUrl: string, allowedHosts: string[] = []): { safe: boolean; reason?: string } {
  try {
    const parsed = new URL(rawUrl);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: 'Invalid protocol: only http and https are allowed' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check allowlist
    const isAllowlisted = allowedHosts.some(
      (allowed) => hostname === allowed.toLowerCase() || hostname.endsWith(`.${allowed.toLowerCase()}`)
    );

    if (isAllowlisted) {
      return { safe: true };
    }

    // Block AWS/GCP/Azure internal metadata
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
      return { safe: false, reason: 'Cloud metadata IP blocked' };
    }

    // Block private IP ranges
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname === '0.0.0.0'
    ) {
      return { safe: false, reason: 'Private/Loopback IP blocked by SSRF guard' };
    }

    return { safe: true };
  } catch (err: any) {
    return { safe: false, reason: 'Malformed URL: ' + err.message };
  }
}

/**
 * Computes a 64-bit content SimHash for near-duplicate page detection.
 */
export function computeSimHash(text: string): string {
  const words = text.toLowerCase().match(/\w+/g) || [];
  const v = new Array(64).fill(0);

  for (const word of words) {
    const hash = crypto.createHash('md5').update(word).digest();
    for (let i = 0; i < 64; i++) {
      const byteIndex = Math.floor(i / 8);
      const bitIndex = i % 8;
      const bit = (hash[byteIndex] >> bitIndex) & 1;
      v[i] += bit === 1 ? 1 : -1;
    }
  }

  let simhash = '';
  for (let i = 0; i < 64; i++) {
    simhash += v[i] > 0 ? '1' : '0';
  }

  // Convert binary string to 16-character hex
  let hex = '';
  for (let i = 0; i < 64; i += 4) {
    const nibble = parseInt(simhash.slice(i, i + 4), 2);
    hex += nibble.toString(16);
  }

  return hex;
}

/**
 * Extracts product metadata from HTML using JSON-LD, OpenGraph, or HTML fallback.
 */
export function extractProductFromHtml(html: string, pageUrl: string): ExtractedProduct | null {
  const $ = cheerio.load(html);

  // 1. Try JSON-LD Product Schema
  let jsonLdProduct: any = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const content = $(el).html();
      if (!content) return;
      const parsed = JSON.parse(content);
      const candidate = Array.isArray(parsed)
        ? parsed.find((item) => item['@type'] === 'Product')
        : parsed['@type'] === 'Product'
        ? parsed
        : null;

      if (candidate) {
        jsonLdProduct = candidate;
        return false; // Break
      }
    } catch (e) {
      // Ignore invalid JSON-LD block
    }
  });

  if (jsonLdProduct) {
    const offers = jsonLdProduct.offers || {};
    const priceVal = parseFloat(offers.price || offers.lowPrice || '0') || 0;
    const images: string[] = [];

    if (jsonLdProduct.image) {
      if (Array.isArray(jsonLdProduct.image)) {
        images.push(...jsonLdProduct.image);
      } else {
        images.push(String(jsonLdProduct.image));
      }
    }

    return {
      title: jsonLdProduct.name || $('title').text().trim(),
      price: priceVal,
      originalPrice: priceVal > 0 ? Math.round(priceVal * 1.25) : 0,
      currency: offers.priceCurrency || 'INR',
      description: jsonLdProduct.description || '',
      brand: typeof jsonLdProduct.brand === 'object' ? jsonLdProduct.brand.name : jsonLdProduct.brand || 'Generic',
      category: jsonLdProduct.category || 'General',
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'],
      sku: jsonLdProduct.sku || jsonLdProduct.productID,
      sourceUrl: pageUrl,
      extractionMethod: 'json-ld',
      contentHash: computeSimHash(html),
    };
  }

  // 2. Try OpenGraph metadata
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');
  const ogPrice = $('meta[property="og:price:amount"]').attr('content');
  const ogDesc = $('meta[property="og:description"]').attr('content');

  if (ogTitle && (ogPrice || ogImage)) {
    const price = parseFloat(ogPrice || '0') || 0;
    return {
      title: ogTitle,
      price,
      originalPrice: price > 0 ? Math.round(price * 1.2) : 0,
      currency: $('meta[property="og:price:currency"]').attr('content') || 'INR',
      description: ogDesc || '',
      brand: $('meta[property="product:brand"]').attr('content') || 'Generic',
      category: 'General',
      images: ogImage ? [ogImage] : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'],
      sourceUrl: pageUrl,
      extractionMethod: 'opengraph',
      contentHash: computeSimHash(html),
    };
  }

  // 3. Fallback Semantic HTML Selectors
  const h1 = $('h1').first().text().trim();
  const rawPriceText = $('.price, [data-price], .product-price').first().text().trim();
  const priceMatches = rawPriceText.match(/[\d,.]+/);
  const parsedPrice = priceMatches ? parseFloat(priceMatches[0].replace(/,/g, '')) : 0;

  if (h1 && (parsedPrice > 0 || $('img.product-img, .product-image img').length > 0)) {
    const imgSrc = $('img.product-img, .product-image img, img').first().attr('src') || '';
    return {
      title: h1,
      price: parsedPrice || 999,
      originalPrice: Math.round((parsedPrice || 999) * 1.2),
      currency: 'INR',
      description: $('p.description, .product-description, p').first().text().trim() || h1,
      brand: 'Generic',
      category: 'General',
      images: imgSrc ? [imgSrc] : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'],
      sourceUrl: pageUrl,
      extractionMethod: 'html-fallback',
      contentHash: computeSimHash(html),
    };
  }

  return null;
}

/**
 * Discovers same-domain internal links from an HTML document.
 */
export function discoverLinks(html: string, currentUrl: string): string[] {
  const $ = cheerio.load(html);
  const parsedCurrent = new URL(currentUrl);
  const links = new Set<string>();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    try {
      const resolved = new URL(href, currentUrl);
      if (resolved.origin === parsedCurrent.origin) {
        resolved.hash = '';
        resolved.search = '';
        links.add(resolved.toString());
      }
    } catch {
      // Ignore malformed href
    }
  });

  return Array.from(links);
}
