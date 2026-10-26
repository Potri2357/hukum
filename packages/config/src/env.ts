import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root if not already loaded
if (!process.env.APP_NAME) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
}

export const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_NAME: z.string().default('Hukum'),
  APP_ENV: z.enum(['local', 'demo', 'test']).default('local'),
  PORT_API: z.coerce.number().default(4000),
  PORT_WEB: z.coerce.number().default(3000),
  WEB_BASE_URL: z.string().url().default('http://localhost:3000'),
  API_BASE_URL: z.string().url().default('http://localhost:4000'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  SEED_ADMIN_EMAIL: z.string().email().default('admin@hukum.local'),
  SEED_ADMIN_PASSWORD: z.string().min(8),
  SEED_DATA_SIZE: z.enum(['small', 'medium', 'large']).default('small'),

  // MongoDB
  MONGO_SHARDING_MODE: z.enum(['lite', 'cluster']).default('lite'),
  MONGO_ROOT_USER: z.string().default('hukum_root'),
  MONGO_ROOT_PASSWORD: z.string().min(1),
  MONGO_DB_NAME: z.string().default('hukum'),
  MONGO_URI: z.string().min(1),
  MONGO_KEYFILE_PATH: z.string().default('./infra/mongo-sharding/keyfile'),
  MONGO_READ_PREFERENCE: z.string().default('secondaryPreferred'),
  MONGO_WRITE_CONCERN: z.string().default('majority'),

  // Redis
  REDIS_PASSWORD: z.string().min(1),
  REDIS_URL: z.string().min(1),
  REDIS_MAXMEMORY: z.string().default('256mb'),
  REDIS_EVICTION_POLICY: z.enum(['allkeys-lru', 'allkeys-lfu', 'volatile-lru', 'noeviction']).default('allkeys-lru'),
  REDIS_RING_NODES: z.string().default('localhost:6379,localhost:6380,localhost:6381'),

  // Auth & Security
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(16),
  COOKIE_DOMAIN: z.string().default('localhost'),
  GOOGLE_OAUTH_ENABLED: z.coerce.boolean().default(false),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),

  // OTP & Mail
  OTP_DELIVERY: z.enum(['console', 'email']).default('console'),
  OTP_LENGTH: z.coerce.number().default(6),
  OTP_TTL_SECONDS: z.coerce.number().default(300),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  MAIL_FROM: z.string().default('Hukum <no-reply@hukum.local>'),
  MAILPIT_UI_PORT: z.coerce.number().default(8025),
  VAPID_PUBLIC_KEY: z.string().min(1),
  VAPID_PRIVATE_KEY: z.string().min(1),
  VAPID_SUBJECT: z.string().default('mailto:admin@hukum.local'),

  // Payment Simulator
  PAYMENT_MODE: z.literal('simulation', {
    errorMap: () => ({ message: 'PAYMENT_MODE must strictly be "simulation". Real gateways are forbidden.' }),
  }),
  PAYMENT_SIM_WEBHOOK_SECRET: z.string().min(16),
  PAYMENT_SIM_LATENCY_MS: z.coerce.number().default(800),
  PAYMENT_SIM_DEFAULT_OUTCOME: z.enum(['auto', 'success', 'fail', 'pending']).default('auto'),
  PAYMENT_SIM_WEBHOOK_DELAY_MS: z.coerce.number().default(2000),
  PAYMENT_SIM_WEBHOOK_DUPLICATE_RATE: z.coerce.number().default(0.1),
  PAYMENT_SIM_WEBHOOK_REORDER: z.coerce.boolean().default(false),
  INVENTORY_RESERVATION_TTL_SECONDS: z.coerce.number().default(600),
  COD_MAX_AMOUNT: z.coerce.number().default(50000),

  // Object Storage
  STORAGE_DRIVER: z.enum(['minio', 'local']).default('local'),
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_USE_SSL: z.coerce.boolean().default(false),
  MINIO_ROOT_USER: z.string().default('hukum_minio'),
  MINIO_ROOT_PASSWORD: z.string().default('hukum_minio_pass'),
  MINIO_BUCKET: z.string().default('hukum-media'),

  // URL Shortener & Cache (Modules 1-2)
  SHORT_BASE_URL: z.string().default('http://localhost:8080'),
  HASH_SALT: z.string().min(8),
  SHORT_CODE_LENGTH: z.coerce.number().default(7),
  SHORT_HASH_ALGO: z.string().default('sha256'),
  SHORT_MAX_COLLISION_RETRIES: z.coerce.number().default(5),
  CACHE_ENABLED: z.coerce.boolean().default(true),
  LINK_CACHE_TTL_SECONDS: z.coerce.number().default(86400),
  LINK_CACHE_JITTER_PCT: z.coerce.number().default(10),
  LINK_NEG_CACHE_TTL_SECONDS: z.coerce.number().default(60),
  CLICK_FLUSH_INTERVAL_MS: z.coerce.number().default(5000),

  // Rate Limiter (Module 5)
  RL_ENABLED: z.coerce.boolean().default(true),
  RL_FAIL_MODE_DEFAULT: z.enum(['open', 'closed']).default('open'),
  RL_TRUST_PROXY: z.coerce.boolean().default(true),
  RL_PENALTY_ESCALATION: z.coerce.boolean().default(true),

  // Autocomplete (Module 6)
  AC_TOP_K: z.coerce.number().default(10),
  AC_REBUILD_CRON: z.string().default('0 3 * * *'),
  AC_INCREMENTAL_INTERVAL_SECONDS: z.coerce.number().default(60),
  AC_MIN_FREQUENCY: z.coerce.number().default(3),

  // Consistent Hashing & Ring (Module 4)
  RING_VNODES: z.coerce.number().default(150),
  RING_REPLICAS: z.coerce.number().default(2),
  RING_HASH: z.enum(['murmur3', 'xxhash', 'md5']).default('murmur3'),
  LAB_DEFAULT_NODES: z.coerce.number().default(5),

  // Crawler (Module 7)
  CRAWLER_USER_AGENT: z.string().default('HukumBot/1.0 (+http://localhost:3000/bot)'),
  CRAWLER_ALLOWLIST: z.string().default('mock-seller-site,localhost,127.0.0.1'),
  CRAWLER_RESPECT_ROBOTS: z.literal(true, {
    errorMap: () => ({ message: 'CRAWLER_RESPECT_ROBOTS must be true.' }),
  }),
  CRAWLER_PER_HOST_RPS: z.coerce.number().default(1),
  CRAWLER_MAX_CONCURRENCY: z.coerce.number().default(10),
  CRAWLER_MAX_DEPTH: z.coerce.number().default(3),
  CRAWLER_MAX_PAGES: z.coerce.number().default(500),
  CRAWLER_FETCH_TIMEOUT_MS: z.coerce.number().default(10000),
  CRAWLER_MAX_BYTES: z.coerce.number().default(2097152),
  CRAWLER_PLAYWRIGHT_ENABLED: z.coerce.boolean().default(false),
  MOCK_SELLER_SITE_URL: z.string().default('http://localhost:5050'),

  // Observability
  METRICS_ENABLED: z.coerce.boolean().default(true),
  PROMETHEUS_PORT: z.coerce.number().default(9090),
  GRAFANA_PORT: z.coerce.number().default(3001),
  GRAFANA_ADMIN_PASSWORD: z.string().min(8),

  // Web Browser-Visible
  NEXT_PUBLIC_APP_NAME: z.string().default('Hukum'),
  NEXT_PUBLIC_API_BASE_URL: z.string().default('http://localhost:4000'),
  NEXT_PUBLIC_SHORT_BASE_URL: z.string().default('http://localhost:8080'),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional().default(''),
  NEXT_PUBLIC_AC_DEBOUNCE_MS: z.coerce.number().default(100),
  NEXT_PUBLIC_PAYMENT_SIM_BADGE: z.coerce.boolean().default(true),
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errorDetails = result.error.errors
      .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');
    console.error('\n❌ Fatal: Invalid or missing environment configuration:\n' + errorDetails + '\n');
    throw new Error('Environment configuration validation failed');
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export function redactEnv(env: Record<string, any>): Record<string, any> {
  const secretKeywords = ['SECRET', 'PASSWORD', 'KEY', 'PASS', 'SALT', 'TOKEN'];
  const redacted: Record<string, any> = {};

  for (const [key, val] of Object.entries(env)) {
    if (secretKeywords.some((k) => key.toUpperCase().includes(k))) {
      redacted[key] = typeof val === 'string' && val.length > 6 ? `${val.slice(0, 3)}...${val.slice(-3)}` : '******';
    } else {
      redacted[key] = val;
    }
  }

  return redacted;
}
