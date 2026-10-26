import http from 'http';

const PORT = process.env.MOCK_SELLER_PORT || 5050;

const products = [
  {
    id: 'prod-1',
    slug: 'aurora-x-pro-5g',
    title: 'Aurora X Pro 5G (128GB, Phantom Black)',
    price: 18999,
    originalPrice: 24999,
    brand: 'Aurora',
    category: 'Smartphones',
    sku: 'AUR-XPRO-128',
    description: 'Flagship 5G performance with 120Hz AMOLED display, 64MP OIS quad camera, and 67W Turbo charging.',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80',
  },
  {
    id: 'prod-2',
    slug: 'pulse-anc-wireless-headphones',
    title: 'Pulse Elite ANC Wireless Headphones',
    price: 4999,
    originalPrice: 7999,
    brand: 'PulseAudio',
    category: 'Audio',
    sku: 'PLS-ANC-ELT',
    description: 'Active Noise Cancellation with 40mm titanium drivers, 45-hour battery life, and spatial audio support.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  },
  {
    id: 'prod-3',
    slug: 'zenith-titanium-smartwatch',
    title: 'Zenith Watch S3 Titanium',
    price: 3499,
    originalPrice: 5999,
    brand: 'Zenith',
    category: 'Wearables',
    sku: 'ZEN-W3-TIT',
    description: 'Precision sapphire glass and titanium frame with SpO2, ECG monitoring, and 14-day battery life.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
  },
  {
    id: 'prod-4',
    slug: 'hyperdrive-mechanical-keyboard',
    title: 'HyperDrive RGB Mechanical Gaming Keyboard',
    price: 2999,
    originalPrice: 4499,
    brand: 'HyperDrive',
    category: 'Accessories',
    sku: 'HYP-KB-RGB',
    description: 'Hot-swappable linear yellow switches with sound-dampening foam and per-key RGB backlighting.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
  },
  {
    id: 'prod-5',
    slug: 'luma-ultra-4k-webcam',
    title: 'Luma Vision 4K HDR Pro Webcam',
    price: 6499,
    originalPrice: 9999,
    brand: 'Luma',
    category: 'Accessories',
    sku: 'LUM-CAM-4K',
    description: 'Crystal clear 4K 60fps video with AI auto-framing, dual noise-reducing microphones, and privacy shutter.',
    image: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&q=80',
  },
];

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // 1. Robots.txt
  if (pathname === '/robots.txt') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`User-agent: *
Disallow: /admin/
Disallow: /private/
Crawl-delay: 1

Sitemap: http://localhost:${PORT}/sitemap.xml
`);
    return;
  }

  // 2. Sitemap.xml
  if (pathname === '/sitemap.xml') {
    res.writeHead(200, { 'Content-Type': 'application/xml' });
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>http://localhost:${PORT}/</loc></url>
  ${products
    .map(
      (p) => `<url>
    <loc>http://localhost:${PORT}/products/${p.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`
    )
    .join('\n  ')}
</urlset>`;
    res.end(sitemap);
    return;
  }

  // 3. Blocked Admin Path (Testing robots.txt adherence)
  if (pathname.startsWith('/admin')) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html>
<head><title>Admin Secret Portal - Disallowed</title></head>
<body>
  <h1>Disallowed Content</h1>
  <p>If you see this in the crawler, robots.txt was violated!</p>
</body>
</html>`);
    return;
  }

  // 4. Product Detail Page
  if (pathname.startsWith('/products/')) {
    const slug = pathname.replace('/products/', '');
    const product = products.find((p) => p.slug === slug);

    if (!product) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>Product Not Found</h1>');
      return;
    }

    const jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.title,
      image: [product.image],
      description: product.description,
      sku: product.sku,
      brand: {
        '@type': 'Brand',
        name: product.brand,
      },
      category: product.category,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: product.price,
        availability: 'https://schema.org/InStock',
        url: `http://localhost:${PORT}/products/${product.slug}`,
      },
    };

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${product.title} - Mock Seller Store</title>
  <meta name="description" content="${product.description}">
  <!-- OpenGraph -->
  <meta property="og:title" content="${product.title}">
  <meta property="og:description" content="${product.description}">
  <meta property="og:image" content="${product.image}">
  <meta property="og:price:amount" content="${product.price}">
  <meta property="og:price:currency" content="INR">
  <meta property="product:brand" content="${product.brand}">
  <!-- JSON-LD -->
  <script type="application/ld+json">
    ${JSON.stringify(jsonLd, null, 2)}
  </script>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #111; }
    .product-box { display: flex; gap: 40px; }
    .product-img { width: 360px; height: 360px; object-fit: cover; border-radius: 12px; }
    .price { font-size: 32px; font-weight: bold; color: #16a34a; }
    .original-price { font-size: 20px; text-decoration: line-through; color: #888; margin-left: 12px; }
    .badge { background: #fee2e2; color: #dc2626; padding: 4px 10px; border-radius: 99px; font-weight: bold; }
    .nav { margin-bottom: 24px; }
  </style>
</head>
<body>
  <div class="nav">
    <a href="/">← Back to Store Home</a>
  </div>
  <div class="product-box">
    <div>
      <img src="${product.image}" alt="${product.title}" class="product-img">
    </div>
    <div>
      <span class="badge">${product.brand}</span>
      <h1>${product.title}</h1>
      <div>
        <span class="price">₹${product.price.toLocaleString('en-IN')}</span>
        <span class="original-price">₹${product.originalPrice.toLocaleString('en-IN')}</span>
      </div>
      <p class="description">${product.description}</p>
      <p><strong>SKU:</strong> ${product.sku}</p>
      <p><strong>Category:</strong> ${product.category}</p>
      <button style="background: #111; color: #fff; padding: 12px 28px; border-radius: 8px; border: none; font-size: 16px; cursor: pointer;">Add to Cart</button>
    </div>
  </div>
</body>
</html>`);
    return;
  }

  // 5. Storefront Home
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Mock Seller Store — Official Catalog</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 1000px; margin: 40px auto; padding: 0 20px; color: #111; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; margin-top: 30px; }
    .card { border: 1px solid #eee; border-radius: 12px; padding: 16px; text-decoration: none; color: inherit; transition: transform 0.2s; }
    .card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.06); }
    .card img { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; }
    .price { font-weight: bold; color: #16a34a; font-size: 20px; }
  </style>
</head>
<body>
  <h1>Mock Seller Storefront</h1>
  <p>Safe crawling target for Hukum automated seller imports and content discovery.</p>
  <div class="grid">
    ${products
      .map(
        (p) => `<a href="/products/${p.slug}" class="card">
      <img src="${p.image}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p class="price">₹${p.price.toLocaleString('en-IN')}</p>
      <p style="color: #666; font-size: 14px;">${p.brand} · ${p.category}</p>
    </a>`
      )
      .join('\n    ')}
  </div>
</body>
</html>`);
});

server.listen(PORT, () => {
  console.log(`🌐 Mock Seller Site running at http://localhost:${PORT}`);
  console.log(`   - Robots.txt: http://localhost:${PORT}/robots.txt`);
  console.log(`   - Sitemap:    http://localhost:${PORT}/sitemap.xml`);
});
