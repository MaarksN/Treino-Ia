import { guardApiMethod, handleApiError, json } from '../_lib/http';
import { getStripeClient } from '../_lib/stripe-client';
import { getSupabaseAdmin } from '../_lib/server-supabase';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(request: Request) {
  const methodResponse = guardApiMethod(request, 'POST');
  if (methodResponse) return methodResponse;

  const stripe = getStripeClient();
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return json({ error: 'Webhook secret or signature missing' }, 400);
  }

  try {
    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const userId = session.client_reference_id || session.metadata?.user_id;

      if (userId) {
        const supabase = getSupabaseAdmin();
        await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: session.customer,
            status: 'active',
            plan_type: session.metadata?.plan_id || 'pro_monthly',
            updated_at: new Date().toISOString(),
          });
      }
    }

    return json({ received: true }, 200);
  } catch (error) {
    return handleApiError(error, request);
  }
}
