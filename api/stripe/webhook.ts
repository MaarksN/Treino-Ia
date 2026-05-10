import Stripe from 'stripe';
import {
  recordStripeWebhookEvent,
  upsertSubscriptionFromCheckoutSession,
  upsertSubscriptionFromStripeSubscription,
} from '../_lib/billing-store';
import { handleApiError, HttpError, json, requireEnv } from '../_lib/http';
import { getStripeClient } from '../_lib/stripe-client';

export const config = {
  runtime: 'nodejs',
};

async function syncInvoiceSubscription(invoice: Stripe.Invoice) {
  const invoiceWithSubscription = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
  };

  const subscriptionId =
    typeof invoiceWithSubscription.subscription === 'string'
      ? invoiceWithSubscription.subscription
      : invoiceWithSubscription.subscription?.id;

  if (!subscriptionId) return;

  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await upsertSubscriptionFromStripeSubscription(subscription);
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const stripe = getStripeClient();
    const webhookSecret = requireEnv('STRIPE_WEBHOOK_SECRET');
    const signature = request.headers.get('stripe-signature');
    const payload = await request.text();

    if (!signature) {
      throw new HttpError(400, 'Missing Stripe-Signature header');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch {
      throw new HttpError(400, 'Invalid Stripe webhook signature');
    }

    const firstDelivery = await recordStripeWebhookEvent(event);

    if (!firstDelivery) {
      return json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await upsertSubscriptionFromCheckoutSession(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed':
        await upsertSubscriptionFromStripeSubscription(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        await syncInvoiceSubscription(event.data.object as Stripe.Invoice);
        break;

      default:
        break;
    }

    return json({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}
