import Stripe from 'stripe';
import { BillingInterval, BillingTier } from './billing';
import { HttpError } from './http';
import { getSupabaseAdmin } from './server-supabase';
import { getStripeClient } from './stripe-client';

interface SubscriptionRow {
  user_id: string;
  plan_id: BillingTier;
  status: string;
  interval: BillingInterval;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  trial_ends_at: string | null;
  cancel_at_period_end: boolean;
}

function secondsToIso(value?: number | null): string | null {
  return typeof value === 'number' ? new Date(value * 1000).toISOString() : null;
}

function getStripeId(value: string | { id: string } | null): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): number | null {
  const withPeriod = subscription as Stripe.Subscription & {
    current_period_end?: number | null;
  };

  return withPeriod.current_period_end ?? null;
}

function readPlanFromMetadata(metadata?: Stripe.Metadata | null): {
  planId: BillingTier;
  interval: BillingInterval;
} {
  const planId = metadata?.plan_id;
  const interval = metadata?.interval;

  if (planId !== 'pro' && planId !== 'coach' && planId !== 'elite') {
    throw new HttpError(400, 'Stripe object is missing supported plan metadata');
  }

  return {
    planId,
    interval: interval === 'year' ? 'year' : 'month',
  };
}

async function findUserIdForStripeSubscription(subscription: Stripe.Subscription): Promise<string> {
  if (subscription.metadata?.user_id) {
    return subscription.metadata.user_id;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('billing_subscriptions')
    .select('user_id')
    .or(`stripe_subscription_id.eq.${subscription.id},stripe_customer_id.eq.${getStripeId(subscription.customer)}`)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to lookup subscription owner: ${error.message}`);
  }

  if (!data?.user_id) {
    throw new HttpError(400, 'Unable to resolve subscription owner');
  }

  return data.user_id;
}

export async function upsertSubscriptionFromStripeSubscription(subscription: Stripe.Subscription) {
  const supabase = getSupabaseAdmin();
  const userId = await findUserIdForStripeSubscription(subscription);
  const { planId, interval } = readPlanFromMetadata(subscription.metadata);

  const row = {
    user_id: userId,
    plan_id: planId,
    status: subscription.status,
    interval,
    stripe_customer_id: getStripeId(subscription.customer),
    stripe_subscription_id: subscription.id,
    current_period_end: secondsToIso(getSubscriptionPeriodEnd(subscription)),
    trial_ends_at: secondsToIso(subscription.trial_end),
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('billing_subscriptions')
    .upsert(row, { onConflict: 'user_id' });

  if (error) {
    throw new Error(`Failed to persist subscription: ${error.message}`);
  }
}

export async function upsertSubscriptionFromCheckoutSession(session: Stripe.Checkout.Session) {
  const subscriptionId = getStripeId(session.subscription as string | Stripe.Subscription | null);
  const userId = session.metadata?.user_id || session.client_reference_id;

  if (!subscriptionId) {
    throw new HttpError(400, 'Checkout Session has no subscription id');
  }

  if (!userId) {
    throw new HttpError(400, 'Checkout Session has no user metadata');
  }

  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  if (!subscription.metadata?.user_id) {
    subscription.metadata.user_id = userId;
  }

  await upsertSubscriptionFromStripeSubscription(subscription);
}

export async function recordStripeWebhookEvent(event: Stripe.Event): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('stripe_webhook_events')
    .insert({
      id: event.id,
      type: event.type,
      stripe_created_at: secondsToIso(event.created),
      payload: event as unknown as Record<string, unknown>,
      processed_at: new Date().toISOString(),
    });

  if (!error) return true;

  if (error.code === '23505') {
    return false;
  }

  throw new Error(`Failed to record Stripe webhook event: ${error.message}`);
}

