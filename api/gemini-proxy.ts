import { pruneBoundedTtlCache, setBoundedTtlCacheEntry } from './_lib/boundedTtlCache';
import { getServerEntitlement, incrementUsageCounter } from './_lib/billing-entitlements';
import { fetchWithTimeout } from './_lib/fetchWithTimeout';
import { handleApiError, HttpError, json, requireEnv } from './_lib/http';
import { isTransientFetchError, retryWithBackoff, shouldRetryGeminiStatus } from './_lib/retryPolicy';
import { requireSupabaseUser } from './_lib/server-supabase';

export const config = {
  runtime: 'edge',
};

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';
const FREE_AI_REQUEST_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const FREE_RATE_LIMIT = 20;
const PREMIUM_RATE_LIMIT = 60;
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_RESPONSE_CACHE_ENTRIES = 100;
const MAX_RATE_BUCKETS = 1_000;
const MAX_REQUEST_BYTES = 120_000;
const GEMINI_TIMEOUT_MS = 25_000;
const GEMINI_MAX_RETRIES = 2;
const GEMINI_RETRY_BASE_DELAY_MS = 300;

interface RateBucket {
  count: number;
  resetAt: number;
}

interface CachedGeminiResponse {
  body: string;
  contentType: string;
  expiresAt: number;
  status: number;
}

const rateBuckets = new Map<string, RateBucket>();
const responseCache = new Map<string, CachedGeminiResponse>();

function cors(body: unknown, status = 200) {
  const response = json(body, status);
  response.headers.set('access-control-allow-origin', '*');
  response.headers.set('access-control-allow-methods', 'POST, OPTIONS');
  response.headers.set('access-control-allow-headers', 'authorization, content-type, x-csrf-token');
  return response;
}

function withCorsHeaders(response: Response) {
  response.headers.set('access-control-allow-origin', '*');
  response.headers.set('access-control-allow-methods', 'POST, OPTIONS');
  response.headers.set('access-control-allow-headers', 'authorization, content-type, x-csrf-token');
  return response;
}

function enforceMinuteRateLimit(userId: string, hasUnlimitedAi: boolean) {
  const now = Date.now();
  pruneRateBuckets(now);

  const limit = hasUnlimitedAi ? PREMIUM_RATE_LIMIT : FREE_RATE_LIMIT;
  const current = rateBuckets.get(userId);

  if (!current || current.resetAt <= now) {
    rateBuckets.set(userId, {
      count: 1,
      resetAt: now + RATE_WINDOW_MS,
    });
    return;
  }

  if (current.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    throw new HttpError(429, `Muitas chamadas de IA. Tente novamente em ${retryAfter}s.`);
  }

  current.count += 1;
}

function pruneRateBuckets(now = Date.now()) {
  for (const [key, bucket] of rateBuckets.entries()) {
    if (bucket.resetAt <= now) {
      rateBuckets.delete(key);
    }
  }

  if (rateBuckets.size <= MAX_RATE_BUCKETS) return;

  const bucketsByReset = [...rateBuckets.entries()]
    .sort(([, left], [, right]) => left.resetAt - right.resetAt);

  for (const [key] of bucketsByReset) {
    if (rateBuckets.size <= MAX_RATE_BUCKETS) return;
    rateBuckets.delete(key);
  }
}

function isCacheableGeminiBody(bodyText: string) {
  if (bodyText.length > 120_000) return false;
  return !bodyText.includes('"inlineData"') && !bodyText.includes('"fileData"');
}

function ensureValidGeminiPayload(rawBody: string) {
  if (!rawBody || rawBody.trim().length === 0) {
    throw new HttpError(400, 'Payload vazio para Gemini proxy.');
  }

  if (rawBody.length > MAX_REQUEST_BYTES) {
    throw new HttpError(413, 'Payload acima do limite permitido para Gemini proxy.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    throw new HttpError(400, 'Payload JSON inválido para Gemini proxy.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new HttpError(400, 'Payload Gemini deve ser um objeto JSON.');
  }

  const candidate = parsed as { contents?: unknown };
  if (!Array.isArray(candidate.contents) || candidate.contents.length === 0) {
    throw new HttpError(400, 'Payload Gemini deve conter "contents" com ao menos um item.');
  }

  return JSON.stringify(parsed);
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return cors({ ok: true });
  if (request.method !== 'POST') return cors({ error: 'Method not allowed' }, 405);

  try {
    const apiKey = requireEnv('GEMINI_API_KEY');
    const user = await requireSupabaseUser(request);
    const entitlement = await getServerEntitlement(user.id);
    const hasUnlimitedAi = entitlement.entitlements.includes('ai.unlimited');

    if (!hasUnlimitedAi && entitlement.usage.aiRequestsThisMonth >= FREE_AI_REQUEST_LIMIT) {
      throw new HttpError(402, 'Limite mensal de IA atingido para o plano Free.');
    }

    const rawBody = await request.text();
    const bodyText = ensureValidGeminiPayload(rawBody);
    const cacheable = isCacheableGeminiBody(bodyText);
    const cacheKey = cacheable ? await sha256(`${user.id}:${bodyText}`) : '';
    pruneBoundedTtlCache(responseCache, {
      maxEntries: MAX_RESPONSE_CACHE_ENTRIES,
      now: Date.now(),
    });
    const cached = cacheable ? responseCache.get(cacheKey) : undefined;

    enforceMinuteRateLimit(user.id, hasUnlimitedAi);

    if (cached && cached.expiresAt > Date.now()) {
      return withCorsHeaders(new Response(cached.body, {
        status: cached.status,
        headers: {
          'content-type': cached.contentType,
          'cache-control': 'private, no-store',
          'x-treino-ai-cache': 'hit',
        },
      }));
    }

    const response = await retryWithBackoff(
      () => fetchWithTimeout(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: bodyText,
      }, {
        timeoutMs: GEMINI_TIMEOUT_MS,
      }),
      {
        maxRetries: GEMINI_MAX_RETRIES,
        baseDelayMs: GEMINI_RETRY_BASE_DELAY_MS,
        shouldRetryResult: result => shouldRetryGeminiStatus(result.status),
        shouldRetryError: isTransientFetchError,
      },
    ).catch(() => {
      throw new HttpError(502, 'AI provider temporarily unavailable.');
    });
    const responseText = await response.text();

    if (response.ok) {
      await incrementUsageCounter(user.id, 'ai_requests');
    }

    const contentType = response.headers.get('content-type') ?? 'application/json';

    if (!response.ok) {
      return cors({
        error: response.status >= 500
          ? 'AI provider temporarily unavailable.'
          : 'Gemini request was rejected.',
      }, response.status >= 500 ? 502 : response.status);
    }

    if (response.ok && cacheable) {
      // In-memory cache/rate state is per runtime instance; distributed KV/Redis is a follow-up.
      setBoundedTtlCacheEntry(responseCache, cacheKey, {
        body: responseText,
        contentType,
        expiresAt: Date.now() + CACHE_TTL_MS,
        status: response.status,
      }, {
        maxEntries: MAX_RESPONSE_CACHE_ENTRIES,
        now: Date.now(),
      });
    }

    return withCorsHeaders(new Response(responseText, {
      status: response.status,
      headers: {
        'content-type': contentType,
        'cache-control': 'private, no-store',
        'x-treino-ai-cache': 'miss',
      },
    }));
  } catch (error) {
    const response = handleApiError(error);
    response.headers.set('access-control-allow-origin', '*');
    response.headers.set('access-control-allow-methods', 'POST, OPTIONS');
    response.headers.set('access-control-allow-headers', 'authorization, content-type, x-csrf-token');
    return response;
  }
}
