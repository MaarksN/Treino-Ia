import { BillingTier, getBillingMonth, getEntitlementsForPlan, isPaidStatus } from './billing';
import { getSupabaseAdmin } from './server-supabase';

interface SubscriptionRow {
  user_id: string;
  plan_id: BillingTier;
  status: string;
  interval: 'month' | 'year';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  trial_ends_at: string | null;
  cancel_at_period_end: boolean;
}

export async function getServerEntitlement(userId: string) {
  const supabase = getSupabaseAdmin();

  const { data: subscription, error: subscriptionError } = await supabase
    .from('billing_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<SubscriptionRow>();

  if (subscriptionError) {
    throw new Error(`Failed to load subscription: ${subscriptionError.message}`);
  }

  const paid = subscription && isPaidStatus(subscription.status);
  const planId = paid ? subscription.plan_id : 'free';
  const billingMonth = getBillingMonth();

  const { data: usage, error: usageError } = await supabase
    .from('billing_usage_counters')
    .upsert({
      user_id: userId,
      billing_month: billingMonth,
    }, { onConflict: 'user_id,billing_month' })
    .select('ai_requests, exports_count, prs_count, best_streak')
    .single();

  if (usageError) {
    throw new Error(`Failed to load usage counters: ${usageError.message}`);
  }

  return {
    planId,
    billingStatus: paid ? subscription.status : 'free',
    isPremium: paid,
    entitlements: getEntitlementsForPlan(planId),
    subscription: subscription ?? null,
    usage: {
      aiRequestsThisMonth: usage?.ai_requests ?? 0,
      exportsThisMonth: usage?.exports_count ?? 0,
      prCount: usage?.prs_count ?? 0,
      bestStreak: usage?.best_streak ?? 0,
    },
  };
}

export async function incrementUsageCounter(
  userId: string,
  field: 'ai_requests' | 'exports_count' | 'prs_count',
  amount = 1,
) {
  const supabase = getSupabaseAdmin();
  const billingMonth = getBillingMonth();
  const { data, error } = await supabase.rpc('increment_billing_usage', {
    p_user_id: userId,
    p_billing_month: billingMonth,
    p_field: field,
    p_amount: amount,
  });

  if (error) {
    throw new Error(`Failed to increment usage counter: ${error.message}`);
  }

  return data;
}
