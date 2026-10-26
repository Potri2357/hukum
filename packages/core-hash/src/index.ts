import crypto from 'crypto';

const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Encodes a BigInt or 64-bit integer into Base62 string.
 */
export function encodeBase62(num: bigint, padToLength: number = 7): string {
  if (num === 0n) {
    return '0'.repeat(padToLength);
  }

  let result = '';
  let n = num;
  const base = 62n;

  while (n > 0n) {
    const remainder = Number(n % base);
    result = BASE62_CHARS[remainder] + result;
    n = n / base;
  }

  while (result.length < padToLength) {
    result = '0' + result;
  }

  return result.slice(-padToLength);
}

/**
 * Decodes a Base62 string back to BigInt.
 */
export function decodeBase62(str: string): bigint {
  let result = 0n;
  const base = 62n;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const index = BASE62_CHARS.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid Base62 character: ${char}`);
    }
    result = result * base + BigInt(index);
  }

  return result;
}

/**
 * Normalizes a URL:
 * - lowercase scheme and host
 * - strip fragments
 * - remove tracking params (utm_*, gclid, fbclid, etc.)
 * - sort remaining query params alphabetically
 * - strip trailing slash unless root path
 */
export function normalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    parsed.protocol = parsed.protocol.toLowerCase();
    parsed.hostname = parsed.hostname.toLowerCase();
    parsed.hash = '';

    const trackingParams = new Set([
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'gclid',
      'fbclid',
      'mc_cid',
      'mc_eid',
    ]);

    const params = Array.from(parsed.searchParams.entries())
      .filter(([key]) => !trackingParams.has(key.toLowerCase()))
      .sort(([a], [b]) => a.localeCompare(b));

    parsed.search = '';
    for (const [key, val] of params) {
      parsed.searchParams.append(key, val);
    }

    let normalized = parsed.toString();
    if (normalized.endsWith('/') && parsed.pathname !== '/') {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch (err) {
    return rawUrl.trim();
  }
}

export interface ShortenerOptions {
  salt: string;
  codeLength?: number;
  maxAttempts?: number;
}

export interface HashResult {
  code: string;
  strategy: 'hash' | 'counter' | 'random';
  attempt: number;
  hashHex: string;
}

/**
 * Generates a short code from a URL using SHA-256 + salt + Base62.
 */
export function generateShortCode(
  normalizedUrl: string,
  options: ShortenerOptions,
  attemptNumber: number = 0
): HashResult {
  const codeLength = options.codeLength || 7;
  const salt = attemptNumber === 0 ? options.salt : `${options.salt}_retry_${attemptNumber}`;

  const hash = crypto.createHash('sha256').update(normalizedUrl + salt).digest();
  const hashHex = hash.toString('hex');

  // Take first 8 bytes (64 bits) as unsigned big-endian integer
  const first64Bits = hash.readBigUInt64BE(0);
  const code = encodeBase62(first64Bits, codeLength);

  return {
    code,
    strategy: 'hash',
    attempt: attemptNumber,
    hashHex,
  };
}

/**
 * Counter-based short code strategy (alternative for Lab comparison).
 */
export function generateCounterShortCode(counter: bigint, codeLength: number = 7): string {
  return encodeBase62(counter, codeLength);
}

/**
 * Random Base62 strategy (alternative for Lab comparison).
 */
export function generateRandomShortCode(codeLength: number = 7): string {
  const bytes = crypto.randomBytes(codeLength);
  let res = '';
  for (let i = 0; i < codeLength; i++) {
    res += BASE62_CHARS[bytes[i] % 62];
  }
  return res;
}

/**
 * Collision simulation runner for benchmark experiments in System Lab.
 */
export function simulateCollisions(sampleSize: number, length: number = 7) {
  const seen = new Set<string>();
  let collisions = 0;

  for (let i = 0; i < sampleSize; i++) {
    const fakeUrl = `https://hukum.in/product/${i}?variant=${(i * 17) % 100}`;
    const code = generateShortCode(fakeUrl, { salt: 'sim_salt', codeLength: length }).code;
    if (seen.has(code)) {
      collisions++;
    } else {
      seen.add(code);
    }
  }

  return {
    sampleSize,
    uniqueCodes: seen.size,
    collisions,
    collisionRatePct: ((collisions / sampleSize) * 100).toFixed(4),
  };
}
