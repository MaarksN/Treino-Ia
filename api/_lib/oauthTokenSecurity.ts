import { HttpError } from './http';
import { redactSensitiveData } from './redact';

export type OAuthTokenSecurityMode =
  | 'encrypted'
  | 'plaintext_blocked'
  | 'plaintext_legacy_guarded'
  | 'not_configured';

const TOKEN_FIELDS = ['access_token', 'refresh_token', 'token'];

export function getOAuthTokenSecurityMode(): OAuthTokenSecurityMode {
  const mode = (process.env.OAUTH_TOKEN_SECURITY_MODE ?? '').trim() as OAuthTokenSecurityMode;
  if (mode === 'encrypted' || mode === 'plaintext_blocked' || mode === 'plaintext_legacy_guarded') return mode;
  return 'not_configured';
}

export function assertOAuthTokenStorageAllowed(mode = getOAuthTokenSecurityMode()): void {
  if (mode === 'plaintext_blocked') {
    throw new HttpError(503, 'OAuth token storage is disabled until encryption is configured.');
  }
}

export function redactOAuthTokenPayload<T>(payload: T): T {
  return redactSensitiveData(payload) as T;
}

export function buildOAuthTokenStorageWarning(mode = getOAuthTokenSecurityMode()): string | null {
  if (mode === 'encrypted') return null;
  if (mode === 'plaintext_blocked') {
    return 'OAuth token persistence is blocked: encryption/KMS is required before storing tokens.';
  }
  if (mode === 'plaintext_legacy_guarded') {
    return 'OAuth token persistence uses guarded plaintext fallback. Residual risk remains until KMS-backed encryption is implemented.';
  }
  return 'OAuth token storage mode is not configured. Do not claim encryption; configure OAUTH_TOKEN_SECURITY_MODE and KMS-backed encryption.';
}

export function sanitizeOAuthTokenRecord(record: Record<string, unknown>): Record<string, unknown> {
  const next = { ...record };
  TOKEN_FIELDS.forEach(field => {
    if (field in next) {
      next[field] = '[REDACTED]';
    }
  });
  return next;
}
