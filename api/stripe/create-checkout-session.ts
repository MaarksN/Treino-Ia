import {
  getTrustedRequestOrigin,
  handleApiError,
  json,
  readJsonObject,
  HttpError,
  guardApiMethod,
} from '../_lib/http';
import { requireSupabaseUser } from '../_lib/server-supabase';
import {
  billingProviderNotConfiguredResponse,
  getStripeClient,
  isBillingProviderConfigured,
  isBillingProviderNotConfiguredError,
} from '../_lib/stripe-client';
import { resolveCheckoutPlan } from '../_lib/billing';
import { JSON_BODY_LIMITS } from '../_lib/requestLimits';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(request: Request) {
  const methodResponse = guardApiMethod(request, 'POST');
  if (methodResponse) return methodResponse;

  try {
    if (!isBillingProviderConfigured()) {
      return billingProviderNotConfiguredResponse(request);
    }

    const user = await requireSupabaseUser(request);
    const body = await readJsonObject(request, { maxBytes: JSON_BODY_LIMITS.billingCheckout });
    const checkoutPlan = resolveCheckoutPlan(body.planId, body.interval);

    if (!checkoutPlan.planId || !checkoutPlan.interval) {
      throw new HttpError(400, 'planId invalid or missing, and interval required');
    }

    const stripe = getStripeClient();

    const origin = getTrustedRequestOrigin(request);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      allow_promotion_codes: true,
      line_items: [
        {
          price: checkoutPlan.priceId,
          quantity: 1,
        },
      ],
      customer_email: user.email,
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancel`,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        plan_id: checkoutPlan.planId,
        interval: checkoutPlan.interval,
      },
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_id: user.id,
          plan_id: checkoutPlan.planId,
          interval: checkoutPlan.interval,
        },
      },
    });

    return json({ checkoutUrl: session.url, sessionId: session.id }, 200, request);
  } catch (error) {
    if (isBillingProviderNotConfiguredError(error)) {
      return billingProviderNotConfiguredResponse(request);
    }
    return handleApiError(error, request);
  }
}
