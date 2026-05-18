import { Buffer } from 'node:buffer';
import { handleApiError, HttpError, json } from '../../_lib/http';
import { getSupabaseAdmin } from '../../_lib/server-supabase';
import { normalizeRedirectTo } from '../../_lib/redirectAllowlist';
import { assertOAuthTokenStorageAllowed, buildOAuthTokenStorageWarning, redactOAuthTokenPayload } from '../../_lib/oauthTokenSecurity';

export const config = {
  runtime: 'nodejs',
};

type OAuthProvider = 'google_fit' | 'fitbit' | 'strava';

type OAuthTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  scope?: string;
  expires_in?: number;
  athlete?: unknown;
  error?: string;
  error_description?: string;
};

function getBaseUrl(request: Request): string {
  const configured = process.env.APP_URL;
  if (configured) return configured.replace(/\/$/, '');
  return new URL(request.url).origin;
}

function getSecret(provider: OAuthProvider): string {
  if (provider === 'google_fit') return process.env.GOOGLE_FIT_CLIENT_SECRET || '';
  if (provider === 'fitbit') return process.env.FITBIT_CLIENT_SECRET || '';
  return process.env.STRAVA_CLIENT_SECRET || '';
}

function getClientId(provider: OAuthProvider): string {
  if (provider === 'google_fit') return process.env.GOOGLE_FIT_CLIENT_ID || '';
  if (provider === 'fitbit') return process.env.FITBIT_CLIENT_ID || '';
  return process.env.STRAVA_CLIENT_ID || '';
}

async function exchangeToken(provider: OAuthProvider, code: string, redirectUri: string): Promise<OAuthTokenResponse> {
  const clientId = getClientId(provider);
  const clientSecret = getSecret(provider);

  if (!clientId || !clientSecret) {
    throw new HttpError(500, `${provider.toUpperCase()} OAuth credentials are not configured`);
  }

  if (provider === 'google_fit') {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    return response.json() as Promise<OAuthTokenResponse>;
  }

  if (provider === 'fitbit') {
    const response = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: {
        authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    return response.json() as Promise<OAuthTokenResponse>;
  }

  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  });
  return response.json() as Promise<OAuthTokenResponse>;
}

function buildRedirect(url: string, params: Record<string, string>): Response {
  const target = new URL(url);
  Object.entries(params).forEach(([key, value]) => target.searchParams.set(key, value));
  return Response.redirect(target.toString(), 302);
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return json({ ok: true });
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  try {
    const url = new URL(request.url);
    const state = url.searchParams.get('state') || '';
    const code = url.searchParams.get('code') || '';
    const oauthError = url.searchParams.get('error');
    const supabase = getSupabaseAdmin();

    if (!state) throw new HttpError(400, 'OAuth state is required');

    const { data: storedState, error: stateError } = await supabase
      .from('health_oauth_states')
      .select('*')
      .eq('state', state)
      .is('consumed_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (stateError) {
      throw new Error(`Failed to validate OAuth state: ${stateError.message}`);
    }
    if (!storedState) throw new HttpError(400, 'OAuth state is invalid or expired');

    const baseUrl = getBaseUrl(request);
    const redirectTo = normalizeRedirectTo(storedState.redirect_to, { baseUrl, fallbackPath: '/' });
    const provider = storedState.provider as OAuthProvider;

    if (oauthError) {
      await supabase
        .from('health_integrations')
        .upsert({
          user_id: storedState.user_id,
          provider,
          status: 'error',
          data_mode: 'oauth',
          scopes: [],
          error_message: oauthError,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,provider' });
      return buildRedirect(redirectTo, { health_provider: provider, health_status: 'error' });
    }

    if (!code) throw new HttpError(400, 'OAuth code is required');

    const token = await exchangeToken(provider, code, `${baseUrl}/api/health/oauth/callback`);
    if (!token.access_token) {
      throw new Error(token.error_description || token.error || 'OAuth token response did not include access_token');
    }

    const expiresAt = token.expires_in
      ? new Date(Date.now() + token.expires_in * 1000).toISOString()
      : null;

    const scope = token.scope || '';
    const scopes = scope ? scope.split(/[,\s]+/).filter(Boolean) : [];

    assertOAuthTokenStorageAllowed();
    const securityWarning = buildOAuthTokenStorageWarning();
    if (securityWarning) {
      console.warn('OAuth token storage warning', { provider, warning: securityWarning });
    }

    const { error: tokenError } = await supabase
      .from('health_integration_tokens')
      .upsert({
        user_id: storedState.user_id,
        provider,
        access_token: token.access_token,
        refresh_token: token.refresh_token ?? null,
        token_type: token.token_type ?? null,
        scope,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,provider' });

    if (tokenError) {
      throw new Error(`Failed to store OAuth token: ${JSON.stringify(redactOAuthTokenPayload({ provider, error: tokenError.message }))}`);
    }

    const { error: integrationError } = await supabase
      .from('health_integrations')
      .upsert({
        user_id: storedState.user_id,
        provider,
        status: 'connected',
        data_mode: 'oauth',
        scopes,
        last_sync_at: new Date().toISOString(),
        error_message: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,provider' });

    if (integrationError) {
      throw new Error(`Failed to update health integration: ${integrationError.message}`);
    }

    await supabase
      .from('health_oauth_states')
      .update({ consumed_at: new Date().toISOString() })
      .eq('state', state);

    return buildRedirect(redirectTo, { health_provider: provider, health_status: 'connected' });
  } catch (error) {
    return handleApiError(error);
  }
}
