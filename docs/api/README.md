# API

Endpoints preparados:

- `POST /api/gemini-proxy`: proxy seguro para Gemini.
- `POST /api/stripe/create-checkout-session`: checkout mock/real.
- `POST /api/stripe/webhook`: recepcao de eventos Stripe.
- `GET /api/security/rate-limit`: rate limit basico por IP.

Todos operam em fallback quando secrets ainda nao foram configurados.
