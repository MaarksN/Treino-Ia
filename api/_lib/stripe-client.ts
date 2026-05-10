import Stripe from 'stripe';
import { requireEnv } from './http';

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (stripeClient) return stripeClient;

  stripeClient = new Stripe(requireEnv('STRIPE_SECRET_KEY'), {
    appInfo: {
      name: 'Treino IA',
      version: '1.0.0',
    },
    maxNetworkRetries: 2,
  });

  return stripeClient;
}

