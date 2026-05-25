# Controlled Technical Sprint 14 - Target Selection

| Candidato | Tipo | Storage/timers? | Stores? | Services mockaveis? | Supabase real? | Rede real? | Testavel agora? | Escolhido? | Motivo |
|---|---|---|---|---|---|---|---|---|---|
| `useCheckinManager` | Complex hook | Nao direto | Zustand | Sim, hook/service mocks | Nao | Nao | Sim | Sim | Cobre fluxo de check-in com query/mutation mockadas, store e side effects |
| `useWorkoutManager` | Complex hook | localStorage via contadores e offline path | Zustand | Sim, util/service mocks | Nao | Nao | Sim | Sim | Cobre conclusao de treino, snapshot, badges, offline queue e reset de store |
| `useRestTimer` | Timer hook | localStorage + fake timers | Nao | Sim, engine real ja isolado | Nao | Nao | Sim | Sim | Cobre restauracao, start/stop/reset e expiracao deterministica |
| `useTrainingSync` | Store/service hook | localStorage indireto | Zustand | Sim | Nao | Nao | Sim | Nao | Ja possui cobertura dedicada |
| `useProgressionSuggestion` | Store hook | Nao | Zustand | Regras locais | Nao | Nao | Sim | Nao | Fora do foco principal; PR #105 ja trouxe trilha de progressao |
| React Query hooks pequenos | Query/mutation hooks | Nao | Nao | Sim | Nao | Nao | Sim | Nao | Ja cobertos nas Sprints 11 e 12 |

## Decisao

Escolhidos 3 hooks:

- `useCheckinManager`
- `useWorkoutManager`
- `useRestTimer`

Racional:

- Eram alvos recomendados para Sprint 14.
- Tinham 0% de coverage direta antes da sprint.
- Permitem asserts reais sem rede, sem Supabase real, sem OAuth/Billing e sem runtime product change.
- Exercitam side effects controlados: Zustand, localStorage, fake timers, callbacks, telemetry e servicos mockados.

