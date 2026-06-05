import Stripe from 'stripe';

export function buildStripeEvent(
  object: Record<string, unknown>,
  overrides: Record<string, unknown> = {},
): Stripe.Event {
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
