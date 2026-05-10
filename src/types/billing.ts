export type BillingTier = 'free' | 'pro' | 'coach' | 'elite';

export type BillingInterval = 'month' | 'year';

export interface BillingPlan {
  id: BillingTier;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  planLimit: number | 'unlimited';
  aiRequests: number | 'unlimited';
  coachSeats: number;
  features: string[];
  entitlements: string[];
}

export interface BillingSubscription {
  tier: BillingTier;
  status: 'free' | 'trialing' | 'active' | 'past_due' | 'canceled';
  interval: BillingInterval;
  trialEndsAt?: number;
  currentPeriodEnd?: number;
  couponCode?: string;
}

export interface InvoiceRecord {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'open' | 'void';
  downloadUrl?: string;
}
