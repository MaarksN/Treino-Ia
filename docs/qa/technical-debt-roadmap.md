# Roadmap de Divida Tecnica

Status: PLANO PROPOSTO

## Prioridade imediata

| Ordem | ID | Acao | P | Esforco | Criterio de aceite |
|---:|---|---|---|---|---|
| 1 | DT-001 | Rodar Vercel Preview com env real e `SPRINT3_SMOKE_STRICT=true` | P1 | M | preflight e smoke PASS com URL anexada |
| 2 | DT-002 | Testar Usuario/Tenant A vs B no Supabase staging | P1 | M | tentativas cruzadas retornam 403/404/empty |
| 3 | DT-005 | Validar Stripe checkout, portal e webhook assinado sandbox | P1 | M | eventos idempotentes persistidos e entitlement atualizado |
| 4 | DT-012 | Validar export/erasure LGPD com usuario real | P1 | M | export retorna dados do usuario; erasure remove/cascateia |
| 5 | DT-006 | Executar backup/restore e migration rollback ensaiado | P1 | M | restore comprovado e runbook atualizado |

## Proxima sprint

| Ordem | ID | Acao | P | Esforco | Criterio de aceite |
|---:|---|---|---|---|---|
| 6 | DT-003 | Expandir cobertura dos fluxos core | P1 | L | coverage core >=60%; hooks com warnings `act` corrigidos |
| 7 | DT-011 | Corrigir/reexecutar Lighthouse CI | P2 | M | LHCI PASS ou causa documentada com workaround |
| 8 | DT-004 | Normalizar Prettier em PR dedicado | P2 | M | `npm run format:check` PASS |
| 9 | DT-007 | Ativar Sentry release e alertas minimos | P1 | M | evento controlado aparece no projeto e alerta dispara |

## Melhorias de base

| Ordem | ID | Acao | P | Esforco | Criterio de aceite |
|---:|---|---|---|---|---|
| 10 | DT-008 | Reduzir clones em API/registries e revisar exports mortos | P3 | M | jscpd <30 clones; ts-prune triado |
| 11 | DT-009 | Decidir IaC/Docker ou documentar escolha Vercel/Supabase-only | P3 | S | ADR/infra docs atualizados |
| 12 | DT-010 | Atualizar OpenAPI servers e anexar evidencia de staging | P2 | S | docs apontam URL real/staging e ultima execucao |
