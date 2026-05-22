# Sprint 04 Risk Register

| Risco | Severidade | Status anterior | Status apos sprint | Evidencia | Proxima acao |
|---|---|---|---|---|---|
| OAuth sandbox ausente | Alta | Aberto em P11/P12/post-launch | Aberto, bloqueado com evidencia | `sandbox-decision.md`, `oauth-smoke-results.md`; env OAuth/Supabase ausente | Provisionar provider sandbox autorizado, conta de teste, redirect allowlist e secrets fora do repo. |
| Billing sandbox ausente | Alta | Aberto em P11/P12/post-launch | Aberto, bloqueado com evidencia | `sandbox-decision.md`, `billing-smoke-results.md`; env Stripe/Supabase ausente | Provisionar Stripe test mode, usuario sandbox, price IDs test e Supabase sandbox. |
| Secrets nao fornecidos | Alta | Aberto | Aberto | Checagem de ambiente indicou `MISSING` para OAuth, Supabase, Stripe, webhook secret, price IDs e token encryption key | Configurar secrets em ambiente controlado; nunca no repo. |
| Webhook secret sandbox pendente | Alta | Aberto | Aberto | `api/stripe/webhook.ts` exige `STRIPE_WEBHOOK_SECRET`; variavel ausente | Criar endpoint sandbox controlado e webhook signing secret test fora do repo. |
| Redirect allowlist | Media | Aberto | Aberto, codigo suporta allowlist mas ambiente nao configurado | `api/_lib/oauthRedirect.ts`, `api/_lib/oauthRedirect.test.ts`, env `OAUTH_REDIRECT_ALLOWLIST` ausente | Definir `APP_URL`, `OAUTH_REDIRECT_ALLOWLIST` e allowlist no provider sandbox. |
| Payload minimization | Media | Nao fechado/provado | Aberto com warning | `api/_lib/billing-store.ts` persiste payload completo do evento Stripe | Avaliar minimizacao/redaction de evento antes de webhook sandbox real ou documentar excecao aprovada. |
| E2E/Coverage bloqueados | Media | Risco aceito na Sprint 01/P12 | Inalterado, nao reaberto | `npm pkg get scripts` nao lista `test:e2e` nem `test:coverage` | `E2E NOT AVAILABLE / SKIPPED - risco ja aceito e tratado no Sprint 01`. |
| Rollback real de deploy pendente | Media | Parcialmente reduzido na Sprint 03 por dry-run | Aberto com warning | `.ops/stabilization-execution-sprint-03-rollback/final-report.md` | Executar rehearsal em deploy provider/staging autorizado com artifact N-1 confirmado. |

## Risk Decision

O risco OAuth/Billing nao foi fechado. Ele foi reduzido apenas por auditoria estatica, confirmacao de ausencia de secrets e documentacao honesta do bloqueio.
