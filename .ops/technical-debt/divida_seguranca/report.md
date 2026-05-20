# Auditoria de Divida Tecnica - Seguranca

## 1. Resumo executivo

- **Veredito:** FAIL
- **Severidade dominante:** CRITICA / ALTA
- **Fato confirmado:** ha bons blocos de hardening, como webhook Stripe assinado, sanitizacao de telemetria e validacao basica de payloads de IA.
- **Risco principal:** controles sensiveis ainda estao inconsistentes entre frontend, APIs serverless e migrations. O maior risco encontrado e a exposicao potencial de funcoes SQL `security definer` de gamificacao que aceitam `p_user_id` e valores de recompensa sem `revoke execute`, permitindo abuso direto via Supabase RPC caso a funcao esteja acessivel a `public`/`authenticated`.

## 2. Escopo analisado

- API: `api/_lib/http.ts`, `api/_lib/server-supabase.ts`, `api/gemini-proxy.ts`, `api/stripe/*`, `api/health/*`, `api/retention/worker.ts`, `api/jobs/create.ts`, `api/sync/offline-actions.ts`, `api/telemetry/errors.ts`.
- Banco: `supabase/migrations/*`, `supabase/social-schema.sql`, `supabase/billing-gamification-schema.sql`.
- Frontend de seguranca: `src/utils/csrf.ts`, `src/utils/rateLimit.ts`, `src/services/auditLogService.ts`, `src/components/platform/AdvancedPlatformHub.tsx`.

## 3. Comandos executados

- `git status --short`
- `git branch --show-current`
- `Get-Command node -All`
- `node --version; npm --version; pnpm --version` (falhou: `node.exe` com acesso negado, `npm`/`pnpm` ausentes)
- `rg -n "service_role|SUPABASE_SERVICE|STRIPE|WEBHOOK|HMAC|signature|authorization|csrf|rateLimit|Access-Control|CORS|allow-origin|sanitize|innerHTML|dangerouslySetInnerHTML"`
- `rg -n "tenant|tenant_id|workspace|organization_id"`
- leituras direcionadas dos arquivos listados no escopo.

## 4. Achados por severidade

### CRITICA

**SEC-01 - RPCs `security definer` de gamificacao podem ficar executaveis por clientes**

- Evidencia: `supabase/migrations/20260512000000_gamification.sql:115`, `:158`, `:191` criam `apply_gamification_event`, `purchase_gamification_item` e `open_loot_box` com `security definer`.
- Evidencia: o mesmo arquivo termina em `:226` sem `revoke execute` ou `grant execute to service_role`; tambem nao usa `set search_path`.
- Evidencia: `api/gamification/event.ts:113` e `:157` chamam `apply_gamification_event` pelo backend, mas a funcao SQL em si aceita `p_user_id`, `p_xp_delta` e `p_coin_delta`.
- Impacto: um usuario autenticado pode tentar chamar RPC diretamente pelo client Supabase e manipular XP/moedas de si mesmo ou de outro `user_id`, dependendo dos grants efetivos no banco.
- Recomendacao: criar migration de hardening com `revoke execute ... from public, anon, authenticated`, `grant execute ... to service_role`, `set search_path = public` e testes que leiam as migrations.

### ALTA

**SEC-02 - CORS wildcard em respostas autenticadas**

- Evidencia: `api/_lib/http.ts:20` define `access-control-allow-origin: *` para respostas comuns.
- Evidencia: `api/gemini-proxy.ts:42`, `:49`, `:230` repetem wildcard CORS em endpoint autenticado e custoso.
- Impacto: embora os endpoints usem Bearer token, a politica e permissiva demais para SaaS real e aumenta impacto de token leakage, extensoes maliciosas ou clientes nao autorizados.
- Recomendacao: centralizar CORS com allowlist por ambiente e rejeitar `Origin` desconhecido para APIs autenticadas.

**SEC-03 - Redirects Stripe confiam no header `Origin`**

- Evidencia: `api/stripe/create-checkout-session.ts:29`, `:42`, `:43` usam `origin` da request para `success_url` e `cancel_url`.
- Evidencia: `api/stripe/create-portal-session.ts:32`, `:36` usa `origin` para `return_url`.
- Impacto: uma origem maliciosa pode iniciar checkout/portal e levar o usuario para dominio externo apos o fluxo Stripe.
- Recomendacao: usar `APP_URL`/allowlist e validar origin antes de montar URLs de retorno.

**SEC-04 - Limite de tamanho de body nao e aplicado de forma consistente**

- Evidencia: `api/_lib/http.ts:58` so limita bytes quando `readJsonObject` recebe `maxBytes`.
- Evidencia: `api/jobs/create.ts:17`, `api/health/sync.ts:28`, `api/stripe/create-checkout-session.ts:20` usam `readJsonObject(request)` sem limite.
- Impacto: payloads grandes podem gerar custo, lentidao, armazenamento JSONB excessivo ou DoS de funcao.
- Recomendacao: exigir `maxBytes` em todo endpoint POST e validar schemas com Zod ou similar.

### MEDIA

**SEC-05 - Webhook de notificacao de retencao sem timeout, assinatura HMAC ou replay protection**

- Evidencia: `api/retention/worker.ts:91-104` envia `fetch(webhookUrl)` com bearer opcional, sem timeout, idempotency key, timestamp ou assinatura HMAC.
- Impacto: worker pode travar em provider lento e nao ha garantia criptografica de autenticidade/replay.
- Recomendacao: usar `fetchWithTimeout`, cabecalhos `x-signature`/`x-timestamp`, hash HMAC do payload e politica de retry/backoff.

**SEC-06 - CSRF e rate limit exibidos no painel sao controles locais, nao server-side**

- Evidencia: `src/utils/csrf.ts:1-15` armazena token em `localStorage`.
- Evidencia: `src/utils/rateLimit.ts:1-19` tambem usa `localStorage`.
- Evidencia: `src/components/platform/AdvancedPlatformHub.tsx:722-758` exibe esses valores como bloco de seguranca.
- Impacto: passa uma impressao de protecao que nao existe para APIs reais; qualquer usuario limpa `localStorage`.
- Recomendacao: renomear como demonstrativo ou mover controles para middleware server-side.

## 5. Evidencias positivas

- `api/stripe/webhook.ts:14-31` valida `stripe-signature` com `constructEvent`.
- `api/gemini-proxy.ts:101-127` valida payload e limita `MAX_REQUEST_BYTES`.
- `api/telemetry/errors.ts:121` usa `readJsonObject` com limite de bytes e sanitiza PII.
- `api/_lib/redact.ts` e `api/_lib/piiRedaction.ts` reduzem vazamento em logs.

## 6. Riscos para SaaS real

- Manipulacao de gamificacao, moedas e recompensas por RPC direto.
- Redirect externo em fluxos de billing.
- Superficie de API permissiva via CORS.
- DoS/custo por payload grande em endpoints sem limite.
- Controles de seguranca demonstrativos confundidos com controles reais.

## 7. Recomendacoes priorizadas

1. Bloquear grants das RPCs de gamificacao e adicionar testes de migration.
2. Implementar allowlist de origem para APIs e billing redirects.
3. Aplicar `maxBytes` + schema validation em todos os endpoints POST.
4. Assinar webhooks internos com HMAC, timeout e idempotencia.
5. Remover/renomear controles locais de CSRF/rate limit como demonstracao.

## 8. Quick wins

- Patch SQL de `revoke execute` nas tres RPCs de gamificacao.
- Helper `getAllowedAppOrigin(request)` reaproveitado por Stripe e CORS.
- Trocar `readJsonObject(request)` por `readJsonObject(request, { maxBytes: ... })`.

## 9. Itens que exigem decisao humana

- Lista oficial de dominios permitidos para producao, preview e staging.
- Se gamificacao deve ser somente server-authoritative ou permitir algum RPC autenticado com `auth.uid()`.
- Politica de retencao/redacao de payloads Stripe e telemetry.

## 10. Veredito final

**FAIL.** Ha controles bons, mas a combinacao de RPC exposta, CORS amplo, redirects por `Origin` e controles locais demonstrativos impede considerar a seguranca pronta para producao SaaS.
