# Matriz de Funcionalidades Reais

Status: PARTIAL

| Funcionalidade | Classificacao | Frontend | Backend | Banco | E2E | Evidencia |
|---|---|---|---|---|---|---|
| Onboarding | REAL local | PASS | N/A | localStorage | PASS | `tests/e2e/onboarding-flow.spec.ts`, 3 testes PASS |
| Cadastro starter local | REAL local | PASS | N/A | localStorage | PASS | `registration-flow.spec.ts`, persiste starter user |
| Supabase Auth email/senha | PARTIAL | Componentes/servicos existem | Supabase client | BLOCKED real | NOT TESTED real | `src/services/database.ts:161`, env ausente |
| Anamnese/plano/treino local | REAL local | PASS | N/A | localStorage/Supabase fallback | PASS | `workout-cycle.spec.ts`, 3 testes PASS |
| Persistencia cloud de perfil/plano/historico | PARTIAL | PASS local | Supabase client | migrations existem | BLOCKED real | `src/services/database.ts:187`, `:222`, `:322` |
| Health/nutricao/hidratacao/sono | PARTIAL | PASS local | Supabase client | migrations existem | PARTIAL | `src/services/healthService.ts:18` mock_dev_only quando sem Supabase |
| Gemini proxy | PARTIAL | Cliente existe | API autenticada | uso/entitlement | BLOCKED real | `api/gemini-proxy.ts:92`, `preflight` sem `GEMINI_API_KEY` |
| Billing/Stripe | PARTIAL | Pricing/paywall existem | Checkout/portal/webhook | billing tables | BLOCKED real | `api/stripe/*.ts`, smoke sem `STRIPE_*` |
| Compliance export/erasure | PARTIAL | Privacy panel existe | APIs existem | tabelas existem | BLOCKED real | `api/compliance/export.ts`, `erasure.ts` |
| Gamification | PARTIAL | UI/servicos existem | APIs existem | RPC/migrations | Unit PASS | `api/gamification/event.ts`, testes PASS |
| Social real | PARTIAL | Servico real existe | Supabase | migrations existem | BLOCKED real | `smoke:supabase:social` SKIP sem env |
| Global feed legado | MOCKED | PASS visual | N/A | N/A | NOT TESTED | `src/components/GlobalFeed.tsx:4` `FAKE_POSTS` |
| Webhook outbound preview | MOCKED/PARTIAL | UI existe | local service | localStorage | NOT TESTED real | `AdvancedPlatformHub.tsx:611` usa `example.com/n8n/treino` |
| Health OAuth | PARTIAL | Servicos/API existem | OAuth handlers | tokens table | BLOCKED real | env OAuth ausente |
| Retention worker | PARTIAL | Operacao documentada | worker API | Supabase | BLOCKED real | requer `RETENTION_WORKER_SECRET`/cron real |
| PWA | PARTIAL | manifest/sw existem | N/A | N/A | PASS smoke | E2E valida meta tags; Lighthouse falhou NO_FCP |

## Funcionalidades nao reais ou nao comprovadas

- `GlobalFeed` usa posts falsos.
- Health/nutricao podem cair para `mock_dev_only` local.
- Legacy training sync cai para `mock_dev_only` local quando Supabase/auth indisponivel.
- Webhook de plataforma usa URL de exemplo.
- Billing, Gemini, social, compliance e OAuth nao foram validados com credenciais reais.
