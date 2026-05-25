# Controlled Technical Sprint 14 - Coverage Impact

## Global Coverage

| Metric | Before Sprint 14 | After Sprint 14 | Delta |
| --- | ---: | ---: | ---: |
| Statements | 30.06% | 31.25% | +1.19 |
| Branches | 26.41% | 26.98% | +0.57 |
| Functions | 30.18% | 31.12% | +0.94 |
| Lines | 30.08% | 31.35% | +1.27 |

The isolated Sprint 14 hook-test coverage gate produced the table above.

Final full validation later reported:

| Metric | Final full validation |
| --- | ---: |
| Statements | 31.38% |
| Branches | 27.06% |
| Functions | 31.15% |
| Lines | 31.49% |

The final full validation ran in a dirty worktree with unrelated local changes still present, so the isolated Sprint 14 impact is the conservative attribution.

## Target Coverage

| Target | Before | After | Notes |
| --- | --- | --- | --- |
| `src/hooks/useCheckinManager.ts` | 0% all metrics | 81.25% statements, 62.5% branches, 80% functions, 85% lines | Query apply, refresh, save success, save error and recovery conversion covered. |
| `src/hooks/useWorkoutManager.ts` | 0% all metrics | 91.11% statements, 76% branches, 76.92% functions, 90.24% lines | Completion, offline queue, engagement refresh and snapshot error covered. |
| `src/pages/Dashboard/hooks/useRestTimer.ts` | 0% all metrics | 100% statements, 93.75% branches, 100% functions, 100% lines | Start, hydrate, invalid persisted state, reset, stop and expiry covered. |

## Thresholds

No coverage thresholds were changed.

Current configured thresholds remain:

```txt
Statements >= 27.3%
Branches >= 23.2%
Functions >= 27.7%
Lines >= 27.2%
```
