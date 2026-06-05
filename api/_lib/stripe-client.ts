import Stripe from 'stripe';
import { HttpError, json, requireEnv } from './http';

let stripeClient: Stripe | null = null;

export const BILLING_PROVIDER_NOT_CONFIGURED = 'BILLING_PROVIDER_NOT_CONFIGURED';

export function isBillingProviderConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function assertBillingProviderConfigured() {
  if (!isBillingProviderConfigured()) {
    throw new HttpError(503, BILLING_PROVIDER_NOT_CONFIGURED);
  }
}

export function billingProviderNotConfiguredResponse(request: Request) {
  return json({ error: BILLING_PROVIDER_NOT_CONFIGURED, dataMode: 'not_configured' }, 503, request);
}

export function isBillingProviderNotConfiguredError(error: unknown): boolean {
  return (error as { message?: unknown })?.message === BILLING_PROVIDER_NOT_CONFIGURED;
}

export function getStripeClient(): Stripe {
  if (stripeClient) return stripeClient;

  assertBillingProviderConfigured();

  stripeClient = new Stripe(requireEnv('STRIPE_SECRET_KEY'), {
    appInfo: {
      name: 'Treino IA',
      version: '1.0.0',
    },
    maxNetworkRetries: 2,
  });

  return stripeClient;
}
