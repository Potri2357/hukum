import { Router, Request, Response } from 'express';
import { db } from '../database/store';
import { cache } from '../cache/cache-service';

export const catalogRouter = Router();

/**
 * List Categories
 */
catalogRouter.get('/categories', async (_req: Request, res: Response) => {
  const result = await cache.getOrSet(
    'cat:all',
    async () => db.find('categories'),
    3600 // 1 hr cache
  );
  res.json({ categories: result.value || [], cacheHit: result.hit });
});

/**
 * List Products with Faceted Search, Filters & Sorting
 */
catalogRouter.get('/products', async (req: Request, res: Response) => {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    minRating,
    sort,
    q,
    limit = '20',
    offset = '0',
  } = req.query;

  const parsedLimit = parseInt(String(limit), 10) || 20;
  const parsedOffset = parseInt(String(offset), 10) || 0;

  let allProducts = db.find('products');

  // Text search filter
  if (q && typeof q === 'string') {
    const queryTerm = q.toLowerCase().trim();
    allProducts = allProducts.filter(
      (p) =>
        p.title?.toLowerCase().includes(queryTerm) ||
        p.brand?.toLowerCase().includes(queryTerm) ||
        p.category?.toLowerCase().includes(queryTerm) ||
        p.description?.toLowerCase().includes(queryTerm)
    );
  }

  // Category filter
  if (category && typeof category === 'string' && category !== 'all') {
    allProducts = allProducts.filter(
      (p) => p.category?.toLowerCase() === category.toLowerCase()
    );
  }

  // Brand filter
  if (brand && typeof brand === 'string') {
    const brands = brand.split(',').map((b) => b.trim().toLowerCase());
    allProducts = allProducts.filter((p) => brands.includes(p.brand?.toLowerCase()));
  }

  // Price range
  if (minPrice) {
    allProducts = allProducts.filter((p) => (p.minPrice || p.price) >= parseFloat(String(minPrice)));
  }
  if (maxPrice) {
    allProducts = allProducts.filter((p) => (p.minPrice || p.price) <= parseFloat(String(maxPrice)));
  }

  // Rating
  if (minRating) {
    allProducts = allProducts.filter((p) => (p.ratingAvg || 0) >= parseFloat(String(minRating)));
  }

  // Sorting
  switch (sort) {
    case 'price_asc':
      allProducts.sort((a, b) => (a.minPrice || a.price) - (b.minPrice || b.price));
      break;
    case 'price_desc':
      allProducts.sort((a, b) => (b.minPrice || b.price) - (a.minPrice || a.price));
      break;
    case 'rating':
      allProducts.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
      break;
    case 'newest':
      allProducts.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      break;
    case 'popularity':
    default:
      allProducts.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
      break;
  }

  const paginated = allProducts.slice(parsedOffset, parsedOffset + parsedLimit);

  res.json({
    total: allProducts.length,
    offset: parsedOffset,
    limit: parsedLimit,
    products: paginated,
  });
});

/**
 * Product Detail by ID or Slug
 */
catalogRouter.get('/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await cache.getOrSet(
    `prod:${id}`,
    async () => {
      let product = db.findById('products', id);
      if (!product) {
        product = db.findOne('products', { slug: id });
      }
      if (!product) return null;

      // Attach seller offers ("Buy from other sellers")
      const offers = db.find('offers', { productId: product._id });
      // Attach reviews
      const reviews = db.find('reviews', { productId: product._id });

      return {
        ...product,
        sellerOffers: offers.length > 0 ? offers : [
          {
            sellerId: 'sel_hukum_retail',
            sellerName: 'Hukum Retail (Assured)',
            price: product.minPrice || product.price,
            rating: 4.8,
            deliveryDays: 2,
            inStock: true,
          },
          {
            sellerId: 'sel_tech_direct',
            sellerName: 'TechDirect SuperStore',
            price: (product.minPrice || product.price) + 200,
            rating: 4.5,
            deliveryDays: 3,
            inStock: true,
          },
        ],
        reviews,
      };
    },
    300 // 5 min cache
  );

  if (!result.value) {
    return res.status(404).json({ error: 'Product not found', cacheHit: result.hit });
  }

  res.json({ product: result.value, cacheHit: result.hit, latencyMs: result.latencyMs });
});

/**
 * Compare Products
 */
catalogRouter.get('/compare', (req: Request, res: Response) => {
  const { ids } = req.query;
  if (!ids || typeof ids !== 'string') {
    return res.status(400).json({ error: 'ids query param required (comma-separated)' });
  }

  const idList = ids.split(',').map((s) => s.trim()).slice(0, 4); // Max 4 products
  const products = idList
    .map((id) => db.findById('products', id))
    .filter(Boolean);

  res.json({ products });
});

/**
 * Deals of the Day
 */
catalogRouter.get('/deals', (_req: Request, res: Response) => {
  const deals = db.find('products', { isDeal: true });
  res.json({
    deals: deals.length > 0 ? deals : db.find('products').slice(0, 6),
    endsAt: new Date(Date.now() + 14 * 3600 * 1000).toISOString(), // 14 hours countdown
  });
});

/**
 * Pincode Serviceability Check
 */
catalogRouter.post('/pincode/check', (req: Request, res: Response) => {
  const { pincode } = req.body;
  if (!pincode || !/^\d{6}$/.test(String(pincode).trim())) {
    return res.status(400).json({ error: 'Invalid 6-digit Indian pincode' });
  }

  const pin = String(pincode).trim();
  // Realistic mock delivery estimation based on pincode zone
  const firstDigit = parseInt(pin[0], 10);
  const deliveryDays = firstDigit <= 5 ? 2 : 3;

  res.json({
    pincode: pin,
    serviceable: true,
    estimatedDays: deliveryDays,
    deliveryDate: new Date(Date.now() + deliveryDays * 86400000).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
    shippingFee: 0,
    codAvailable: true,
  });
});
