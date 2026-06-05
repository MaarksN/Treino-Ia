import { json } from '../_lib/http';

export const config = {
  runtime: 'edge',
};

const buckets = new Map<string, number[]>();

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return json({ ok: true }, 200, request);
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405, request);

  const now = Date.now();
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous';
  const key = `ai:${ip}`;
  const limit = 30;
  const windowMs = 60 * 1000;
  const hits = (buckets.get(key) || []).filter((hit) => now - hit < windowMs);

  if (hits.length >= limit) {
    return json({ allowed: false, remaining: 0, resetAt: hits[0] + windowMs }, 429, request);
  }

  hits.push(now);
  buckets.set(key, hits);

  return json(
    { allowed: true, remaining: limit - hits.length, resetAt: hits[0] + windowMs },
    200,
    request,
  );
}
