import { Redis } from '@upstash/redis';

/**
 * Durable storage helper (Upstash Redis / Vercel KV).
 *
 * Har bir foydalanuvchi ma'lumoti parol xeshi (SHA-256, hex) bo'yicha
 * `hisobchi:user:<hash>` kalitida saqlanadi. Savob-app bilan bitta Redis
 * bazasi ishlatilsa ham prefiks tufayli kalitlar to'qnashmaydi.
 */

export const KEY_PREFIX = 'hisobchi:user:';

// SHA-256 hex xesh: qat'iy 64 ta [a-f0-9] belgi.
const ID_RE = /^[a-f0-9]{64}$/;

let cached;

// REST URL/token o'zgaruvchilarining barcha keng tarqalgan nomlari
// (Vercel KV, Upstash Marketplace, to'g'ridan-to'g'ri Upstash integratsiyasi).
const URL_ENV_NAMES = [
  'KV_REST_API_URL',
  'UPSTASH_REDIS_REST_URL',
  'REDIS_REST_API_URL',
  'STORAGE_REST_API_URL',
];
const TOKEN_ENV_NAMES = [
  'KV_REST_API_TOKEN',
  'UPSTASH_REDIS_REST_TOKEN',
  'REDIS_REST_API_TOKEN',
  'STORAGE_REST_API_TOKEN',
];

function firstEnv(names) {
  for (const n of names) {
    const v = process.env[n];
    if (v) return v;
  }
  return undefined;
}

/** Muhitdan Redis mijozini oladi. Sozlanmagan bo'lsa `null` qaytaradi. */
export function getRedis() {
  if (cached !== undefined) return cached;

  const url = firstEnv(URL_ENV_NAMES);
  const token = firstEnv(TOKEN_ENV_NAMES);

  cached = url && token ? new Redis({ url, token }) : null;
  return cached;
}

/** Diagnostika uchun: qaysi env o'zgaruvchilari mavjudligini (qiymatsiz) qaytaradi. */
export function redisEnvStatus() {
  const present = [...URL_ENV_NAMES, ...TOKEN_ENV_NAMES].filter((n) => !!process.env[n]);
  return {
    present,
    hasUrl: !!firstEnv(URL_ENV_NAMES),
    hasToken: !!firstEnv(TOKEN_ENV_NAMES),
  };
}

export function isValidId(id) {
  return typeof id === 'string' && ID_RE.test(id);
}

/**
 * Kelgan ma'lumot Hisobchi holati shaklida ekanini tekshiradi
 * (ombor buzilmasligi uchun). Asosiy bo'limlar massiv bo'lishi shart.
 */
export function isValidPayload(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  return (
    Array.isArray(data.debts) &&
    Array.isArray(data.monthly) &&
    Array.isArray(data.incomes)
  );
}

/** Body'ni JSON obyektga aylantiradi (Vercel string yoki obyekt berishi mumkin). */
export function parseBody(body) {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }
  return body;
}

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

export const STORAGE_NOT_CONFIGURED = {
  error:
    "Ma'lumotlar ombori sozlanmagan. Vercel'da Upstash Redis (Storage) ulang " +
    'yoki KV_REST_API_URL / KV_REST_API_TOKEN muhit o\'zgaruvchilarini kiriting.',
};
