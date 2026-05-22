| Componente candidato | Requer provider? | Requer API? | Requer estado complexo? | Linhas/tamanho | Testável agora? | Escolhido? | Motivo |
|---|---|---|---|---:|---|---|---|
| ReadinessCard | Não | Não | Não | 37 | Sim | Sim | Puro, renderiza props condicionais. |
| AppUpdateBanner | Não | Não | Não (apenas mock local) | 48 | Sim | Sim | Simples, testa useEffect e eventos de UI. |
| ConnectivityBanner | Não | Não | Não (apenas mock local) | 71 | Sim | Sim | Testa listeners de window e render condicional de rede. |
| Dashboard | Sim | Sim | Sim | ~500 | Não | Não | Requer mocks profundos de DatabaseService e estado. |
| ActiveWorkoutView | Sim | Não | Sim | ~300 | Não | Não | Acoplado a timers, persistência e stores de workout. |
