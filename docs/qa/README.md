# Sovereign Audit v2 - README

Data: 2026-06-03
Repositorio: Treino-Ia
Branch: main
Commit base/final auditado: 878c0404ed96dd1ee609a63ac578970fe6253ddf
Modo: FULL

## Decisao curta

Resultado: NO-GO
Confianca da auditoria: MEDIA

Motivos principais:

- Smoke real de staging bloqueado por ausencia de `STAGING_APP_URL`, `SUPABASE_TEST_ACCESS_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_*`, `GEMINI_API_KEY` e Sentry.
- Isolamento multi-tenant/RLS nao foi validado dinamicamente com dois usuarios/tenants reais no Supabase.
- Backup/restore e rollback de banco nao foram executados.
- Coverage global continua abaixo de 60%.
- Clones restantes ainda acima da meta ideal `<30`.

## Evidencias verdes

- `npm ci`: PASS, 537 pacotes instalados, 0 vulnerabilidades no audit inicial.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS, Vite build concluido.
- `npm run test`: PASS, 194 arquivos e 763 testes.
- `npm run test:coverage`: PASS nos thresholds configurados; cobertura global 33.04% statements, 27.94% branches, 31.96% functions, 33.68% lines.
- `npm run test:e2e`: PASS, 21/21 testes Chromium.
- `npm run test:a11y`: PASS, 1/1 axe smoke.
- `npm run schema:drift`: PASS, 1 arquivo e 2 testes.
- `npm audit --json`: PASS, 0 vulnerabilidades.
- `madge --circular`: PASS, nenhum ciclo detectado.
- `npm run format:check`: PASS.
- Lighthouse CI local: PASS em 2026-06-05.

## Arquivos gerados

- `audit-environment.md`
- `repository-inventory.md`
- `architecture-map.md`
- `feature-matrix.md`
- `database-audit.md`
- `api-audit.md`
- `frontend-ux-accessibility-audit.md`
- `auth-authorization-multitenancy-audit.md`
- `test-execution-report.md`
- `e2e-report.md`
- `smoke-test-report.md`
- `security-audit.md`
- `dependency-security-audit.md`
- `governance-privacy-compliance-audit.md`
- `infrastructure-cicd-deployment-audit.md`
- `observability-reliability-performance-audit.md`
- `documentation-maintainability-audit.md`
- `technical-debt-register.md`
- `technical-debt-roadmap.md`
- `missing-items-before-production.md`
- `final-readiness-report.md`
