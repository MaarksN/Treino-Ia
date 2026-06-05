# Disaster Recovery

Objetivo: restaurar operacao critica em ate 1 hora.

1. Validar status da Vercel e Supabase.
2. Congelar deploys automaticos se houver regressao ativa.
3. Promover ultimo build estavel.
4. Restaurar backup Supabase mais recente.
5. Reprocessar filas de webhooks/sync.
6. Comunicar status aos usuarios.
7. Registrar post-mortem com causa, impacto e prevencao.

## Rollback do beta privado

1. Pausar novos convites e avisar o canal de suporte.
2. Promover o ultimo deploy estavel na Vercel.
3. Conferir se a versao restaurada usa `VITE_FEATURE_AUDIENCE=user`.
4. Validar login, anamnese, plano, finalizacao de treino e historico.
5. Restaurar backup Supabase ou aplicar migration reversa validada se houver perda/corrupcao de dados.
6. Reprocessar webhooks Stripe apenas depois de confirmar idempotencia.
7. Registrar usuarios impactados e decisao: continuar beta, pausar ou bloquear release.

## Ensaio DT-006: migrations, backup e restore

Executar somente contra staging ou projeto Supabase descartavel. Nunca usar banco de producao como destino de restore.

1. Criar projeto Supabase limpo ou resetar ambiente descartavel aprovado.
2. Aplicar migrations em ordem com a CLI Supabase ou pipeline equivalente.
3. Rodar `npm run schema:drift` no repositorio apontando para o schema aplicado.
4. Popular dados minimos de dois usuarios descartaveis: perfil, plano, `workout_sessions`, billing sandbox e um registro de compliance quando aplicavel.
5. Gerar backup logico com `supabase db dump --linked --file ./artifacts/staging-backup.sql` ou comando equivalente aprovado pela operacao. Nao commitar o artefato.
6. Restaurar o dump em outro projeto Supabase descartavel ou banco temporario isolado.
7. Conferir contagens por tabela, chaves estrangeiras, policies RLS e leitura cruzada A/B com `npm run smoke:tenant-ab`.
8. Rodar `npm run smoke:sprint3` e `npm run smoke:compliance` contra o ambiente restaurado quando as APIs estiverem publicadas.
9. Registrar no relatorio de QA: data, run/job, ambiente de origem/destino, comandos executados, status e discrepancias. Nao registrar connection strings nem service role keys.
