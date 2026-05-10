import { getServerEntitlement, incrementUsageCounter } from './_lib/billing-store';
import { handleApiError, HttpError, json, requireEnv } from './_lib/http';
import { requireSupabaseUser } from './_lib/server-supabase';

export const config = {
  runtime: 'nodejs',
};

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';
const FREE_AI_REQUEST_LIMIT = 10;

function cors(body: unknown, status = 200) {
  const response = json(body, status);
  response.headers.set('access-control-allow-origin', '*');
  response.headers.set('access-control-allow-methods', 'POST, OPTIONS');
  response.headers.set('access-control-allow-headers', 'authorization, content-type, x-csrf-token');
  return response;
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
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      await incrementUsageCounter(user.id, 'ai_requests');
    }

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        'content-type': response.headers.get('content-type') ?? 'application/json',
        'cache-control': 'private, no-store',
      },
    });
  } catch (error) {
    const response = handleApiError(error);
    response.headers.set('access-control-allow-origin', '*');
    response.headers.set('access-control-allow-methods', 'POST, OPTIONS');
    response.headers.set('access-control-allow-headers', 'authorization, content-type, x-csrf-token');
    return response;
  }
}
