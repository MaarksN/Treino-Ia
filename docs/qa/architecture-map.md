# Mapa de Arquitetura

Status: PARTIAL

## Camadas inferidas

| Camada               | Evidencia                                                                                                | Status                          |
| -------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------- |
| UI/Rotas             | `src/App.tsx`, `src/router.tsx`, `src/pages/Dashboard/**`, `src/components/**`                           | PASS local                      |
| Estado e hooks       | `src/stores/**`, `src/hooks/**`, React Query provider                                                    | PASS local                      |
| Dominio/regra        | `src/rules/**`, `src/pages/Dashboard/services/**`, `src/services/**`                                     | PARTIAL                         |
| Persistencia cliente | `src/services/database.ts`, `src/services/healthService.ts`, `src/services/legacyTrainingSyncService.ts` | PARTIAL, fallback local         |
| Backend serverless   | `api/**`                                                                                                 | PARTIAL, testado unitariamente  |
| Banco/RLS            | `supabase/migrations/**`                                                                                 | PARTIAL, validado estaticamente |
| Observabilidade      | `api/_lib/http.ts`, `src/services/observability/**`, Sentry em `src/main.tsx`                            | PARTIAL                         |
| Deploy               | `.github/workflows/*.yml`, `vercel.json`                                                                 | PARTIAL                         |

## Analise estrutural

- `madge --circular --extensions ts,tsx src api`: PASS, 633 arquivos processados, nenhum ciclo detectado.
- `dependency-cruiser --no-config --output-type text src api`: PASS tecnico sem regras configuradas; sem violacoes reportadas, mas a ferramenta nao validou politicas de arquitetura.
- `jscpd --min-lines 10 --reporters console src api`: PARTIAL, 54 clones encontrados, duplicacao total 1.37% de linhas.
- `ts-prune --project tsconfig.json`: PARTIAL, lista grande de exports aparentemente nao usados, incluindo componentes legados e tipos.

## Riscos de arquitetura

- Componentes e servicos grandes permanecem no core de UI. Exemplos: `src/pages/Dashboard.tsx`, `src/components/WorkoutDashboard.tsx`, `src/components/platform/AdvancedPlatformHub.tsx`.
- Persistencia tem fallback local em varios fluxos; isso e util para desenvolvimento, mas exige gating claro em producao.
- Parte do backend usa service role via Vercel Functions; o padrao e aceitavel quando autenticado, mas precisa de validacao real de RLS/IDOR.
- Duplicacao relevante nos registries `src/core/blocks/blocoXXRegistry.ts` e handlers API com padroes repetidos.

## Conclusao

Arquitetura organizada o suficiente para build/testes, mas ainda nao comprovada como pronta para producao porque staging, banco real, multi-tenancy e operacao nao foram exercitados.
