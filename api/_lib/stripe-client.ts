import Stripe from 'stripe';
import { HttpError, requireEnv } from './http';

let stripeClient: Stripe | null = null;

export const BILLING_PROVIDER_NOT_CONFIGURED = 'BILLING_PROVIDER_NOT_CONFIGURED';

export function getStripeClient(): Stripe {
  if (stripeClient) return stripeClient;

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new HttpError(503, BILLING_PROVIDER_NOT_CONFIGURED);
  }

  stripeClient = new Stripe(requireEnv('STRIPE_SECRET_KEY'), {
    appInfo: {
      name: 'Treino IA',
      version: '1.0.0',
    },
    maxNetworkRetries: 2,
  });

  return stripeClient;
}

