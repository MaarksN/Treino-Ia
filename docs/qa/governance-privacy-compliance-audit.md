# Governanca, Privacidade e Compliance

Status: PARTIAL

## Evidencias positivas

- Politica de privacidade: `docs/legal/privacy-policy.md`.
- Compliance APIs:
  - `api/compliance/export.ts`
  - `api/compliance/erasure.ts`
- Testes de compliance em `api/compliance/__tests__/complianceHandlers.test.ts`.
- Documentacao LGPD/GDPR em `docs/bloco-17-seguranca-auth-lgpd.md`.
- ADR de RLS/tenancy: `docs/adr/0003-supabase-rls-tenancy.md`.
- Runbook: `docs/runbook.md`.
- Disaster recovery: `docs/disaster-recovery.md`.

## Achados

- `api/compliance/export.ts` agrega colecoes por `user_id` e inclui email/phone do Supabase Auth.
- `api/compliance/erasure.ts` tenta cancelar billing e deletar fisicamente Auth user.
- Rate limits de compliance existem: export 5/h, erasure 2/h.
- Observability redaction cobre email, telefone, CPF e query fields OAuth em testes.

## Bloqueios

- Exportacao/erasure nao foram executadas contra usuario real.
- Consentimento granular com timestamp/versao nao foi validado dinamicamente.
- Branch protection e politicas de revisao obrigatoria nao foram verificadas via GitHub.
- Secrets management foi inferido por docs/workflows, nao verificado no GitHub/Vercel/Supabase.
- Backup/restore nao foi testado.
- Incidentes/runbooks existem, mas nao houve game day.

## Decisao

PARTIAL. Ha estrutura de compliance, mas sem prova operacional real dos direitos LGPD/GDPR e governanca de release.
