import Stripe from 'stripe';
import { describe, expect, it } from 'vitest';
import { minimizeStripeWebhookPayload } from './stripe-webhook-payload';

function buildEvent(object: Record<string, unknown>, overrides: Record<string, unknown> = {}): Stripe.Event {
  return {
    id: 'evt_123',
    object: 'event',
    api_version: '2024-06-20',
    created: 1_735_689_600,
    data: {
      object,
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: 'req_123',
      idempotency_key: 'idem_should_not_persist',
    },
    type: 'customer.subscription.updated',
    ...overrides,
  } as unknown as Stripe.Event;
}

describe('minimizeStripeWebhookPayload', () => {
  it('keeps event audit fields and subscription object identifiers', () => {
    const payload = minimizeStripeWebhookPayload(buildEvent({
      id: 'sub_123',
      object: 'subscription',
      customer: { id: 'cus_123', email: 'customer@example.com' },
      status: 'active',
      currency: 'brl',
      items: {
        data: [{
          price: {
            id: 'price_123',
            product: { id: 'prod_123', name: 'Sensitive product label' },
          },
        }],
      },
      metadata: {
        user_id: 'user-1',
        email: 'customer@example.com',
      },
    }));

    expect(payload).toEqual({
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
        currency: 'brl',
      },
    });
  });

  it('keeps checkout session subscription, amount and currency without free metadata', () => {
    const payload = minimizeStripeWebhookPayload(buildEvent({
      id: 'cs_123',
      object: 'checkout.session',
      customer: 'cus_123',
      subscription: 'sub_123',
      payment_status: 'paid',
      amount_total: 9900,
      currency: 'brl',
      customer_email: 'customer@example.com',
      client_secret: 'secret_should_not_persist',
      metadata: {
        user_id: 'user-1',
        arbitrary: 'free-form metadata',
      },
    }, {
      type: 'checkout.session.completed',
    }));

    expect(payload.object).toEqual({
      id: 'cs_123',
      object: 'checkout.session',
      customer: 'cus_123',
      subscription: 'sub_123',
      status: 'paid',
      amount: 9900,
      currency: 'brl',
    });
  });

  it('does not include sensitive Stripe, customer or request details', () => {
    const payload = minimizeStripeWebhookPayload(buildEvent({
      id: 'pi_123',
      object: 'payment_intent',
      amount: 5000,
      currency: 'brl',
      customer: {
        id: 'cus_123',
        email: 'customer@example.com',
        name: 'Customer Name',
        phone: '+55 11 99999-0000',
        address: {
          line1: 'Sensitive Street',
        },
      },
      billing_details: {
        email: 'billing@example.com',
      },
      payment_method_details: {
        card: {
          last4: '4242',
        },
      },
      client_secret: 'pi_secret_should_not_persist',
      receipt_url: 'https://pay.stripe.com/receipt/sensitive',
      metadata: {
        freeform: 'do not persist',
        email: 'metadata@example.com',
      },
      lines: {
        data: [{
          description: 'full invoice line should not persist',
          price: {
            id: 'price_123',
            product: 'prod_123',
          },
        }],
      },
    }, {
      headers: {
        'stripe-signature': 'sig_should_not_persist',
      },
      rawBody: '{"secret":"raw"}',
    }));

    const serialized = JSON.stringify(payload);

    expect(serialized).not.toContain('customer@example.com');
    expect(serialized).not.toContain('billing@example.com');
    expect(serialized).not.toContain('metadata@example.com');
    expect(serialized).not.toContain('metadata');
    expect(serialized).not.toContain('billing_details');
    expect(serialized).not.toContain('payment_method_details');
    expect(serialized).not.toContain('client_secret');
    expect(serialized).not.toContain('pi_secret_should_not_persist');
    expect(serialized).not.toContain('receipt_url');
    expect(serialized).not.toContain('full invoice line');
    expect(serialized).not.toContain('stripe-signature');
    expect(serialized).not.toContain('sig_should_not_persist');
    expect(serialized).not.toContain('rawBody');
    expect(serialized).not.toContain('idem_should_not_persist');
  });

  it('does not mutate the original event used for in-memory subscription processing', () => {
    const subscription = {
      id: 'sub_123',
      object: 'subscription',
      customer: 'cus_123',
      status: 'active',
      metadata: {
        user_id: 'user-1',
        plan_id: 'pro',
        interval: 'month',
      },
    };
    const event = buildEvent(subscription);

    minimizeStripeWebhookPayload(event);

    expect(event.data.object).toEqual(subscription);
  });

  it('handles unknown event objects without storing raw fields', () => {
    const payload = minimizeStripeWebhookPayload(buildEvent({
      object: 'unknown',
      metadata: {
        email: 'unknown@example.com',
      },
    }, {
      id: 'evt_unknown',
      type: 'future.event',
    }));

    expect(payload.id).toBe('evt_unknown');
    expect(payload.type).toBe('future.event');
    expect(payload.object).toEqual({ object: 'unknown' });
    expect(JSON.stringify(payload)).not.toContain('unknown@example.com');
  });
});
