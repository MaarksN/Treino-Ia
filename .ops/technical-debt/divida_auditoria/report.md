# Auditoria de Divida Tecnica - Auditoria

## 1. Resumo executivo

- **Veredito:** FAIL
- **Severidade dominante:** ALTA
- **Fato confirmado:** existem tabelas e servicos relacionados a auditoria (`user_audit_logs`, `ai_decision_audits`, `stripe_webhook_events`, telemetry).
- **Risco principal:** os eventos exibidos como auditoria de seguranca/LGPD no frontend sao gravados em `localStorage`, logo sao alteraveis pelo usuario e nao servem como trilha de auditoria SaaS. A auditoria server-side existe em partes, mas nao e usada de forma transversal.

## 2. Escopo analisado

- `src/services/auditLogService.ts`
- `src/services/privacyService.ts`
- `src/components/platform/AdvancedPlatformHub.tsx`
- `api/telemetry/errors.ts`
- `api/_lib/billing-store.ts`
- `src/services/aiDecisionAuditRepository.ts`
- migrations com `user_audit_logs`, `ai_decision_audits`, `stripe_webhook_events`.

## 3. Comandos executados

- `rg -n "audit|telemetry|logger|console|stripe_webhook_events|user_audit_logs|ai_decision_audits" src api supabase docs tests`
- leituras dos arquivos do escopo.

## 4. Achados por severidade

### ALTA

**AUD-01 - Trilha de auditoria de seguranca/LGPD e local e adulteravel**

- Evidencia: `src/services/auditLogService.ts:3-16` grava eventos em `@TreinoApp:audit-log` no `localStorage`.
- Evidencia: `src/services/privacyService.ts:31`, `:44`, `:56` registra consentimento/exportacao/exclusao usando esse log local.
- Evidencia: `src/components/platform/AdvancedPlatformHub.tsx:794-810` mostra esses eventos no painel de seguranca.
- Impacto: usuario pode apagar/editar evidencias; nao ha trilha imutavel para suporte, incidentes ou compliance.
- Recomendacao: gravar eventos criticos em endpoint server-side com userId, requestId, IP hash, user-agent e retencao definida.

**AUD-02 - Payload completo de webhook Stripe e armazenado sem politica de redacao/retencao**

- Evidencia: `api/_lib/billing-store.ts:125-134` insere `payload: event` em `stripe_webhook_events`.
- Impacto: eventos Stripe podem conter dados pessoais e detalhes de billing; sem retencao/redacao explicita vira passivo LGPD.
- Recomendacao: persistir campos minimos necessarios, redigir PII e definir TTL/retencao.

**AUD-03 - Tabela `user_audit_logs` existe, mas nao e usada pelos servicos de produto**

- Evidencia: `supabase/migrations/20260511120000_platform_blocks_11_20_core.sql:78-86` cria `user_audit_logs`.
- Evidencia: `rg` encontrou uso operacional em `src/services/auditLogService.ts`, que grava localStorage, nao Supabase.
- Impacto: auditoria server-side planejada nao cobre eventos reais.
- Recomendacao: criar `api/audit/events` ou repositorio server-side e migrar eventos criticos.

### MEDIA

**AUD-04 - Telemetria tem sanitizacao, mas rate limit e memoria local por instancia**

- Evidencia: `api/telemetry/errors.ts:25-28` define limite anonimo com `Map` em memoria.
- Evidencia: `api/telemetry/errors.ts:121-151` limita lote e sanitiza antes de gravar.
- Impacto: bom para MVP, mas em serverless multi-instancia nao oferece limite global nem deduplicacao forte.
- Recomendacao: usar storage distribuido ou limitar por plataforma (WAF/KV/Redis) se o endpoint ficar publico.

**AUD-05 - AI decision audits existem, mas cobertura nao e transversal**

- Evidencia: `supabase/migrations/20260511002500_ai_decision_audits.sql:1-38` cria tabela e policies.
- Evidencia: `src/services/aiDecisionAuditRepository.ts` grava auditoria de decisoes, mas varios servicos de IA ainda chamam Gemini/proxy sem garantir registro uniforme.
- Impacto: auditoria de IA fica parcial, dificultando investigacao de respostas, fallbacks e custo.
- Recomendacao: encapsular chamadas de IA em gateway unico que sempre emita auditoria.

## 5. Evidencias positivas

- `api/telemetry/errors.ts` tem limite de 50 eventos, limite de bytes e sanitizacao.
- `api/_lib/http.ts` gera `requestId` em erros 500.
- `ai_decision_audits` possui RLS por `user_id`.

## 6. Riscos para SaaS real

- Evidencia de compliance nao confiavel.
- Dificuldade de investigar incidentes de billing, auth e IA.
- Retencao de PII acima do necessario.

## 7. Recomendacoes priorizadas

1. Migrar auditoria LGPD/seguranca para backend.
2. Reduzir payload de `stripe_webhook_events`.
3. Padronizar `requestId` e `actorId` em todos os endpoints.
4. Tornar AI gateway obrigatorio para chamadas de IA auditaveis.

## 8. Quick wins

- Criar helper `recordUserAuditEvent(userId, action, metadata)`.
- Trocar `payload: event` por campos selecionados no webhook Stripe.
- Adicionar teste que proibe auditoria critica apenas em `localStorage`.

## 9. Itens que exigem decisao humana

- Retencao de logs e eventos de billing.
- Quais acoes entram na trilha imutavel.
- Politica de acesso de suporte/admin aos logs.

## 10. Veredito final

**FAIL.** O projeto tem os blocos iniciais, mas a auditoria confiavel ainda nao esta ligada aos fluxos criticos.
