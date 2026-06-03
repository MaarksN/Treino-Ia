# Relatorio de Execucao de Testes

Status: PARTIAL

## Resultados

| Verificacao | Comando | Resultado | Status |
|---|---|---|---|
| Instalacao limpa | `npm ci` | 537 pacotes, 0 vulnerabilidades; warnings allowScripts | PASS |
| Lint | `npm run lint` | sem erros | PASS |
| Typecheck | `npm run typecheck` | `tsc --noEmit` sem erros | PASS |
| Build | `npm run build` | Vite build concluiu | PASS |
| Unit/integration | `npm run test` | 196 files, 770 tests PASS | PASS |
| Coverage | `npm run test:coverage` | PASS thresholds, 34.05/28.78/33.5/34.32 | PASS tecnico / PARTIAL qualidade |
| E2E | `npm run test:e2e` | 21/21 PASS | PASS local |
| A11y smoke | `npm run test:a11y` | 1/1 PASS | PASS local |
| Schema drift | `npm run schema:drift` | 1 file, 2 tests PASS | PASS |
| Validate | `npm run validate` | typecheck + test + build PASS | PASS |
| Format check | `npm run format:check` | 717 arquivos com problemas | FAIL |
| Preflight real | `npm run preflight:sprint3` | 8 blocos de env ausentes | FAIL/BLOCKED |
| Smoke sprint3 | `npm run smoke:sprint3` | `SUPABASE_URL is required` | FAIL/BLOCKED |
| Smoke Supabase social | `npm run smoke:supabase:social` | SKIP sem Supabase real | BLOCKED |
| npm audit | `npm audit --json` | 0 vulnerabilidades | PASS |
| Lighthouse CI | `npm exec @lhci/cli` | `NO_FCP` | FAIL/BLOCKED |

## Warnings de testes

- Vitest passou, mas emitiu warnings de React `act(...)` em `useWorkoutManager` e `useCheckinManager`.
- Alguns testes registraram logs esperados de integrações bloqueadas/not configured, por exemplo wearable OAuth e IoT Mat.

## Cobertura

- Statements: 34.05%.
- Branches: 28.78%.
- Functions: 33.5%.
- Lines: 34.32%.

Cobertura passa os thresholds configurados, mas fica abaixo de 60%, que o roteiro classifica como divida critica de testes para core.
