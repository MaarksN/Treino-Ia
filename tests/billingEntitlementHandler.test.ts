import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/_lib/server-supabase', () => ({
  requireSupabaseUser: vi.fn().mockResolvedValue({ id: 'user-1' }),
}));

describe('billing entitlement handler fail-safe', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it('returns free + not_configured when backend is not configured', async () => {
    const { default: handler } = await import('../api/billing/entitlement');
    const req = new Request('http://localhost/api/billing/entitlement', { method: 'GET' });
    const res = await handler(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.planId).toBe('free');
    expect(body.isPremium).toBe(false);
    expect(body.dataMode).toBe('not_configured');
  });
});
