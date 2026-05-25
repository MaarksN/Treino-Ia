# Controlled Technical Sprint 15 - Component Selection

| Componente | Tamanho | Requer provider? | Requer API? | Requer stores? | Requer hardware/browser? | Testável agora? | Escolhido? | Motivo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `Dashboard` | Grande | Sim | Sim, via `DatabaseService` | Não diretamente | Browser/local storage | Médio | Não | Blast radius alto para primeira fundação de harness. |
| `WorkoutDashboard` | Grande | Não obrigatório | IA/service mocks para fluxos avançados | Não | Timers/browser APIs possíveis | Médio | Não | Muito amplo para a sprint de fundação. |
| `ActiveWorkoutView` | Médio-alto | Não obrigatório, mas aceita harness | Não | Hooks mockáveis | `speechSynthesis` opcional, evitado com `voiceEnabled=false` | Alto | Sim | Grande o bastante, já tinha teste fraco, cobre interações reais sem rede. |
| `RecoveryReadinessSection` | Médio-alto | Não | Não | Não | localStorage | Médio | Não | Boa candidata futura, mas tem muitas subáreas persistidas. |
| `AnamnesisForm` | Médio | Não | Não | Não | Não | Alto | Não | Testável, porém menos complexo que o alvo escolhido. |
| `BiometricDashboard` | Médio | Não | Não | Não | localStorage | Médio | Não | Bom candidato futuro; menor impacto de harness. |

## Final Decision

Selected component:

- `src/components/ActiveWorkoutView.tsx`

Rationale:

- Uses multiple hooks, child components and modes.
- Can be tested with controlled props and `vi.mock`.
- No real Supabase/OAuth/Billing/Stripe/network needed.
- Existing placeholder-style tests were replaced with behavior assertions.
- Meaningful coverage gain for component and child interaction paths.
