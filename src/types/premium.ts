export type SubscriptionPlanId = 'free' | 'premium_monthly' | 'premium_yearly';

export type PremiumFeature =
  | 'premium_theme'
  | 'export_data'
  | 'unlimited_ai'
  | 'wearable_sync'
  | 'pose_detection'
  | 'premium_community'
  | 'exclusive_badge'
  | 'advanced_analytics'
  | 'priority_coach'
  | 'periodization_lab';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  subtitle: string;
  price: number;
  billing: 'none' | 'month' | 'year';
  features: string[];
  unlockedFeatures: PremiumFeature[];
  highlighted?: boolean;
  badge?: string;
}

export interface PremiumCoupon {
  code: string;
  label: string;
  discountPercent: number;
  durationMonths: number;
  validUntil?: number;
}

export interface EntitlementState {
  planId: SubscriptionPlanId;
  billingStatus: 'free' | 'trialing' | 'active' | 'canceled';
  isPremium: boolean;
  unlockedFeatures: PremiumFeature[];
  usage: {
    aiRequestsThisMonth: number;
    exportsThisMonth: number;
    prCount: number;
    bestStreak: number;
    lastUsageResetAt: number;
  };
  activeCoupon?: string;
  currentPeriodEnd?: number;
  trialStartedAt?: number;
  trialEndsAt?: number;
  prPaywallShownAt?: number;
  streakPaywallShownAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface PaywallTrigger {
  source: string;
  feature?: PremiumFeature;
  title?: string;
  description?: string;
}
