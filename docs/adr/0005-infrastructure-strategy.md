# ADR 0005: Estrategia de infraestrutura

Status: Aceita
Data: 2026-06-05

## Contexto

A auditoria registrou DT-009 porque o repositorio nao possui Dockerfile, docker-compose, Terraform ou Pulumi. Isso nao bloqueia producao por si so, mas a decisao operacional precisa ficar explicita.

## Decisao

O Treino IA permanece, para o MVP privado, em uma estrategia Vercel + Supabase:

- Vercel hospeda frontend, API routes e previews.
- Supabase hospeda Auth, Postgres, RLS e backups gerenciados.
- Stripe, Gemini/Google AI e Sentry sao provedores externos configurados por secrets.
- GitHub Actions executa gates locais, preview, preflight e smokes.

Nao sera adicionado Dockerfile ou IaC neste momento. A prioridade e provar staging real, migrations, backup/restore e smokes com secrets configurados. Docker/IaC entram apenas se houver necessidade concreta de ambiente local isolado, provisionamento repetivel fora dos consoles gerenciados ou requisito corporativo.

## Consequencias

- O runbook de deploy deve tratar Vercel/Supabase como fonte operacional.
- Secrets ficam em GitHub Actions/Vercel/Supabase/Stripe/Sentry, nunca no repositorio.
- Backup/restore usa mecanismos do Supabase e ensaio documentado em `docs/disaster-recovery.md`.
- A ausencia de Docker/IaC deixa de ser ambigua, mas continua exigindo revisao antes de escala maior ou compliance mais formal.

## Criterios para revisitar

- Necessidade de reproduzir API + banco em CI de ponta a ponta sem Supabase gerenciado.
- Ambientes efemeros por PR com banco isolado.
- Requisito de disaster recovery fora do Supabase.
- Provisionamento multi-ambiente manual se tornar fonte recorrente de incidentes.
