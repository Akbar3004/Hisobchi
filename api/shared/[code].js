import { getRedis, setCors, STORAGE_NOT_CONFIGURED } from '../_redis.js';

/**
 * InvestHub investorining umumiy (public, faqat-o'qish) snapshot'ini o'qish.
 *   GET /api/shared/<code>  -> snapshot yoki 404
 *
 * Snapshot InvestHub tomonidan `share:investor:<code>` kalitiga chop etiladi.
 * Ikkala ilova bitta Upstash bazasidan foydalangani uchun, Hisobchi shu kalitni
 * to'g'ridan-to'g'ri o'qiy oladi. Faqat kodni bilgan odam o'qiy oladi.
 */

const SHARE_PREFIX = 'share:investor:';
const CODE_RE = /^[a-f0-9]{16,64}$/;

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { code } = req.query;
  if (typeof code !== 'string' || !CODE_RE.test(code)) {
    res.status(400).json({ error: 'Invalid code' });
    return;
  }

  const redis = getRedis();
  if (!redis) {
    res.status(503).json(STORAGE_NOT_CONFIGURED);
    return;
  }

  try {
    const data = await redis.get(SHARE_PREFIX + code);
    if (data === null || data === undefined) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.status(200).json(data);
  } catch (error) {
    console.error('Shared GET error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error?.message });
  }
}
