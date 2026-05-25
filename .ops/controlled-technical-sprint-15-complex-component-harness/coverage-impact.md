# Controlled Technical Sprint 15 - Coverage Impact

## Global Coverage

| Metric | Initial | After Sprint 15 implementation | Delta |
| --- | ---: | ---: | ---: |
| Statements | 29.46% | 30.44% | +0.98 |
| Branches | 25.13% | 26.30% | +1.17 |
| Functions | 29.31% | 30.36% | +1.05 |
| Lines | 29.42% | 30.43% | +1.01 |

## Target Coverage

| File | Before | After | Notes |
| --- | --- | --- | --- |
| `src/components/ActiveWorkoutView.tsx` | 0% all metrics | 75.96% statements, 66.66% branches, 78.57% functions, 82.75% lines | Real render, interactions, plan/day modes and progression card behavior covered. |
| `src/components/SetTracker.tsx` | 0% all metrics | 66.66% statements, 73.07% branches, 61.53% functions, 64.70% lines | Covered through `ActiveWorkoutView` interaction path. |

## Thresholds

No thresholds were changed.

Configured thresholds remain:

```txt
Statements >= 27.3%
Branches >= 23.2%
Functions >= 27.7%
Lines >= 27.2%
```
