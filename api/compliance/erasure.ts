import { handleApiError, json, getBearerToken } from '../_lib/http';
import { getSupabaseAdmin } from '../_lib/server-supabase';
import { getServerEntitlement } from '../_lib/billing-entitlements';
import { getStripeClient } from '../_lib/stripe-client';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return json({ ok: true }, 200, request);
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, request);

  try {
    const token = getBearerToken(request);
    const supabase = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      return json({ error: 'Unauthorized' }, 401, request);
    }
    const userId = authData.user.id;

    // First try cancelling stripe subscription if it exists
    try {
      const entitlement = await getServerEntitlement(userId);
      if (entitlement?.subscription?.stripe_subscription_id) {
        const stripe = getStripeClient();
        await stripe.subscriptions.cancel(entitlement.subscription.stripe_subscription_id);
      }
    } catch (err) {
      console.error('Compliance: failed to clear stripe sub', err);
      // Proceed with erasure anyway as compliance rules right to be forgotten
    }

    // Since RLS relies on user_id, Supabase cascading deletes will wipe standard data.
    // We physically delete the Auth User which cascades to auth.users references (like ai_decision_audits, profiles, workout_sessions).
    const { error: deletionError } = await supabase.auth.admin.deleteUser(userId);

    if (deletionError) {
      return json({ error: 'Failed to erase data physically' }, 500, request);
    }

    return json({ success: true, message: 'User data permanently erased' }, 200, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
