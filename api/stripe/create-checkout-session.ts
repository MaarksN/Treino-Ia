import { handleApiError, json, readJsonObject, HttpError } from '../_lib/http';
import { requireSupabaseUser } from '../_lib/server-supabase';
import { getStripeClient } from '../_lib/stripe-client';
import { resolveCheckoutPlan } from '../_lib/billing';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return json({ ok: true });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return json({ error: 'Billing provider not configured', dataMode: 'not_configured' }, 400);
    }

    const user = await requireSupabaseUser(request);
    const body = await readJsonObject(request);
    const checkoutPlan = resolveCheckoutPlan(body.planId, body.interval);

    if (!checkoutPlan.planId || !checkoutPlan.interval) {
       throw new HttpError(400, 'planId invalid or missing, and interval required');
    }

    const stripe = getStripeClient();

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      allow_promotion_codes: true,
      line_items: [
         {
           price: checkoutPlan.priceId,
           quantity: 1,
         }
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

    return json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (error) {
    if ((error as any).status === 500 && (error as any).message?.includes('not configured')) {
        return json({ error: 'Billing provider not configured', dataMode: 'not_configured' }, 400);
    }
    return handleApiError(error);
  }
}
