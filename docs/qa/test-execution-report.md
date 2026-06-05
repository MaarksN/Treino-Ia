# Relatorio de Execucao de Testes

Status: PARTIAL

## Resultados

| Verificacao           | Comando                         | Resultado                                              | Status                           |
| --------------------- | ------------------------------- | ------------------------------------------------------ | -------------------------------- |
| Instalacao limpa      | `npm ci`                        | 537 pacotes, 0 vulnerabilidades; warnings allowScripts | PASS                             |
| Lint                  | `npm run lint`                  | sem erros                                              | PASS                             |
| Typecheck             | `npm run typecheck`             | `tsc --noEmit` sem erros                               | PASS                             |
| Build                 | `npm run build`                 | Vite build concluiu                                    | PASS                             |
| Unit/integration      | `npm run test`                  | 194 files, 763 tests PASS                              | PASS                             |
| Coverage              | `npm run test:coverage`         | PASS thresholds, 33.04/27.94/31.96/33.68               | PASS tecnico / PARTIAL qualidade |
| E2E                   | `npm run test:e2e`              | 21/21 PASS                                             | PASS local                       |
| A11y smoke            | `npm run test:a11y`             | 1/1 PASS                                               | PASS local                       |
| Schema drift          | `npm run schema:drift`          | 1 file, 2 tests PASS                                   | PASS                             |
| Validate              | `npm run validate`              | typecheck + test + build PASS                          | PASS                             |
| Format check          | `npm run format:check`          | todos os arquivos seguem Prettier                      | PASS                             |
| Preflight real        | `npm run preflight:sprint3`     | 8 blocos de env ausentes                               | FAIL/BLOCKED                     |
| Smoke sprint3         | `npm run smoke:sprint3`         | `SUPABASE_URL is required`                             | FAIL/BLOCKED                     |
| Smoke Supabase social | `npm run smoke:supabase:social` | SKIP sem Supabase real                                 | BLOCKED                          |
| npm audit             | `npm audit --json`              | 0 vulnerabilidades                                     | PASS                             |
| Lighthouse CI         | `npx @lhci/cli@0.15.x autorun`  | assertions PASS                                        | PASS                             |

## Warnings de testes

- Warnings de React `act(...)` em `useWorkoutManager` e `useCheckinManager` foram removidos com a retirada dos testes duplicados antigos `.test.ts`.
- Alguns testes registraram logs esperados de integrações bloqueadas/not configured, por exemplo wearable OAuth e IoT Mat.

## Cobertura

- Statements: 33.04%.
- Branches: 27.94%.
- Functions: 31.96%.
- Lines: 33.68%.

Cobertura passa os thresholds configurados, mas fica abaixo de 60%, que o roteiro classifica como divida critica de testes para core.
