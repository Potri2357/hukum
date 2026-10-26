import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

import { createRateLimiter } from './ratelimit/ratelimit-middleware';
import { authRouter } from './auth/auth-controller';
import { catalogRouter } from './catalog/catalog-controller';
import { suggestRouter } from './suggest/suggest-controller';
import { linksRouter } from './links/links-controller';
import { cartRouter } from './cart/cart-controller';
import { paymentSimulatorRouter } from './payments-sim/payment-simulator-controller';
import { ordersRouter } from './orders/orders-controller';
import { sellerRouter } from './seller/seller-controller';
import { crawlerRouter } from './crawler/crawler-controller';
import { labRouter } from './lab/lab-controller';
import { cache } from './cache/cache-service';
import { db } from './database/store';

export const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request-ID & Metrics Latency Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const reqId = req.headers['x-request-id'] || `req_${crypto.randomBytes(6).toString('hex')}`;
  req.headers['x-request-id'] = reqId;
  res.setHeader('X-Request-Id', reqId);

  const start = performance.now();
  res.on('finish', () => {
    const duration = performance.now() - start;
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration.toFixed(1)}ms)`);
    }
  });

  next();
});

// Global Rate Limiting
app.use(createRateLimiter('default'));

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1', catalogRouter);
app.use('/api/v1', suggestRouter);
app.use('/api/v1', linksRouter);
app.use('/api/v1', cartRouter);
app.use('/api/v1', paymentSimulatorRouter);
app.use('/api/v1', ordersRouter);
app.use('/api/v1', sellerRouter);
app.use('/api/v1', crawlerRouter);
app.use('/api/v1', labRouter);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    app: 'Hukum API',
    version: '1.1',
    timestamp: new Date().toISOString(),
  });
});

// Root Shortener Redirect for spk.link/:code
app.get('/:code', async (req: Request, res: Response) => {
  const { code } = req.params;
  if (!code || code === 'favicon.ico') {
    return res.status(404).end();
  }

  const result = await cache.getOrSet(
    `link:${code}`,
    async () => db.findById('links', code),
    86400
  );

  if (!result.value) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Link Expired - Hukum</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h2>Link Not Found or Expired</h2>
        <p>The short link <code>${code}</code> could not be located.</p>
        <a href="http://localhost:3000">Return to Hukum Store</a>
      </body>
      </html>
    `);
  }

  cache.recordClick(code);
  res.redirect(302, result.value.longUrl);
});

// Standard Error Envelope Middleware
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled API Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred',
    requestId: req.headers['x-request-id'],
  });
});
