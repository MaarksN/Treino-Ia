# Relatorio E2E

Status: PASS local / BLOCKED staging

## Execucao local

Comando: `npm run test:e2e`

Resultado:

- 21 testes executados.
- 21 passaram.
- Projeto: Chromium.
- Tempo aproximado: 1.1 min.

## Escopo coberto

- Abertura da app.
- Root React renderizado.
- Sem console errors criticos.
- Navegacao direta de rotas core.
- Redirecionamento de path desconhecido.
- Checagem de strings de segredo no page source.
- PWA meta tags.
- Onboarding.
- Cadastro local starter.
- Ciclo de treino local com anamnese, finalizacao, historico e sugestao de IA pendente.
- Axe smoke de acessibilidade.

## Limites da execucao

- `playwright.config.ts` usa placeholders para Supabase em webServer: `https://example.supabase.co` e `ci-placeholder-anon-key`.
- Nao houve login Supabase real.
- Nao houve checkout Stripe real.
- Nao houve chamada Gemini real.
- Nao houve isolamento Tenant A/Tenant B real.
- Nao houve smoke em staging.

## Decisao E2E

PASS para fluxos locais.
NO-GO para readiness final porque o roteiro exige E2E/staging/smoke real dos fluxos criticos.
