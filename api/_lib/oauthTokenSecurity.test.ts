import { describe, expect, it } from 'vitest';
import {
  assertOAuthTokenStorageAllowed,
  buildOAuthTokenStorageWarning,
  getOAuthTokenSecurityMode,
  redactOAuthTokenPayload,
} from './oauthTokenSecurity';

describe('oauthTokenSecurity', () => {
  it('redacts access_token and refresh_token payloads', () => {
    const redacted = redactOAuthTokenPayload({ access_token: 'a', refresh_token: 'b', nested: { token: 'c' } }) as any;
    expect(redacted.access_token).toBe('[REDACTED]');
    expect(redacted.refresh_token).toBe('[REDACTED]');
    expect(redacted.nested.token).toBe('[REDACTED]');
  });

  it('returns warning when encryption is not configured', () => {
    delete process.env.OAUTH_TOKEN_SECURITY_MODE;
    expect(getOAuthTokenSecurityMode()).toBe('not_configured');
    expect(buildOAuthTokenStorageWarning()).toContain('not configured');
  });

  it('does not claim encryption when mode is missing', () => {
    process.env.OAUTH_TOKEN_SECURITY_MODE = 'unknown';
    expect(getOAuthTokenSecurityMode()).toBe('not_configured');
  });

  it('blocks storage when plaintext_blocked', () => {
    expect(() => assertOAuthTokenStorageAllowed('plaintext_blocked')).toThrow();
  });
});
