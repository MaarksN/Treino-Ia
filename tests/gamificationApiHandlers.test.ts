import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireSupabaseUser = vi.fn();
const getSupabaseAdmin = vi.fn();

vi.mock('../api/_lib/server-supabase', () => ({
  requireSupabaseUser,
  getSupabaseAdmin,
}));

function createSupabaseMock(overrides: Record<string, unknown> = {}) {
  const profileBuilder = {
    upsert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { last_login_at: null, last_checkin_at: null, login_streak: 0, coins: 100 },
      error: null,
    }),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
  };

  const ledgerBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  };

  const missionsBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'm1', status: 'completed', xp_reward: 30, coin_reward: 5 }, error: null }),
    update: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
  };

  const cosmeticsBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn().mockResolvedValue({ error: null }),
  };

  const from = vi.fn((table: string) => {
    if (table === 'gamification_profiles') return profileBuilder;
    if (table === 'gamification_ledger') return ledgerBuilder;
    if (table === 'gamification_missions') return missionsBuilder;
    if (table === 'gamification_cosmetics') return cosmeticsBuilder;
    throw new Error(`Unexpected table ${table}`);
  });

  const mock = {
    from,
    rpc: vi.fn().mockResolvedValue({ data: { xp: 10, coins: 10 }, error: null }),
    ...overrides,
  };

  return { mock, profileBuilder, missionsBuilder, cosmeticsBuilder, ledgerBuilder };
}

describe('gamification event API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    requireSupabaseUser.mockResolvedValue({ id: 'user-1' });
  });

  it('rejects unknown events', async () => {
    const { mock } = createSupabaseMock();
    getSupabaseAdmin.mockReturnValue(mock);
    const { default: handler } = await import('../api/gamification/event');
    const req = new Request('http://localhost/api/gamification/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ eventType: 'hacked' }) });
    const res = await handler(req);
    expect(res.status).toBe(400);
  });

  it('enforces mission claim idempotency when already claimed', async () => {
    const { mock, missionsBuilder } = createSupabaseMock();
    missionsBuilder.maybeSingle.mockResolvedValue({ data: { id: 'm1', status: 'claimed', xp_reward: 30, coin_reward: 5 }, error: null });
    getSupabaseAdmin.mockReturnValue(mock);
    const { default: handler } = await import('../api/gamification/event');
    const req = new Request('http://localhost/api/gamification/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ eventType: 'mission_claimed', sourceId: 'm1' }) });
    const res = await handler(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.skipped).toBe(true);
  });

  it('blocks cosmetic purchase with insufficient balance', async () => {
    const { mock, profileBuilder } = createSupabaseMock();
    profileBuilder.single.mockResolvedValue({ data: { last_login_at: null, last_checkin_at: null, login_streak: 0, coins: 5 }, error: null });
    getSupabaseAdmin.mockReturnValue(mock);
    const { default: handler } = await import('../api/gamification/event');
    const req = new Request('http://localhost/api/gamification/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ eventType: 'cosmetic_purchased', sourceId: 'skin-1', cost: 50 }) });
    const res = await handler(req);
    expect(res.status).toBe(409);
  });
});
