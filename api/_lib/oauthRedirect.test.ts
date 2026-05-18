import { afterEach, describe, expect, it } from 'vitest';
import { sanitizeRedirectTarget } from './oauthRedirect';

const BASE_URL = 'https://app.treino.ai';

afterEach(() => {
  delete process.env.OAUTH_REDIRECT_ALLOWLIST;
});

describe('sanitizeRedirectTarget', () => {
  it('rejects off-origin redirects', () => {
    expect(sanitizeRedirectTarget('https://evil.com/phish', BASE_URL)).toBe(`${BASE_URL}/`);
  });

  it('rejects javascript URLs', () => {
    expect(sanitizeRedirectTarget('javascript:alert(1)', BASE_URL)).toBe(`${BASE_URL}/`);
  });

  it('accepts valid relative redirects', () => {
    expect(sanitizeRedirectTarget('/dashboard?tab=health', BASE_URL)).toBe(`${BASE_URL}/dashboard?tab=health`);
  });

  it('accepts allowlisted origin redirects', () => {
    process.env.OAUTH_REDIRECT_ALLOWLIST = 'https://preview.treino.ai,https://admin.treino.ai';
    expect(sanitizeRedirectTarget('https://preview.treino.ai/health', BASE_URL)).toBe('https://preview.treino.ai/health');
  });

  it('falls back on empty or malformed values', () => {
    expect(sanitizeRedirectTarget('', BASE_URL)).toBe(`${BASE_URL}/`);
    expect(sanitizeRedirectTarget(':// malformed', BASE_URL)).toBe(`${BASE_URL}/`);
  });
});
