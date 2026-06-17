import { pruneBoundedTtlCache, setBoundedTtlCacheEntry } from './_lib/boundedTtlCache';
import { getServerEntitlement, incrementUsageCounter } from './_lib/billing-entitlements';
import { checkRateLimit } from './_lib/distributedRateLimit';
import { fetchWithTimeout } from './_lib/fetchWithTimeout';
import { validateAndSerializeGeminiPayload } from './_lib/geminiPayload';
import {
  applyCorsHeaders,
  getCorrelationId,
  handleApiError,
  HttpError,
  json,
  requireEnv,
} from './_lib/http';
import {
  isTransientFetchError,
  retryWithBackoff,
  shouldRetryGeminiStatus,
} from './_lib/retryPolicy';
import { logSecurityEvent } from './_lib/securityLogger';
import { requireSupabaseUser } from './_lib/server-supabase';

export const config = {
  runtime: 'edge',
};

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';
const FREE_AI_REQUEST_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const FREE_RATE_LIMIT = 20;
const PREMIUM_RATE_LIMIT = 60;
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_RESPONSE_CACHE_ENTRIES = 100;
const MAX_REQUEST_BYTES = 120_000;
const GEMINI_TIMEOUT_MS = 25_000;
const GEMINI_MAX_RETRIES = 2;
const GEMINI_RETRY_BASE_DELAY_MS = 300;
const GEMINI_CORS_OPTIONS = {
  methods: 'POST, OPTIONS',
  headers: 'authorization, content-type, x-csrf-token',
};

interface CachedGeminiResponse {
  body: string;
  contentType: string;
  expiresAt: number;
  status: number;
}

const responseCache = new Map<string, CachedGeminiResponse>();

function cors(body: unknown, status = 200, request?: Request) {
  return json(body, status, request, GEMINI_CORS_OPTIONS);
}

function withCorsHeaders(response: Response, request: Request) {
  return applyCorsHeaders(response, request, GEMINI_CORS_OPTIONS);
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return cors({ ok: true }, 200, request);
  if (request.method !== 'POST') return cors({ error: 'Method not allowed' }, 405, request);

  try {
    const user = await requireSupabaseUser(request);
    const apiKey = requireEnv('GEMINI_API_KEY');
    const entitlement = await getServerEntitlement(user.id);
    const hasUnlimitedAi = entitlement.entitlements.includes('ai.unlimited');

    if (!hasUnlimitedAi && entitlement.usage.aiRequestsThisMonth >= FREE_AI_REQUEST_LIMIT) {
      throw new HttpError(402, 'Limite mensal de IA atingido para o plano Free.');
    }

    const rawBody = await request.text();
    const payload = (() => {
      try {
        return validateAndSerializeGeminiPayload(rawBody, { maxBytes: MAX_REQUEST_BYTES });
      } catch (error) {
        logSecurityEvent({
          type: 'gemini_payload_rejected',
          route: '/api/gemini-proxy',
          subject: user.id,
          correlationId: getCorrelationId(request),
          metadata: {
            status: error instanceof HttpError ? error.status : 500,
            message: error instanceof Error ? error.message : 'unknown',
          },
        });
        throw error;
      }
    })();
    const bodyText = payload.bodyText;
    const cacheable = payload.cacheable;
    const cacheKey = cacheable ? await sha256(`${user.id}:${bodyText}`) : '';
    pruneBoundedTtlCache(responseCache, {
      maxEntries: MAX_RESPONSE_CACHE_ENTRIES,
      now: Date.now(),
    });
    const cached = cacheable ? responseCache.get(cacheKey) : undefined;

    const limit = hasUnlimitedAi ? PREMIUM_RATE_LIMIT : FREE_RATE_LIMIT;
    const rateLimit = await checkRateLimit(user.id, limit, RATE_WINDOW_MS);

    if (!rateLimit.allowed) {
      const retryAfter = Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000));
      logSecurityEvent({
        type: 'gemini_rate_limited',
        route: '/api/gemini-proxy',
        subject: user.id,
        correlationId: getCorrelationId(request),
        metadata: {
          limit,
          remaining: rateLimit.remaining,
          resetAt: new Date(rateLimit.resetAt).toISOString(),
        },
      });

      const response = cors(
        {
          error: `Muitas chamadas de IA. Tente novamente em ${retryAfter}s.`,
          retryAfter,
        },
        429,
        request,
      );
      response.headers.set('retry-after', retryAfter.toString());
      response.headers.set('x-ratelimit-remaining', rateLimit.remaining.toString());
      return response;
    }

    if (cached && cached.expiresAt > Date.now()) {
      return withCorsHeaders(
        new Response(cached.body, {
          status: cached.status,
          headers: {
            'content-type': cached.contentType,
            'cache-control': 'private, no-store',
            'x-treino-ai-cache': 'hit',
          },
        }),
        request,
      );
    }

    const response = await retryWithBackoff(
      () =>
        fetchWithTimeout(
          `${GEMINI_ENDPOINT}?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: bodyText,
          },
          {
            timeoutMs: GEMINI_TIMEOUT_MS,
          },
        ),
      {
        maxRetries: GEMINI_MAX_RETRIES,
        baseDelayMs: GEMINI_RETRY_BASE_DELAY_MS,
        shouldRetryResult: (result) => shouldRetryGeminiStatus(result.status),
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
      return cors(
        {
          error:
            response.status >= 500
              ? 'AI provider temporarily unavailable.'
              : 'Gemini request was rejected.',
        },
        response.status >= 500 ? 502 : response.status,
        request,
      );
    }

    if (response.ok && cacheable) {
      setBoundedTtlCacheEntry(
        responseCache,
        cacheKey,
        {
          body: responseText,
          contentType,
          expiresAt: Date.now() + CACHE_TTL_MS,
          status: response.status,
        },
        {
          maxEntries: MAX_RESPONSE_CACHE_ENTRIES,
          now: Date.now(),
        },
      );
    }

    return withCorsHeaders(
      new Response(responseText, {
        status: response.status,
        headers: {
          'content-type': contentType,
          'cache-control': 'private, no-store',
          'x-treino-ai-cache': 'miss',
        },
      }),
      request,
    );
  } catch (error) {
    const response = handleApiError(error, request);
    return withCorsHeaders(response, request);
  }
}
