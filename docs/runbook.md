# Runbook Operacional

## Incidente: billing inconsistente
1. Verificar eventos recentes no webhook Stripe.
2. Reprocessar evento idempotente se necessário.
3. Conferir `api/billing/entitlement` e fonte de verdade no banco.

## Incidente: falha no provedor IA
1. Confirmar env de `GEMINI_API_KEY`.
2. Validar fallback determinístico e `dataMode: not_configured`.
3. Revisar logs de auditoria de decisão IA.

## Incidente: erro de RLS
1. Identificar tabela/policy impactada.
2. Validar `auth.uid() = user_id` nas policies.
3. Corrigir migration incremental (nunca editar histórico aplicado em produção).
