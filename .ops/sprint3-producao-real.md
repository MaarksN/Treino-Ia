# Sprint 3 - Validacao em Staging e Integracoes Reais

Este documento detalha o checklist de execucao, as credenciais e os passos de validacao manual obrigatorios para comprovar o funcionamento de staging, ja que nao temos as credenciais reais de sandbox no ambiente de desenvolvimento local (sandbox do subagente).

## Variaveis de Ambiente Necessarias (Producao/Staging)

Para executar o smoke test completo com `SPRINT3_SMOKE_STRICT=true npm run smoke:sprint3`, o operador humano ou ambiente de CI deve fornecer o seguinte `.env` (ou variaveis exportadas) devidamente preenchido:

```env
# Supabase Staging
VITE_SUPABASE_URL="https://[projeto-staging].supabase.co"
VITE_SUPABASE_ANON_KEY="[anon-key-staging]"
SUPABASE_URL="https://[projeto-staging].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="[service-role-key-staging]"
SUPABASE_TEST_ACCESS_TOKEN="[access-token-de-um-usuario-logado-em-staging]"

# Stripe Sandbox
STRIPE_SECRET_KEY="sk_test_[sua_chave]"
STRIPE_WEBHOOK_SECRET="whsec_[sua_assinatura]"
STRIPE_PRICE_PRO_MONTHLY="price_[...]"
# ... preencher demais STRIPE_PRICE_* se necessario

# Gemini IA
GEMINI_API_KEY="[sua_chave_gemini_valida]"

# Sentry
VITE_SENTRY_DSN="[seu_dsn_sentry]"
SENTRY_AUTH_TOKEN="[seu_token_sentry]"
SENTRY_ORG="[sua_org_sentry]"
SENTRY_PROJECT="treino-ia"
SENTRY_RELEASE="[hash_do_commit_ou_versao]"
SENTRY_DEPLOY_ENV="staging"

# Health Oauth (quando implementado)
HEALTH_OAUTH_TOKEN_ENCRYPTION_KEY="[32_bytes_em_base64]"
OAUTH_TOKEN_SECURITY_MODE="encrypted"

# Outras URLs do Smoke
STAGING_APP_URL="https://[sua-url-staging]"
SPRINT3_SMOKE_STRICT="true"
```

## Checklist de Execucao (Staging/Preview)

### 1. Supabase Staging

- [ ] Aplicar migrations no projeto de staging: `supabase db push --db-url [url-do-banco-staging]` ou vincular o projeto e rodar `supabase db push`.
- [ ] Rodar os testes de schema drift: `npm run schema:drift`. (Eles passam no codigo fonte contra os arquivos de migration local, mas podem ser avaliados de forma cruzada usando instrospeccao se houver divergencia).
- [ ] Rodar advisors do Supabase (via Dashboard do projeto). A migration de hardening `20260525164429_supabase_advisor_hardening.sql` e a `20260525164603_supabase_advisor_followup.sql` ja limparam os alarmes padrao de indices e politicas ausentes. O painel deve estar sem alarmes criticos.
- [ ] Garantir que os tipos estao atualizados via `npx supabase gen types typescript --linked > src/types/supabase.ts` caso o schema fosse alterado, sem quebrar builds (`npm run typecheck`). (Feito, ou em andamento se executado por humano).
- [ ] Validar RLS: o script `smoke:sprint3` confirma ativamente a rejeicao de INSERT sem autenticacao.

### 2. Stripe Sandbox

- [ ] Validar checkout usando a aplicacao UI publicada em `STAGING_APP_URL`.
- [ ] Validar sessao do Customer Portal na UI.
- [ ] Disparar um evento de Webhook simulado pelo Stripe CLI ou pelo proprio ambiente sandbox (`stripe trigger customer.subscription.updated`).
- [ ] Confirmar nos logs ou banco de dados que a `subscription` (entitlement) do usuario em questao foi atualizada no banco.
- [ ] Confirmar idempotencia disparando o **mesmo payload do webhook** (mesmo id) novamente. Deve retornar `{ received: true, ignored: true }` sem efeitos colaterais.

### 3. Gemini Real

- [ ] Validar proxy `POST /api/gemini-proxy` passando usuario autenticado (`SUPABASE_TEST_ACCESS_TOKEN`). Deve retornar `200` com um texto valido.
- [ ] Validar proxy chamando sem token. Deve retornar erro HTTP controlado (ex: 401).
- [ ] Forcar multiplas solicitacoes ate bater a quota ou simular um problema de chave ausente/quota na api key para observar comportamento. O frontend e o log devem tratar o erro elegantemente (`502` ou `429`).

### 4. Sentry / Observabilidade

- [ ] Validar configuracao na build frontend: a UI carregada deve conter scripts do Sentry se `VITE_SENTRY_DSN` estiver presente.
- [ ] Acionar propositalmente um erro na interface em staging (ex: erro no console/componente) e verificar captura no painel do Sentry (deve capturar breadcrumbs e sourcemaps, caso as variaveis `SENTRY_*` de deploy tenham gerado artefatos vinculados via `@sentry/vite-plugin`).

### 5. Seguranca, Headers e Origem

- [ ] Variaveis isoladas: conferir logs de deploy Vercel garantindo que nenhum VITE_SECRET vazou na UI.
- [ ] Origem: a chamada de proxy, checkouts, webhooks rejeitam/falham via CORS se chamados de dominios fora do allowed (validado pelo unit test `api/_lib/http.test.ts`).
