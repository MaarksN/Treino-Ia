import { handleApiError, json } from '../_lib/http';
import { getSupabaseAdmin, requireSupabaseUser } from '../_lib/server-supabase';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return json({ ok: true });
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  try {
    const user = await requireSupabaseUser(request);
    const supabase = getSupabaseAdmin();

    const { data: profile, error: profileError } = await supabase
      .from('gamification_profiles')
      .upsert({ user_id: user.id }, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (profileError) {
      throw new Error(`Failed to load gamification profile: ${profileError.message}`);
    }

    const { data: events, error: eventsError } = await supabase
      .from('gamification_ledger')
      .select('id,event_type,source_id,xp_delta,coin_delta,metadata,created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (eventsError) {
      throw new Error(`Failed to load gamification ledger: ${eventsError.message}`);
    }

    return json({
      profile,
      events: events ?? [],
    });
  } catch (error) {
    return handleApiError(error);
  }
}

