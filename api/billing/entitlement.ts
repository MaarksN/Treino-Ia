import { getServerEntitlement } from '../_lib/billing-store';
import { handleApiError, json } from '../_lib/http';
import { requireSupabaseUser } from '../_lib/server-supabase';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return json({ ok: true });
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  try {
    const user = await requireSupabaseUser(request);
    const entitlement = await getServerEntitlement(user.id);

    return json(entitlement);
  } catch (error) {
    return handleApiError(error);
  }
}

