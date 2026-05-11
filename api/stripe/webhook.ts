import { handleApiError, json, HttpError } from '../_lib/http';
import { getStripeClient } from '../_lib/stripe-client';
import { recordStripeWebhookEvent, upsertSubscriptionFromCheckoutSession, upsertSubscriptionFromStripeSubscription } from '../_lib/billing-store';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return json({ ok: true });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const signature = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret || !signature) {
      throw new HttpError(400, 'Webhook secret not configured or signature missing');
    }

    const stripe = getStripeClient();
    const payload = await request.text();

    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      throw new HttpError(400, `Webhook Error: ${err.message}`);
    }

    const isNew = await recordStripeWebhookEvent(event);
    if (!isNew) {
      return json({ received: true, ignored: true }); // already processed
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'subscription') {
          await upsertSubscriptionFromCheckoutSession(session as any);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await upsertSubscriptionFromStripeSubscription(subscription as any);
        break;
      }
      default:
        // Unhandled event type
        break;
    }

    return json({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}
