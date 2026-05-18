# Follow-up RPC Plan

Para corrigir as race conditions por completo na gamificação, precisamos migrar a lógica de `api/gamification/event.ts` para dentro do Supabase através de RPCs:

- **RPC transacional de check-in / daily_checkin:** Uma função `record_checkin(user_id)` que usa `SELECT ... FOR UPDATE` no perfil, checa o último checkin at, adiciona a recompensa e salva o evento de forma atômica.
- **RPC transacional de claim de missão:** Similar ao checkin, ler a missão e garantir status antes do claim na mesma transação.
- **RPC transacional de compra cosmética:** Deduz saldo, checa se tem cosmético, salva cosmetic e deduze balance.

*Por que não feito agora?*
Instruções proibiram migrações/Supabase schema changes nesta fase sem justificativa explícita inadiável, exigindo mitigação nível-aplicação como base.
