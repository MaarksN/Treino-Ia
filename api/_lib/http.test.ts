import { afterEach, describe, expect, it, vi } from 'vitest';
import { getTrustedRequestOrigin, handleApiError, json, readJsonObject } from './http';

describe('http helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns a generic 500 without leaking internal messages', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const response = handleApiError(new Error('database password=secret failed'));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Internal server error');
    expect(body.requestId).toEqual(expect.any(String));
    expect(JSON.stringify(body)).not.toContain('secret');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('limits JSON body size while preserving object format', async () => {
    const request = new Request('https://treino.example/api/test', {
      method: 'POST',
      body: JSON.stringify({ ok: true }),
    });

    await expect(readJsonObject(request, { maxBytes: 4 })).rejects.toMatchObject({
      status: 413,
    });
  });

  it('echoes only allowlisted CORS origins', () => {
    vi.stubEnv('APP_URL', 'https://staging.treinoia.example');
    vi.stubEnv('CORS_ALLOWED_ORIGINS', 'https://app.treinoia.example');

    const allowed = json({ ok: true }, 200, new Request('https://api.treinoia.example/api/test', {
      headers: { origin: 'https://app.treinoia.example' },
    }));
    const blocked = json({ ok: true }, 200, new Request('https://api.treinoia.example/api/test', {
      headers: { origin: 'https://evil.example' },
    }));

    expect(allowed.headers.get('access-control-allow-origin')).toBe('https://app.treinoia.example');
    expect(blocked.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('uses a trusted origin for redirects instead of raw request origin', () => {
    vi.stubEnv('APP_URL', 'https://staging.treinoia.example');

    const request = new Request('https://api.treinoia.example/api/stripe/create-checkout-session', {
      headers: { origin: 'https://evil.example' },
    });

    expect(getTrustedRequestOrigin(request)).toBe('https://staging.treinoia.example');
  });
});
