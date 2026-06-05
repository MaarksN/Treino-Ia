import { getTrustedRequestOrigin, guardApiMethod, handleApiError, json } from '../_lib/http';
import { requireSupabaseUser, getSupabaseAdmin } from '../_lib/server-supabase';
import {
  billingProviderNotConfiguredResponse,
  getStripeClient,
  isBillingProviderConfigured,
  isBillingProviderNotConfiguredError,
} from '../_lib/stripe-client';

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

    const supabase = getSupabaseAdmin();
    const { data: sub } = await supabase
      .from('billing_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!sub?.stripe_customer_id) {
      return json({ error: 'Nenhum cliente Stripe associado a este usuário.' }, 400, request);
    }

    const stripe = getStripeClient();
    const origin = getTrustedRequestOrigin(request);

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${origin}/`,
    });

    return json({ portalUrl: session.url }, 200, request);
  } catch (error) {
    if (isBillingProviderNotConfiguredError(error)) {
      return billingProviderNotConfiguredResponse(request);
    }
    return handleApiError(error, request);
  }
}
