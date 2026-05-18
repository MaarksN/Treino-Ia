import { describe, expect, it } from 'vitest';
import { normalizeRedirectTo } from './redirectAllowlist';

const baseUrl = 'https://app.treino-ia.com';

describe('redirect allowlist', () => {
  it('allows safe relative path', () => {
    expect(normalizeRedirectTo('/dashboard', { baseUrl })).toBe('https://app.treino-ia.com/dashboard');
  });

  it('allows configured official origin', () => {
    process.env.OAUTH_REDIRECT_ALLOWED_ORIGINS = 'https://official.treino-ia.com';
    expect(normalizeRedirectTo('https://official.treino-ia.com/app', { baseUrl })).toBe('https://official.treino-ia.com/app');
  });

  it('blocks external domain and spoofed subdomain', () => {
    process.env.OAUTH_REDIRECT_ALLOWED_ORIGINS = 'https://dominio-oficial.com';
    expect(normalizeRedirectTo('https://evil.com', { baseUrl })).toBe('https://app.treino-ia.com/dashboard');
    expect(normalizeRedirectTo('https://dominio-oficial.com.evil.com/path', { baseUrl })).toBe('https://app.treino-ia.com/dashboard');
  });

  it('blocks javascript and invalid url', () => {
    expect(normalizeRedirectTo('javascript:alert(1)', { baseUrl })).toBe('https://app.treino-ia.com/dashboard');
    expect(normalizeRedirectTo('https://%%%', { baseUrl })).toBe('https://app.treino-ia.com/dashboard');
  });
});
