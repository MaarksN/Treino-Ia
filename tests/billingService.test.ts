import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCheckoutSession, fetchBillingEntitlement } from '../src/services/billingService';
import { supabase } from '../src/services/supabaseClient';

vi.mock('../src/services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(),
        })),
      })),
    })),
  },
  isSupabaseConfigured: true,
}));

describe('billingService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-123' },
          access_token: 'supabase-token',
        },
      },
      error: null,
    } as any);
  });

  function getFetchHeaders(fetchMock: ReturnType<typeof vi.fn>, callIndex = 0): Headers {
    const init = fetchMock.mock.calls[callIndex]?.[1] as RequestInit | undefined;
    return new Headers(init?.headers);
  }

  it('busca entitlement no Supabase', async () => {
    const maybeSingleMock = vi.fn().mockResolvedValue({
      data: {
        status: 'active',
        plan_type: 'pro_monthly',
        stripe_subscription_id: 'sub_123',
      },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: maybeSingleMock,
        }),
      }),
    } as any);

    const entitlement = await fetchBillingEntitlement();
    expect(entitlement.isPro).toBe(true);
    expect(entitlement.planId).toBe('pro_monthly');
  });

  it('cria checkout Stripe sem estado premium local', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        checkoutUrl: 'https://checkout.stripe.com/c/session',
        sessionId: 'cs_test_123',
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const session = await createCheckoutSession('pro_monthly', 'month');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/stripe/create-checkout-session',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ planId: 'pro_monthly', interval: 'month' }),
      }),
    );
    const headers = getFetchHeaders(fetchMock);
    expect(headers.get('authorization')).toBe('Bearer supabase-token');
    expect(headers.get('content-type')).toBe('application/json');
    expect(session.checkoutUrl).toContain('checkout.stripe.com');
  });

  it('propaga BILLING_PROVIDER_NOT_CONFIGURED quando Stripe nao esta configurado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: 'BILLING_PROVIDER_NOT_CONFIGURED',
          dataMode: 'not_configured',
        }),
        { status: 503, headers: { 'content-type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(createCheckoutSession('pro_monthly', 'month')).rejects.toThrow(
      'BILLING_PROVIDER_NOT_CONFIGURED',
    );
  });
});
