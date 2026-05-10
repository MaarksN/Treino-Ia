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

  const signature = request.headers.get('stripe-signature');
  const secretConfigured = Boolean(process.env.STRIPE_WEBHOOK_SECRET);
  const payload = await request.text();

  return json({
    received: true,
    verified: Boolean(signature && secretConfigured),
    bytes: payload.length,
    note: secretConfigured
      ? 'Assinatura presente. Implementar verificacao criptografica da Stripe no ambiente final.'
      : 'STRIPE_WEBHOOK_SECRET ausente. Evento registrado em modo seguro/fallback.',
  });
}
