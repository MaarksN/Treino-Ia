import { BillingInterval, BillingTier } from '../types/billing';
import { supabase } from './supabaseClient';
import { trackEvent } from '../utils/analytics';
import { apiFetch } from '../utils/apiFetch';

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

function trackBillingError(operation: string, metadata: Record<string, unknown> = {}) {
  trackEvent('billing_error', {
    operation,
    ...metadata,
  });
}

async function getAccessToken(operation: string): Promise<string> {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    trackBillingError(operation, {
      stage: 'auth_session',
      hasSupabaseError: Boolean(error),
    });
    throw new Error('Faça login para acessar cobrança e recursos premium.');
  }

  return data.session.access_token;
}

async function parseApiResponse<T>(response: Response, operation: string): Promise<T> {
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const dataMode =
      body && typeof body === 'object' && 'dataMode' in body ? String(body.dataMode) : undefined;
    const message =
      body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
        ? body.error
        : 'Falha na API de billing.';
    trackBillingError(operation, {
      stage: 'api_response',
      status: response.status,
      dataMode,
    });
    throw new Error(message);
  }

  return body as T;
}

export async function fetchBillingEntitlement(): Promise<BillingEntitlementSummary> {
  const operation = 'fetch_billing_entitlement';
  const token = await getAccessToken(operation);
  const response = await apiFetch('/api/billing/entitlement', {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  return parseApiResponse<BillingEntitlementSummary>(response, operation);
}

export async function createCheckoutSession(planId: BillingTier, interval: BillingInterval) {
  const operation = 'create_checkout_session';
  const token = await getAccessToken(operation);
  const response = await apiFetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ planId, interval }),
  });

  return parseApiResponse<{ checkoutUrl: string; sessionId: string }>(response, operation);
}

export async function createBillingPortalSession() {
  const operation = 'create_billing_portal_session';
  const token = await getAccessToken(operation);
  const response = await apiFetch('/api/stripe/create-portal-session', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  return parseApiResponse<{ portalUrl: string }>(response, operation);
}

export function hasBillingEntitlement(
  entitlement: BillingEntitlementSummary | null,
  required: string,
): boolean {
  return Boolean(entitlement?.entitlements.includes(required));
}
