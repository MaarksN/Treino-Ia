import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createCheckoutSession,
  fetchBillingEntitlement,
} from '../src/services/billingService';
import { supabase } from '../src/services/supabaseClient';

vi.mock('../src/services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

describe('billingService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          access_token: 'supabase-token',
        },
      },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>);
  });

  it('busca entitlement com token Supabase', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        planId: 'free',
        billingStatus: 'free',
        isPremium: false,
        entitlements: ['workouts.basic'],
        usage: {
          aiRequestsThisMonth: 0,
          exportsThisMonth: 0,
          prCount: 0,
          bestStreak: 0,
        },
        subscription: null,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const entitlement = await fetchBillingEntitlement();

    expect(fetchMock).toHaveBeenCalledWith('/api/billing/entitlement', {
      headers: {
        authorization: 'Bearer supabase-token',
      },
    });
    expect(entitlement.planId).toBe('free');
  });

  it('cria checkout Stripe sem estado premium local', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        checkoutUrl: 'https://checkout.stripe.com/c/session',
        sessionId: 'cs_test_123',
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const session = await createCheckoutSession('pro', 'month');

    expect(fetchMock).toHaveBeenCalledWith('/api/stripe/create-checkout-session', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        authorization: 'Bearer supabase-token',
        'content-type': 'application/json',
      }),
      body: JSON.stringify({ planId: 'pro', interval: 'month' }),
    }));
    expect(session.checkoutUrl).toContain('checkout.stripe.com');
  });
});

