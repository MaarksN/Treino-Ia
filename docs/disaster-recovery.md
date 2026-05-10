# Disaster Recovery

Objetivo: restaurar operacao critica em ate 1 hora.

1. Validar status da Vercel e Supabase.
2. Congelar deploys automaticos se houver regressao ativa.
3. Promover ultimo build estavel.
4. Restaurar backup Supabase mais recente.
5. Reprocessar filas de webhooks/sync.
6. Comunicar status aos usuarios.
7. Registrar post-mortem com causa, impacto e prevencao.
