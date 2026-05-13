import { describe, expect, it, vi } from 'vitest';

vi.mock('../api/_lib/server-supabase', () => ({
  requireSupabaseUser: vi.fn(),
  getSupabaseAdmin: vi.fn(),
}));

describe('sensitive API auth error standardization', () => {
  it('returns 401 on gamification state without auth', async () => {
    const mod = await import('../api/_lib/server-supabase');
    const http = await import('../api/_lib/http');
    vi.mocked(mod.requireSupabaseUser).mockRejectedValueOnce(new http.HttpError(401, 'Unauthorized'));
    const { default: handler } = await import('../api/gamification/state');
    const res = await handler(new Request('http://localhost/api/gamification/state', { method: 'GET' }));
    expect(res.status).toBe(401);
  });

  it('returns 401 on gamification event without auth', async () => {
    const mod = await import('../api/_lib/server-supabase');
    const http = await import('../api/_lib/http');
    vi.mocked(mod.requireSupabaseUser).mockRejectedValueOnce(new http.HttpError(401, 'Unauthorized'));
    const { default: handler } = await import('../api/gamification/event');
    const res = await handler(new Request('http://localhost/api/gamification/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ eventType: 'checkin' }) }));
    expect(res.status).toBe(401);
  });

  it('returns 401 on gemini proxy without auth', async () => {
    process.env.GEMINI_API_KEY = 'test';
    const mod = await import('../api/_lib/server-supabase');
    const http = await import('../api/_lib/http');
    vi.mocked(mod.requireSupabaseUser).mockRejectedValueOnce(new http.HttpError(401, 'Unauthorized'));
    const { default: handler } = await import('../api/gemini-proxy');
    const res = await handler(new Request('http://localhost/api/gemini-proxy', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'oi' }] }] }) }));
    expect(res.status).toBe(401);
  });
});
