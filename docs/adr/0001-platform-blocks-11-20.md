# ADR 0001: Hub de Plataforma para os Blocos 11-20

## Contexto

Os blocos 11-20 cobrem 200 itens de produto, muitos deles dependentes de provedores externos.

## Decisao

Implementar uma area operacional unica com feature flags, UI de cobertura por bloco e servicos locais/fallback para cada dominio.

## Consequencias

- O app nao quebra sem Stripe, Supabase, Gemini proxy, Sentry ou PostHog.
- Cada item fica representado em UI, servico, tipo ou documentacao.
- Integracoes reais podem substituir os fallback services gradualmente.
