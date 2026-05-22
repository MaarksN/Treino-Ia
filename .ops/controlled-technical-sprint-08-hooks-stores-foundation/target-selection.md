| Candidato | Tipo | Requer provider? | Requer API? | Requer storage/browser? | Estado complexo? | Testável agora? | Escolhido? | Motivo |
|---|---|---|---|---|---|---|---|---|
| `useAppStore` | Zustand | Não | Não | LocalStorage | Médio | Sim | ✅ SIM | É o core store da aplicação, dita comportamento de múltiplos componentes globais. Teste direto resolve cobertura significativa. |
| `useViewStore` | Zustand | Não | Não | Não | Simples | Sim | ✅ SIM | Simples, determinístico, ótimo para validar o padrão de teste de Zustand store. |
| `useCheckinManager` | Hook | Sim | Sim | Sim | Alto | Não | ❌ NÃO | Fortemente acoplado a Supabase mutations e hooks de query. Requer infra de teste pesada. |
| `useWorkoutManager` | Hook | Sim | Sim | Sim | Alto | Não | ❌ NÃO | Fortemente acoplado a persistência e timers/intervalos. Requer mock abrangente. |
