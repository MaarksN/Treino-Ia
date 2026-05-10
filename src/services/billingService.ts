import { BillingInterval, BillingTier } from '../types/billing';
import { supabase } from './supabaseClient';

export interface BillingUsageSummary {
  aiRequestsThisMonth: number;
  exportsThisMonth: number;
  prCount: number;
  bestStreak: number;
}

export interface BillingEntitlementSummary {
  planId: BillingTier;
  billingStatus: string;
  isPremium: boolean;
  entitlements: string[];
  usage: BillingUsageSummary;
  subscription: {
    current_period_end?: string | null;
    trial_ends_at?: string | null;
    cancel_at_period_end?: boolean | null;
  } | null;
}

async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    throw new Error('Faça login para acessar cobrança e recursos premium.');
  }

  return data.session.access_token;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
        ? body.error
        : 'Falha na API de billing.';
    throw new Error(message);
  }

  return body as T;
}

export async function fetchBillingEntitlement(): Promise<BillingEntitlementSummary> {
  const token = await getAccessToken();
  const response = await fetch('/api/billing/entitlement', {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  return parseApiResponse<BillingEntitlementSummary>(response);
}

export async function createCheckoutSession(planId: BillingTier, interval: BillingInterval) {
  const token = await getAccessToken();
  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ planId, interval }),
  });

  return parseApiResponse<{ checkoutUrl: string; sessionId: string }>(response);
}

export async function createBillingPortalSession() {
  const token = await getAccessToken();
  const response = await fetch('/api/stripe/create-portal-session', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  return parseApiResponse<{ portalUrl: string }>(response);
}

export function hasBillingEntitlement(
  entitlement: BillingEntitlementSummary | null,
  required: string,
): boolean {
  return Boolean(entitlement?.entitlements.includes(required));
}

