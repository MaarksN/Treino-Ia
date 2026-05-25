# Controlled Technical Sprint 17 - Threshold Raise Decision

| Metrica | Threshold atual | Resultado real | Novo threshold | Margem | Decisao | Motivo |
|---|---:|---:|---:|---:|---|---|
| Statements | 27.3% | 31.88% | 30.5% | 1.38 pp | Raise | Raises the gate materially while staying below measured coverage. |
| Branches | 23.2% | 27.36% | 26.0% | 1.36 pp | Raise | Branch coverage has the lowest real result, so the raise keeps a wider conservative buffer. |
| Functions | 27.7% | 32.00% | 30.5% | 1.50 pp | Raise | Keeps a clear buffer below the real function result while raising above the old gate. |
| Lines | 27.2% | 31.85% | 30.5% | 1.35 pp | Raise | Tracks statements closely and remains below the measured line result. |

## Decision Notes

- No tests were changed to increase coverage.
- No exclusions were added.
- No reporters or providers were changed.
- CI remained unchanged.
- Every new threshold is greater than or equal to the current threshold.
- Every new threshold is below the measured real result from `coverage/coverage-summary.json`.
