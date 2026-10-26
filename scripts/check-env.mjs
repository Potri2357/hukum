import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const envFile = path.resolve(rootDir, '.env');

if (!fs.existsSync(envFile)) {
  console.error('❌ .env file not found at ' + envFile);
  console.error('👉 Run `pnpm setup:env` first to generate it.');
  process.exit(1);
}

// Parse .env directly without third party dependencies
const envContent = fs.readFileSync(envFile, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx > 0) {
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
}

console.log('🔍 Checking environment configuration against schema...');

const requiredFields = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'COOKIE_SECRET',
  'PAYMENT_SIM_WEBHOOK_SECRET',
  'HASH_SALT',
  'SEED_ADMIN_PASSWORD',
  'MONGO_URI',
  'REDIS_URL'
];

let hasErrors = false;

for (const field of requiredFields) {
  const val = env[field];
  if (!val || val.includes('CHANGE_ME_')) {
    console.error(`❌ Field ${field} is missing or still contains a CHANGE_ME_* placeholder!`);
    hasErrors = true;
  }
}

if (env.PAYMENT_MODE !== 'simulation') {
  console.error('❌ PAYMENT_MODE must be "simulation"! Real payment gateways are strictly forbidden.');
  hasErrors = true;
}

if (env.CRAWLER_RESPECT_ROBOTS !== 'true') {
  console.error('❌ CRAWLER_RESPECT_ROBOTS must be "true"!');
  hasErrors = true;
}

if (hasErrors) {
  console.error('\n🚫 Environment validation failed. Please inspect your .env file.\n');
  process.exit(1);
} else {
  console.log('✅ Environment validation passed! All variables are valid and secrets generated.');
}
