import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../database/store';
import { trie, rebuildAutocompleteTrie } from '../suggest/suggest-controller';

export const sellerRouter = Router();

/**
 * Seller Dashboard Metrics
 */
sellerRouter.get('/seller/dashboard', (_req: Request, res: Response) => {
  const products = db.find('products');
  const orders = db.find('orders');

  const totalSales = orders.reduce((sum, o) => sum + (o.amount?.total || 0), 0);
  const totalUnits = orders.reduce(
    (sum, o) => sum + (o.items || []).reduce((isum: number, it: any) => isum + it.quantity, 0),
    0
  );

  res.json({
    metrics: {
      totalProducts: products.length,
      totalOrders: orders.length,
      grossSales: totalSales,
      unitsSold: totalUnits,
      simulatedPayoutsPending: Math.round(totalSales * 0.92), // 8% marketplace fee
      payoutsProcessed: Math.round(totalSales * 0.5),
    },
    topProducts: products.slice(0, 5),
    recentOrders: orders.slice(0, 8),
  });
});

/**
 * Create Single Product
 */
sellerRouter.post('/seller/products', (req: Request, res: Response) => {
  const { title, price, brand, category, description, image, sku, stock = 100 } = req.body;

  if (!title || !price || !category) {
    return res.status(400).json({ error: 'Title, price, and category are required' });
  }

  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

  const newProduct = db.insertOne('products', {
    _id: `prod_${crypto.randomBytes(6).toString('hex')}`,
    slug,
    title,
    brand: brand || 'Generic',
    category,
    price: parseFloat(price),
    minPrice: parseFloat(price),
    originalPrice: Math.round(parseFloat(price) * 1.25),
    description: description || title,
    media: [image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'],
    sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
    stock,
    ratingAvg: 4.5,
    ratingCount: 1,
    soldCount: 0,
    inStock: true,
    createdAt: new Date().toISOString(),
  });

  // Re-index into autocomplete
  rebuildAutocompleteTrie();

  res.status(201).json({
    message: 'Product created successfully',
    product: newProduct,
  });
});

/**
 * Bulk CSV Upload Simulation
 */
sellerRouter.post('/seller/products/bulk', (req: Request, res: Response) => {
  const { csvContent } = req.body;
  if (!csvContent || typeof csvContent !== 'string') {
    return res.status(400).json({ error: 'csvContent string required' });
  }

  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    return res.status(400).json({ error: 'CSV must contain a header and at least 1 data row' });
  }

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const createdProducts = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    if (cols.length < 3) continue;

    const row: any = {};
    header.forEach((key, idx) => {
      row[key] = cols[idx];
    });

    const price = parseFloat(row.price) || 999;
    const product = db.insertOne('products', {
      _id: `prod_${crypto.randomBytes(6).toString('hex')}`,
      slug: (row.title || 'Product')
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-'),
      title: row.title || 'Bulk Imported Item',
      brand: row.brand || 'Generic',
      category: row.category || 'General',
      price,
      minPrice: price,
      originalPrice: Math.round(price * 1.2),
      description: row.description || row.title,
      media: [row.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'],
      sku: row.sku || `SKU-BULK-${i}`,
      stock: 50,
      ratingAvg: 4.2,
      ratingCount: 1,
      soldCount: 0,
      inStock: true,
      createdAt: new Date().toISOString(),
    });

    createdProducts.push(product);
  }

  rebuildAutocompleteTrie();

  res.status(201).json({
    message: `Successfully processed ${createdProducts.length} products from CSV`,
    importedCount: createdProducts.length,
    products: createdProducts,
  });
});
