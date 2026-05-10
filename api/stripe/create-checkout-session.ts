import { resolveCheckoutPlan } from '../_lib/billing';
import { handleApiError, json, readJsonObject } from '../_lib/http';
import { requireSupabaseUser } from '../_lib/server-supabase';
import { getStripeClient } from '../_lib/stripe-client';

export const config = {
  runtime: 'nodejs',
};

function getBaseUrl(request: Request): string {
  const configured = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, '');

  const origin = request.headers.get('origin');
  if (origin) return origin.replace(/\/$/, '');

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  throw new Error('APP_URL is not configured and request origin is unavailable');
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return json({ ok: true });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const user = await requireSupabaseUser(request);
    const body = await readJsonObject(request);
    const plan = resolveCheckoutPlan(body.planId, body.interval);
    const stripe = getStripeClient();
    const baseUrl = getBaseUrl(request);
    const metadata = {
      user_id: user.id,
      plan_id: plan.planId,
      interval: plan.interval,
    };

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      allow_promotion_codes: true,
      metadata,
      subscription_data: {
        metadata,
      },
      success_url: `${baseUrl}/?billing=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?billing=cancelled`,
    });

    if (!session.url) {
      throw new Error('Stripe did not return a Checkout URL');
    }

    return json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

