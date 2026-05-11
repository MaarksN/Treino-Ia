import { getServerEntitlement, incrementUsageCounter } from './_lib/billing-entitlements';
import { handleApiError, HttpError, json, requireEnv } from './_lib/http';
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

function isCacheableGeminiBody(bodyText: string) {
  if (bodyText.length > 120_000) return false;
  return !bodyText.includes('"inlineData"') && !bodyText.includes('"fileData"');
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

    const body = await request.json();
    const bodyText = JSON.stringify(body);
    const cacheable = isCacheableGeminiBody(bodyText);
    const cacheKey = cacheable ? await sha256(`${user.id}:${bodyText}`) : '';
    const cached = cacheable ? responseCache.get(cacheKey) : undefined;

    enforceMinuteRateLimit(user.id, hasUnlimitedAi);

    if (cached && cached.expiresAt > Date.now()) {
      return withCorsHeaders(new Response(cached.body, {
        status: cached.status,
        headers: {
          'content-type': cached.contentType,
          'cache-control': 'private, max-age=60',
          'x-treino-ai-cache': 'hit',
        },
      }));
    }

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: bodyText,
    });
    const responseText = await response.text();

    if (response.ok) {
      await incrementUsageCounter(user.id, 'ai_requests');
    }

    const contentType = response.headers.get('content-type') ?? 'application/json';

    if (response.ok && cacheable) {
      responseCache.set(cacheKey, {
        body: responseText,
        contentType,
        expiresAt: Date.now() + CACHE_TTL_MS,
        status: response.status,
      });
    }

    return withCorsHeaders(new Response(responseText, {
      status: response.status,
      headers: {
        'content-type': contentType,
        'cache-control': cacheable ? 'private, max-age=60' : 'private, no-store',
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
