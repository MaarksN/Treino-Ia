import { handleApiError, json, requireEnv } from '../_lib/http';
import { requireSupabaseUser, getSupabaseAdmin } from '../_lib/server-supabase';
import { getStripeClient } from '../_lib/stripe-client';

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

    const supabase = getSupabaseAdmin();
    const { data: sub } = await supabase
        .from('billing_subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (!sub?.stripe_customer_id) {
       return json({ error: 'Nenhum cliente Stripe associado a este usuário.' }, 400);
    }

    const stripe = getStripeClient();
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${origin}/`,
    });

    return json({ portalUrl: session.url });
  } catch (error) {
    if ((error as any).status === 500 && (error as any).message?.includes('not configured')) {
        return json({ error: 'Billing provider not configured', dataMode: 'not_configured' }, 400);
    }
    return handleApiError(error);
  }
}
