# Lacunas Antes de Producao

Status: NO-GO gaps

## Estrutura

- Staging URL nao fornecida nem validada.
- Secrets reais de staging/producao nao carregados nesta auditoria.
- Branch protection/reviews obrigatorias nao verificadas.

## Funcionalidades

- Login/cadastro Supabase real nao validado.
- Fluxo principal com usuario real em staging nao validado.
- Billing Stripe sandbox nao validado.
- Gemini provider real nao validado.
- Social Supabase real nao validado.
- Health OAuth real nao validado.
- Compliance export/erasure real nao validado.

## Banco de dados

- Migrations nao aplicadas em banco limpo durante a auditoria.
- `supabase migration list` remoto nao executado.
- Tenant/usuario A vs B nao testado.
- Backup/restore nao testado.
- Rollback de migration nao testado.

## Seguranca

- IDOR/BOLA real nao testado.
- Rate limit distribuido real nao testado.
- Headers reais em staging/producao nao medidos com `curl -I`.
- OAuth token encryption real nao validada.

## Testes

- `format:check` falha em 717 arquivos.
- Coverage global abaixo de 60%.
- Lighthouse CI falha com `NO_FCP`.
- Smokes reais bloqueados.

## Deploy e operacao

- Vercel Preview/Deploy nao executados.
- Sentry release/sourcemap/alertas nao validados.
- Runbook/DR existem, mas nao foram ensaiados.
- Sem Docker/IaC detectavel, decisao operacional precisa estar documentada formalmente.

## Criterios minimos para sair do NO-GO

1. `preflight:sprint3` PASS com env real.
2. `smoke:sprint3` PASS contra staging URL.
3. Supabase migrations aplicadas e `schema:drift` PASS.
4. Teste A/B de isolamento passa.
5. Stripe sandbox passa checkout, portal e webhook assinado/idempotente.
6. Gemini proxy passa com auth, entitlement, rate limit e chave real.
7. Backup/restore documentado e executado.
8. `format:check` PASS ou gate formal removido/escopado com justificativa.
9. Lighthouse CI PASS ou metricas alternativas documentadas.
