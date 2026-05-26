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
