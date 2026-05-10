export const config = {
  runtime: 'edge',
};

const buckets = new Map<string, number[]>();

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export default async function handler(request: Request) {
  const now = Date.now();
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous';
  const key = `ai:${ip}`;
  const limit = 30;
  const windowMs = 60 * 1000;
  const hits = (buckets.get(key) || []).filter(hit => now - hit < windowMs);

  if (hits.length >= limit) {
    return json({ allowed: false, remaining: 0, resetAt: hits[0] + windowMs }, 429);
  }

  hits.push(now);
  buckets.set(key, hits);

  return json({ allowed: true, remaining: limit - hits.length, resetAt: hits[0] + windowMs });
}
