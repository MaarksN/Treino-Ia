import { handleApiError, HttpError, json, readJsonObject } from '../_lib/http';
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

function parseEvents(value: unknown): IncomingErrorEvent[] {
  if (!Array.isArray(value)) {
    throw new HttpError(400, 'events must be an array.');
  }

  if (value.length > 50) {
    throw new HttpError(413, 'At most 50 error events can be flushed at once.');
  }

  return value as IncomingErrorEvent[];
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await readJsonObject(request);
    const events = parseEvents(body.events);
    let userId: string | null = null;

    try {
      userId = (await requireSupabaseUser(request)).id;
    } catch {
      userId = null;
    }

    const rows = events.map(event => {
      if (typeof event.message !== 'string' || typeof event.source !== 'string') {
        throw new HttpError(400, 'Each error event requires message and source.');
      }

      return {
        user_id: userId,
        source: event.source.slice(0, 120),
        message: event.message.slice(0, 1000),
        stack: typeof event.stack === 'string' ? event.stack.slice(0, 6000) : null,
        url: typeof event.url === 'string' ? event.url.slice(0, 1000) : null,
        user_agent: typeof event.userAgent === 'string' ? event.userAgent.slice(0, 500) : null,
        metadata: event.metadata && typeof event.metadata === 'object' ? event.metadata : {},
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
      throw new Error(`Failed to store telemetry: ${error.message}`);
    }

    return json({ ok: true, stored: rows.length });
  } catch (error) {
    return handleApiError(error);
  }
}
