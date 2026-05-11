import { handleApiError, HttpError, json, readJsonObject } from '../_lib/http';
import { getSupabaseAdmin, requireSupabaseUser } from '../_lib/server-supabase';

export const config = {
  runtime: 'nodejs',
};

const PROVIDERS = ['apple_health', 'google_fit', 'health_connect', 'garmin', 'fitbit', 'ble_hr', 'strava'] as const;
type Provider = typeof PROVIDERS[number];

function isProvider(value: string): value is Provider {
  return PROVIDERS.includes(value as Provider);
}

function getDataMode(provider: Provider): 'native' | 'oauth' | 'csv' | 'ble' {
  if (provider === 'apple_health' || provider === 'health_connect') return 'native';
  if (provider === 'garmin') return 'csv';
  if (provider === 'ble_hr') return 'ble';
  return 'oauth';
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return json({ ok: true });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const user = await requireSupabaseUser(request);
    const body = await readJsonObject(request);
    const provider = String(body.provider || '');

    if (!isProvider(provider)) {
      throw new HttpError(400, 'Unsupported health provider');
    }

    const supabase = getSupabaseAdmin();
    const dataMode = getDataMode(provider);

    if (dataMode === 'oauth') {
      const { data: token, error: tokenError } = await supabase
        .from('health_integration_tokens')
        .select('provider,expires_at')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .maybeSingle();

      if (tokenError) {
        throw new Error(`Failed to verify OAuth token: ${tokenError.message}`);
      }
      if (!token) {
        throw new HttpError(409, 'OAuth provider is not connected yet');
      }
    }

    const summary = typeof body.summary === 'object' && body.summary && !Array.isArray(body.summary)
      ? body.summary as Record<string, unknown>
      : {};

    const { data: job, error: jobError } = await supabase
      .from('health_sync_jobs')
      .insert({
        user_id: user.id,
        provider,
        status: 'completed',
        requested_by: 'user',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        summary: {
          dataMode,
          ...summary,
        },
      })
      .select('*')
      .single();

    if (jobError) {
      throw new Error(`Failed to create health sync job: ${jobError.message}`);
    }

    const { error: integrationError } = await supabase
      .from('health_integrations')
      .upsert({
        user_id: user.id,
        provider,
        status: 'connected',
        data_mode: dataMode,
        scopes: Array.isArray(body.scopes) ? body.scopes.map(String) : [],
        last_sync_at: new Date().toISOString(),
        error_message: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,provider' });

    if (integrationError) {
      throw new Error(`Failed to update health integration: ${integrationError.message}`);
    }

    return json({
      ok: true,
      dataMode,
      job,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
