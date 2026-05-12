import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api/_lib/server-supabase', () => ({
  requireSupabaseUser: vi.fn(),
  getSupabaseAdmin: vi.fn(),
}));

vi.mock('../api/_lib/stripe-client', () => ({
  BILLING_PROVIDER_NOT_CONFIGURED: 'BILLING_PROVIDER_NOT_CONFIGURED',
  getStripeClient: vi.fn(),
}));

describe('billing API handlers hardening', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it('returns BILLING_PROVIDER_NOT_CONFIGURED from checkout when Stripe secret is absent', async () => {
    const { default: handler } = await import('../api/stripe/create-checkout-session');

    const req = new Request('http://localhost/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ planId: 'pro', interval: 'month' }),
    });

    const res = await handler(req);
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error).toBe('BILLING_PROVIDER_NOT_CONFIGURED');
    expect(body.dataMode).toBe('not_configured');
  });

  it('rejects webhook without signature/secret', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    const { default: handler } = await import('../api/stripe/webhook');

    const req = new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: '{}',
    });

    const res = await handler(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('signature');
  });
});
