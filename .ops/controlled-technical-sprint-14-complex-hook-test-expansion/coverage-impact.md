# Controlled Technical Sprint 14 - Coverage Impact

| Metrica | Baseline Sprint 14 | Sprint 14 apos testes | Delta | Threshold atual | Passou? |
|---|---:|---:|---:|---:|---|
| Statements | 28.25 | 29.46 | +1.21 | 27.3 | Sim |
| Branches | 24.55 | 25.12 | +0.57 | 23.2 | Sim |
| Functions | 28.36 | 29.31 | +0.95 | 27.7 | Sim |
| Lines | 28.12 | 29.42 | +1.30 | 27.2 | Sim |

## Hook-level impact observado

| Area | Antes | Depois | Observacao |
|---|---:|---:|---|
| `src/hooks/useCheckinManager.ts` statements | 0.00 | 81.25 | Fluxos de query, save, recovery e erro cobertos |
| `src/hooks/useWorkoutManager.ts` statements | 0.00 | 91.11 | Fluxos online, offline e snapshot cobertos |
| `src/pages/Dashboard/hooks/useRestTimer.ts` statements | 0.00 | 100.00 | Timer, restore, stop/reset e expiracao cobertos |

Thresholds preservados:

```txt
Statements >= 27.3
Branches   >= 23.2
Functions  >= 27.7
Lines      >= 27.2
```

