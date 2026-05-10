import { handleApiError, HttpError, json } from '../_lib/http';
import { getSupabaseAdmin, requireSupabaseUser } from '../_lib/server-supabase';
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

  throw new HttpError(500, 'APP_URL is not configured and request origin is unavailable');
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return json({ ok: true });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const user = await requireSupabaseUser(request);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('billing_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load Stripe customer: ${error.message}`);
    }

    if (!data?.stripe_customer_id) {
      throw new HttpError(404, 'No Stripe customer is linked to this user');
    }

    const stripe = getStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${getBaseUrl(request)}/?billing=portal_return`,
    });

    return json({ portalUrl: session.url });
  } catch (error) {
    return handleApiError(error);
  }
}

