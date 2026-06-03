# Infraestrutura, CI/CD e Deploy

Status: PARTIAL

## CI/CD detectado

- `.github/workflows/ci.yml`: lint, typecheck, test, build, E2E Playwright container e coverage.
- `.github/workflows/vercel-preview.yml`: workflow manual de preview com secrets, gates locais, preflight e smoke real.
- `.github/workflows/vercel-deploy.yml`: deploy prod via Vercel se secrets existem.
- `.github/workflows/lighthouse.yml`: Lighthouse CI em PR/workflow manual.
- `vercel.json`: headers, rewrite `/api/gemini`, cron retention worker.

## Infra ausente

- Nao ha Dockerfile detectado.
- Nao ha docker-compose detectado.
- Nao ha Terraform/Pulumi detectado.
- Docker CLI indisponivel no ambiente local.

## Tabela obrigatoria

| Item | Local | Teste | Staging | Producao |
|---|---|---|---|---|
| Banco | Supabase migrations versionadas | `schema:drift` PASS | BLOCKED sem env | BLOCKED |
| Variaveis | `.env.example` completo | preflight FAIL sem env | BLOCKED | BLOCKED |
| Migrations | 16 SQL | nao aplicadas localmente | BLOCKED | BLOCKED |
| Storage | Supabase previsto | NOT TESTED | BLOCKED | BLOCKED |
| Monitoramento | Sentry/PostHog previsto | NOT TESTED real | BLOCKED | BLOCKED |
| Backup | docs DR | NOT TESTED | BLOCKED | BLOCKED |

## Deploy

- Vercel Preview e Deploy existem, mas nao foram executados nesta auditoria.
- `Vercel Deploy` pula deploy se secrets faltarem; isto e seguro, mas producao nao foi comprovada.
- Preview workflow e mais forte para beta porque roda `preflight:sprint3` e `smoke:sprint3`.

## Decisao

PARTIAL. CI local e bom, mas deploy reproduzivel, staging real, migrations remotas, monitoring e backup/restore nao foram comprovados.
