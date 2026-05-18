import { randomBytes } from 'node:crypto';
import { handleApiError, HttpError, json, readJsonObject } from '../../_lib/http';
import { sanitizeRedirectTarget } from '../../_lib/oauthRedirect';
import { getSupabaseAdmin, requireSupabaseUser } from '../../_lib/server-supabase';

export const config = {
  runtime: 'nodejs',
};

type OAuthProvider = 'google_fit' | 'fitbit' | 'strava';

const PROVIDERS: OAuthProvider[] = ['google_fit', 'fitbit', 'strava'];

function getBaseUrl(request: Request): string {
  const configured = process.env.APP_URL;
  if (configured) return configured.replace(/\/$/, '');
  return new URL(request.url).origin;
}


function getProviderClientId(provider: OAuthProvider): string {
  if (provider === 'google_fit') return process.env.GOOGLE_FIT_CLIENT_ID || '';
  if (provider === 'fitbit') return process.env.FITBIT_CLIENT_ID || '';
  return process.env.STRAVA_CLIENT_ID || '';
}

function buildAuthUrl(provider: OAuthProvider, clientId: string, redirectUri: string, state: string): string {
  if (provider === 'google_fit') {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      state,
      scope: [
        'https://www.googleapis.com/auth/fitness.activity.read',
        'https://www.googleapis.com/auth/fitness.heart_rate.read',
        'https://www.googleapis.com/auth/fitness.sleep.read',
      ].join(' '),
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  if (provider === 'fitbit') {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      scope: 'activity heartrate sleep profile',
    });
    return `https://www.fitbit.com/oauth2/authorize?${params.toString()}`;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    approval_prompt: 'auto',
    state,
    scope: 'read,activity:read_all',
  });
  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return json({ ok: true });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const user = await requireSupabaseUser(request);
    const body = await readJsonObject(request);
    const provider = String(body.provider || '') as OAuthProvider;

    if (!PROVIDERS.includes(provider)) {
      throw new HttpError(400, 'Unsupported OAuth health provider');
    }

    const clientId = getProviderClientId(provider);
    if (!clientId) {
      throw new HttpError(500, `${provider.toUpperCase()} OAuth client id is not configured`);
    }

    const baseUrl = getBaseUrl(request);
    const redirectUri = `${baseUrl}/api/health/oauth/callback`;
    const state = randomBytes(32).toString('hex');
    const redirectTo = sanitizeRedirectTarget(body.redirectTo, baseUrl).slice(0, 500);

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('health_oauth_states').insert({
      state,
      user_id: user.id,
      provider,
      redirect_to: redirectTo,
      expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
    });

    if (error) {
      throw new Error(`Failed to create OAuth state: ${error.message}`);
    }

    return json({
      provider,
      dataMode: 'oauth',
      authUrl: buildAuthUrl(provider, clientId, redirectUri, state),
      expiresInSeconds: 600,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
