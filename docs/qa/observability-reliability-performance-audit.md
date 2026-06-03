# Observabilidade, Confiabilidade e Performance

Status: PARTIAL

## Observabilidade

Evidencias:

- `api/_lib/http.ts` gera e propaga `x-correlation-id`.
- `docs/adr/0004-api-correlation-id.md` define decisao arquitetural.
- `src/services/observability/**` contem sink/redaction.
- `src/main.tsx` inicializa Sentry se `VITE_SENTRY_DSN` existir.
- Testes cobrem redacao de PII em observability.

Lacunas:

- Sentry real nao validado.
- Sem alerta 5xx real.
- Sem dashboard de erro/funil real validado.
- Logs estruturados com `tenant_id` nao foram comprovados.

## Confiabilidade

Evidencias:

- `docs/disaster-recovery.md` existe.
- `docs/runbook.md` existe.
- Retry policy em `api/_lib/retryPolicy.ts`.
- Fetch timeout em `api/_lib/fetchWithTimeout.ts`.
- Idempotencia em offline sync e gamification.

Lacunas:

- Backup/restore nao testado.
- Rollback de app/migrations nao testado.
- Health checks reais nao validados.

## Performance

Evidencias:

- Build produziu chunks manuais para react, supabase, sentry, charts etc.
- Maior chunk reportado no build: `index-*.js` 276.39 kB gzip 85.55 kB; `supabase` 200.67 kB gzip 51.62 kB; `react` 181.78 kB gzip 57.19 kB.

Falhas:

- Lighthouse CI local falhou com `NO_FCP`.
- Sem Web Vitals real.
- Sem teste de carga ou API latency.

## Decisao

PARTIAL. Ha instrumentacao planejada e alguns helpers, mas operacao/performance real nao esta validada.
