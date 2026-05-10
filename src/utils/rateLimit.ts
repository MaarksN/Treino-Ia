const RATE_LIMIT_KEY = '@TreinoApp:rate-limit';

export function checkRateLimit(bucket: string, limit: number, windowMs: number) {
  if (typeof window === 'undefined') return { allowed: true, remaining: limit };

  const now = Date.now();
  const raw = localStorage.getItem(RATE_LIMIT_KEY);
  const all = raw ? JSON.parse(raw) as Record<string, number[]> : {};
  const hits = (all[bucket] || []).filter(time => now - time < windowMs);
  const allowed = hits.length < limit;
  const nextHits = allowed ? [...hits, now] : hits;

  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ ...all, [bucket]: nextHits }));

  return {
    allowed,
    remaining: Math.max(0, limit - nextHits.length),
    resetAt: hits[0] ? hits[0] + windowMs : now + windowMs,
  };
}
