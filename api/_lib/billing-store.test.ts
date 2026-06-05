import Stripe from 'stripe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  recordStripeWebhookEvent,
  upsertSubscriptionFromStripeSubscription,
} from './billing-store';
import { getSupabaseAdmin } from './server-supabase';

vi.mock('./server-supabase', () => ({
  getSupabaseAdmin: vi.fn(),
}));

function buildEvent(): Stripe.Event {
  return {
    id: 'evt_123',
    object: 'event',
    api_version: '2024-06-20',
    created: 1_735_689_600,
    data: {
      object: {
        id: 'sub_123',
        object: 'subscription',
        customer: {
          id: 'cus_123',
          email: 'customer@example.com',
        },
        status: 'active',
        metadata: {
          user_id: 'user-1',
          plan_id: 'pro',
          email: 'metadata@example.com',
        },
        items: {
          data: [
            {
              price: {
                id: 'price_123',
                product: 'prod_123',
              },
            },
          ],
        },
      },
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: 'req_123',
      idempotency_key: 'idem_should_not_persist',
    },
    type: 'customer.subscription.updated',
  } as unknown as Stripe.Event;
}

function buildSupabaseMock(insertResult: unknown = { error: null }) {
  const insert = vi.fn().mockResolvedValue(insertResult);
  const upsert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn((table: string) => ({
    insert,
    upsert,
    table,
  }));

  vi.mocked(getSupabaseAdmin).mockReturnValue({
    from,
  } as unknown as ReturnType<typeof getSupabaseAdmin>);

  return { from, insert, upsert };
}

describe('billing-store Stripe webhook recording', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('persists a minimized webhook payload instead of the raw Stripe event', async () => {
    const { insert } = buildSupabaseMock();

    await expect(recordStripeWebhookEvent(buildEvent())).resolves.toBe(true);

    expect(insert).toHaveBeenCalledWith({
      id: 'evt_123',
      type: 'customer.subscription.updated',
      stripe_created_at: '2025-01-01T00:00:00.000Z',
      processed_at: expect.any(String),
      payload: {
        id: 'evt_123',
        type: 'customer.subscription.updated',
        apiVersion: '2024-06-20',
        created: 1_735_689_600,
        livemode: false,
        pendingWebhooks: 1,
        requestId: 'req_123',
        object: {
          id: 'sub_123',
          object: 'subscription',
          customer: 'cus_123',
          status: 'active',
          priceId: 'price_123',
          productId: 'prod_123',
        },
      },
    });

    const insertedPayload = insert.mock.calls[0][0].payload;
    const serialized = JSON.stringify(insertedPayload);

    expect(serialized).not.toContain('customer@example.com');
    expect(serialized).not.toContain('metadata@example.com');
    expect(serialized).not.toContain('metadata');
    expect(serialized).not.toContain('idempotency');
  });

  it('keeps deduplication based on Stripe event id', async () => {
    buildSupabaseMock({
      error: {
        code: '23505',
        message: 'duplicate key value violates unique constraint',
      },
    });

    await expect(recordStripeWebhookEvent(buildEvent())).resolves.toBe(false);
  });

  it('continues subscription updates from the original in-memory event object', async () => {
    const { upsert } = buildSupabaseMock();
    const subscription = {
      id: 'sub_123',
      object: 'subscription',
      customer: 'cus_123',
      status: 'active',
      metadata: {
        user_id: 'user-1',
        plan_id: 'pro',
        interval: 'month',
        email: 'metadata@example.com',
      },
      current_period_end: 1_735_776_000,
      trial_end: null,
      cancel_at_period_end: false,
    } as unknown as Stripe.Subscription;

    await upsertSubscriptionFromStripeSubscription(subscription);

    expect(upsert).toHaveBeenCalledWith(
      {
        user_id: 'user-1',
        plan_id: 'pro',
        status: 'active',
        interval: 'month',
        stripe_customer_id: 'cus_123',
        stripe_subscription_id: 'sub_123',
        current_period_end: '2025-01-02T00:00:00.000Z',
        trial_ends_at: null,
        cancel_at_period_end: false,
        updated_at: expect.any(String),
      },
      { onConflict: 'user_id' },
    );
  });
});
