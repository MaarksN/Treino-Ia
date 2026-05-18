import { handleApiError, HttpError, json, readJsonObject } from '../_lib/http';
import { sanitizeTelemetryMessage, sanitizeTelemetryMetadata, sanitizeTelemetryUrl } from '../_lib/piiRedaction';
import { getSupabaseAdmin, requireSupabaseUser } from '../_lib/server-supabase';

export const config = {
  runtime: 'nodejs',
};

interface IncomingErrorEvent {
  id?: unknown;
  message?: unknown;
  stack?: unknown;
  source?: unknown;
  userAgent?: unknown;
  url?: unknown;
  createdAt?: unknown;
  metadata?: unknown;
}

interface AnonymousRateBucket {
  count: number;
  resetAt: number;
}

const MAX_TELEMETRY_BODY_BYTES = 120_000;
const ANONYMOUS_RATE_WINDOW_MS = 60_000;
const ANONYMOUS_RATE_LIMIT = 20;
const anonymousBuckets = new Map<string, AnonymousRateBucket>();

function parseEvents(value: unknown): IncomingErrorEvent[] {
  if (!Array.isArray(value)) {
    throw new HttpError(400, 'events must be an array.');
  }

  if (value.length > 50) {
    throw new HttpError(413, 'At most 50 error events can be flushed at once.');
  }

  return value as IncomingErrorEvent[];
}

function getAllowedOrigins(): Set<string> {
  return new Set(
    (process.env.TELEMETRY_ALLOWED_ORIGINS ?? '')
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean),
  );
}

function enforceSameOriginTelemetry(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return;

  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.has(origin)) return;

  const host = request.headers.get('host');
  if (!host) {
    throw new HttpError(403, 'Telemetry origin is not allowed.');
  }

  let originHost = '';

  try {
    originHost = new URL(origin).host;
  } catch {
    throw new HttpError(403, 'Telemetry origin is not allowed.');
  }

  if (originHost !== host) {
    throw new HttpError(403, 'Telemetry origin is not allowed.');
  }
}

function getAnonymousClientKey(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'anonymous'
  );
}

function enforceAnonymousRateLimit(request: Request) {
  const now = Date.now();
  const key = getAnonymousClientKey(request);
  const bucket = anonymousBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    anonymousBuckets.set(key, {
      count: 1,
      resetAt: now + ANONYMOUS_RATE_WINDOW_MS,
    });
    return;
  }

  if (bucket.count >= ANONYMOUS_RATE_LIMIT) {
    throw new HttpError(429, 'Too many telemetry events.');
  }

  bucket.count += 1;
}

async function getTelemetryUserId(request: Request): Promise<string | null> {
  if (!request.headers.get('authorization')) {
    enforceSameOriginTelemetry(request);
    enforceAnonymousRateLimit(request);
    return null;
  }

  return (await requireSupabaseUser(request)).id;
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await readJsonObject(request, { maxBytes: MAX_TELEMETRY_BODY_BYTES });
    const events = parseEvents(body.events);
    const userId = await getTelemetryUserId(request);

    const rows = events.map(event => {
      if (typeof event.message !== 'string' || typeof event.source !== 'string') {
        throw new HttpError(400, 'Each error event requires message and source.');
      }

      return {
        user_id: userId,
        source: sanitizeTelemetryMessage(event.source),
        message: sanitizeTelemetryMessage(event.message),
        stack: typeof event.stack === 'string' ? sanitizeTelemetryMessage(event.stack) : null,
        url: typeof event.url === 'string' ? sanitizeTelemetryUrl(event.url) : null,
        user_agent: typeof event.userAgent === 'string' ? sanitizeTelemetryMessage(event.userAgent) : null,
        metadata: sanitizeTelemetryMetadata(event.metadata),
        created_at: typeof event.createdAt === 'number'
          ? new Date(event.createdAt).toISOString()
          : new Date().toISOString(),
      };
    });

    if (!rows.length) {
      return json({ ok: true, stored: 0 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('telemetry_error_events')
      .insert(rows);

    if (error) {
      throw new Error('Failed to store telemetry.');
    }

    return json({ ok: true, stored: rows.length });
  } catch (error) {
    return handleApiError(error);
  }
}
