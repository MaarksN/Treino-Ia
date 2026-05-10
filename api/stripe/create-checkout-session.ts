export const config = {
  runtime: 'edge',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const { planId = 'pro', interval = 'month' } = await request.json().catch(() => ({}));

  if (!stripeKey) {
    return json({
      mode: 'mock',
      checkoutUrl: `/checkout/mock?plan=${encodeURIComponent(planId)}&interval=${encodeURIComponent(interval)}`,
      message: 'STRIPE_SECRET_KEY ausente. Checkout mock retornado.',
    });
  }

  return json({
    mode: 'ready',
    message: 'Conecte aqui a chamada real da Stripe Checkout Session.',
    planId,
    interval,
  });
}
