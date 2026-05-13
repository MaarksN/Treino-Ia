import { handleApiError, HttpError, json, readJsonObject } from '../_lib/http';
import { getSupabaseAdmin, requireSupabaseUser } from '../_lib/server-supabase';

export const config = {
  runtime: 'nodejs',
};

interface OfflineActionBody {
  id?: unknown;
  type?: unknown;
  payload?: unknown;
  createdAt?: unknown;
}

function isJsonRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function parseOfflineAction(body: Record<string, unknown>): {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt?: number;
} {
  const action = body as OfflineActionBody;

  if (typeof action.id !== 'string' || action.id.length < 8) {
    throw new HttpError(400, 'Offline action id is required.');
  }

  if (typeof action.type !== 'string' || !/^[A-Z0-9_.:-]{3,80}$/i.test(action.type)) {
    throw new HttpError(400, 'Offline action type is invalid.');
  }

  if (!isJsonRecord(action.payload)) {
    throw new HttpError(400, 'Offline action payload must be a JSON object.');
  }

  return {
    id: action.id,
    type: action.type,
    payload: action.payload,
    createdAt: typeof action.createdAt === 'number' ? action.createdAt : undefined,
  };
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const user = await requireSupabaseUser(request);
    const body = await readJsonObject(request);
    const action = parseOfflineAction(body);
    const idempotencyKey = request.headers.get('x-idempotency-key');

    if (idempotencyKey && idempotencyKey !== action.id) {
      throw new HttpError(409, 'Idempotency key does not match offline action id.');
    }

    const supabase = getSupabaseAdmin();
    const payload: Record<string, unknown> = {
      ...action.payload,
      clientCreatedAt: action.createdAt ? new Date(action.createdAt).toISOString() : undefined,
    };
    const { error } = await supabase
      .from('offline_sync_actions')
      .upsert({
        user_id: user.id,
        client_action_id: action.id,
        action_type: action.type,
        payload,
        processed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,client_action_id' });

    if (error) {
      throw new Error(`Failed to persist offline action: ${error.message}`);
    }

    return json({ ok: true, synced: true, actionId: action.id });
  } catch (error) {
    return handleApiError(error);
  }
}
