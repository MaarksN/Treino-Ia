import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/_lib/server-supabase', () => ({
  requireSupabaseUser: vi.fn().mockResolvedValue({ id: 'user-1' }),
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
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"error":"bad payload"}', {
      status: 400,
      headers: { 'content-type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);

    const { default: handler } = await import('../api/gemini-proxy');
    const response = await handler(geminiRequest());
    const body = await response.json();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(400);
    expect(body.error).toBe('Gemini request was rejected.');
  });
});
