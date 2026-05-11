import { handleApiError, json, readJsonObject, HttpError } from '../_lib/http';
import { requireSupabaseUser } from '../_lib/server-supabase';
import { getStripeClient } from '../_lib/stripe-client';

export const config = {
  runtime: 'nodejs',
};

// Hardcoded map for example purposes. In production this would be mapped to Stripe price IDs from env or DB
const STRIPE_PRICE_MAP: Record<string, { month: number; year: number }> = {
  pro: { month: 2990, year: 21528 },
  coach: { month: 7990, year: 57528 },
  elite: { month: 14990, year: 107928 },
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
    const planId = body.planId as string;
    const interval = body.interval as string;

    if (!planId || !interval || !STRIPE_PRICE_MAP[planId]) {
       throw new HttpError(400, 'planId invalid or missing, and interval required');
    }

    const stripe = getStripeClient();

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const amount = interval === 'year' ? STRIPE_PRICE_MAP[planId].year : STRIPE_PRICE_MAP[planId].month;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
         {
           price_data: {
              currency: 'BRL',
              product_data: { name: `Plano ${planId.toUpperCase()} (${interval === 'year' ? 'Anual' : 'Mensal'})` },
              unit_amount: amount,
              recurring: { interval: interval === 'year' ? 'year' : 'month' }
           },
           quantity: 1,
         }
      ],
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancel`,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        plan_id: planId,
        interval: interval
      }
    });

    return json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (error) {
    if ((error as any).status === 500 && (error as any).message?.includes('not configured')) {
        return json({ error: 'Billing provider not configured', dataMode: 'not_configured' }, 400);
    }
    return handleApiError(error);
  }
}
