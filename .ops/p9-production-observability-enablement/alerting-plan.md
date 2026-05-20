# P9 — Alerting Plan (Recommended, no external provider configured)

| Alerta | Condição | Severidade | Canal recomendado | Owner | Ação inicial |
|---|---|---|---|---|---|
| 5xx acima de limiar | > 2% 5xx por 5 min em rotas API | SEV1/SEV2 | On-call + canal incidentes | Backend on-call | Triagem por `requestId` e rota afetada |
| OAuth callback failures | >= 5 falhas em 10 min | SEV1/SEV2 | On-call + produto | Backend/Auth owner | Validar credenciais/env + estado OAuth |
| Gemini timeout/failure spike | 502/timeout acima do baseline por 10 min | SEV2 | On-call backend | AI integration owner | Validar provider status e retry behavior |
| Telemetry ingestion failure | `api/telemetry/errors` com 5xx recorrente | SEV2/SEV3 | On-call backend | Observability owner | Verificar tabela/dependências e quota |
| PWA/API cache violation | Erros recorrentes de cache/storage | SEV3 | Canal engenharia | Frontend owner | Confirmar impacto offline e fallback |
| Billing guard errors | aumento de 4xx/5xx em `api/stripe/*` e billing guard | SEV2 | On-call backend + financeiro produto | Billing owner | Verificar metadata/entitlements/webhook |
| Frontend unhandled errors | spike de eventos `window.error`/`unhandledrejection` | SEV2/SEV3 | Canal engenharia | Frontend owner | Correlacionar versão release e fluxo |
| Supabase env missing | erro 500 de `requireEnv` em produção | SEV1 | On-call imediato | Platform owner | Restaurar env e reiniciar deploy seguro |
