import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const checkRateLimit = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ allowed: true, remaining: 59, resetAt: Date.now() + 60_000 }),
);

vi.mock('../api/_lib/server-supabase', () => ({
  requireSupabaseUser: vi.fn().mockResolvedValue({ id: 'user-1' }),
}));

vi.mock('../api/_lib/distributedRateLimit', () => ({
  checkRateLimit,
}));

vi.mock('../api/_lib/billing-entitlements', () => ({
  getServerEntitlement: vi.fn().mockResolvedValue({
    entitlements: ['ai.unlimited'],
    usage: {
      aiRequestsThisMonth: 0,
    },
  }),
  incrementUsageCounter: vi.fn(),
}));

function geminiRequest() {
  return new Request('http://localhost/api/gemini-proxy', {
    method: 'POST',
    headers: {
      authorization: 'Bearer test-token',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'oi' }] }],
    }),
  });
}

describe('gemini proxy hardening', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    checkRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 59,
      resetAt: Date.now() + 60_000,
    });
    process.env.GEMINI_API_KEY = 'test-key';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns a safe final error after transient fetch failures', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('network failed apiKey=secret'));
    vi.stubGlobal('fetch', fetchMock);

    const { default: handler } = await import('../api/gemini-proxy');
    const response = await handler(geminiRequest());
    const body = await response.json();

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(response.status).toBe(502);
    expect(body.error).toBe('AI provider temporarily unavailable.');
    expect(JSON.stringify(body)).not.toContain('secret');
  });

  it('does not retry rejected 4xx upstream responses', async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response('{"error":"bad payload"}', {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const { default: handler } = await import('../api/gemini-proxy');
    const response = await handler(geminiRequest());
    const body = await response.json();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(400);
    expect(body.error).toBe('Gemini request was rejected.');
  });

  it('rejects unauthenticated users before checking provider credentials', async () => {
    delete process.env.GEMINI_API_KEY;
    const { HttpError } = await import('../api/_lib/http');
    const serverSupabase = await import('../api/_lib/server-supabase');
    vi.mocked(serverSupabase.requireSupabaseUser).mockRejectedValueOnce(
      new HttpError(401, 'Invalid or expired Supabase session'),
    );

    const { default: handler } = await import('../api/gemini-proxy');
    const response = await handler(geminiRequest());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Invalid or expired Supabase session');
  });

  it('returns rate-limit headers without calling Gemini when the user exceeds the window', async () => {
    checkRateLimit.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 15_000,
    });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { default: handler } = await import('../api/gemini-proxy');
    const response = await handler(geminiRequest());
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.error).toContain('Muitas chamadas de IA');
    expect(response.headers.get('retry-after')).toEqual(expect.any(String));
    expect(response.headers.get('x-ratelimit-remaining')).toBe('0');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects unsupported payload parts before calling Gemini', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { default: handler } = await import('../api/gemini-proxy');
    const response = await handler(
      new Request('http://localhost/api/gemini-proxy', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ fileData: { uri: 'gs://private' } }] }],
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Parte Gemini não suportada pelo proxy.');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
