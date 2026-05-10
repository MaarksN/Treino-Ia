import { HttpError } from './http';

export type BillingTier = 'free' | 'pro' | 'coach' | 'elite';
export type BillingInterval = 'month' | 'year';

export interface CheckoutPlan {
  planId: Exclude<BillingTier, 'free'>;
  interval: BillingInterval;
  priceId: string;
}

const PRICE_ENV_BY_PLAN: Record<Exclude<BillingTier, 'free'>, Record<BillingInterval, string>> = {
  pro: {
    month: 'STRIPE_PRICE_PRO_MONTHLY',
    year: 'STRIPE_PRICE_PRO_YEARLY',
  },
  coach: {
    month: 'STRIPE_PRICE_COACH_MONTHLY',
    year: 'STRIPE_PRICE_COACH_YEARLY',
  },
  elite: {
    month: 'STRIPE_PRICE_ELITE_MONTHLY',
    year: 'STRIPE_PRICE_ELITE_YEARLY',
  },
};

const ENTITLEMENTS_BY_PLAN: Record<BillingTier, string[]> = {
  free: ['workouts.basic', 'analytics.basic'],
  pro: [
    'workouts.basic',
    'analytics.basic',
    'workouts.unlimited',
    'ai.unlimited',
    'export.clean',
    'nutrition.ai',
  ],
  coach: [
    'workouts.basic',
    'analytics.basic',
    'workouts.unlimited',
    'ai.unlimited',
    'export.clean',
    'nutrition.ai',
    'coach.students',
    'coach.billing',
    'coach.notes',
  ],
  elite: [
    'workouts.basic',
    'analytics.basic',
    'workouts.unlimited',
    'ai.unlimited',
    'export.clean',
    'nutrition.ai',
    'coach.students',
    'coach.billing',
    'coach.notes',
    'wearables.advanced',
    'ai.priority',
    'reports.executive',
  ],
};

export function normalizeBillingPlan(planId: unknown, interval: unknown): {
  planId: BillingTier;
  interval: BillingInterval;
} {
  const rawPlan = typeof planId === 'string' ? planId : 'free';
  const rawInterval = typeof interval === 'string' ? interval : 'month';

  if (rawPlan === 'premium_monthly') {
    return { planId: 'pro', interval: 'month' };
  }

  if (rawPlan === 'premium_yearly') {
    return { planId: 'pro', interval: 'year' };
  }

  const normalizedPlan = ['free', 'pro', 'coach', 'elite'].includes(rawPlan)
    ? rawPlan as BillingTier
    : null;
  const normalizedInterval = rawInterval === 'year' ? 'year' : 'month';

  if (!normalizedPlan) {
    throw new HttpError(400, 'Unsupported billing plan');
  }

  return { planId: normalizedPlan, interval: normalizedInterval };
}

export function resolveCheckoutPlan(planId: unknown, interval: unknown): CheckoutPlan {
  const normalized = normalizeBillingPlan(planId, interval);

  if (normalized.planId === 'free') {
    throw new HttpError(400, 'Free plan does not create a Stripe Checkout Session');
  }

  const envName = PRICE_ENV_BY_PLAN[normalized.planId][normalized.interval];
  const priceId = process.env[envName];

  if (!priceId) {
    throw new HttpError(500, `${envName} is not configured`);
  }

  return {
    planId: normalized.planId,
    interval: normalized.interval,
    priceId,
  };
}

export function getEntitlementsForPlan(planId: BillingTier): string[] {
  return ENTITLEMENTS_BY_PLAN[planId] ?? ENTITLEMENTS_BY_PLAN.free;
}

export function getBillingMonth(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function isPaidStatus(status?: string | null): boolean {
  return status === 'active' || status === 'trialing';
}

