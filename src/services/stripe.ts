import { loadStripe } from '@stripe/stripe-js';

export const getStripe = () => {
  return loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');
};

export const stripe = {
  async redirectToCheckout(sessionId: string) {
    const stripeInstance = await getStripe();
    if (stripeInstance) {
      await (stripeInstance as any).redirectToCheckout({ sessionId });
    }
  }
};
