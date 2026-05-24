# Threshold Raise Decision - Controlled Technical Sprint 13

| Metrica | Threshold atual | Resultado real | Novo threshold | Margem | Decisao | Motivo |
|---|---:|---:|---:|---:|---|---|
| Statements | 27.00 | 27.67 | 27.30 | 0.37 | Raise | Inteiro `28` ficaria acima do resultado real; decimal sobe o gate mantendo margem segura. |
| Branches | 23.00 | 23.59 | 23.20 | 0.39 | Raise | Branch coverage segue baixa; aumento pequeno preserva folga contra arredondamento. |
| Functions | 27.00 | 28.09 | 27.70 | 0.39 | Raise | Inteiro `28` teria margem de apenas 0.09 pp; decimal evita aggressividade. |
| Lines | 27.00 | 27.52 | 27.20 | 0.32 | Raise | Inteiro `28` ficaria acima do resultado real; decimal sobe o gate com margem. |

## Decision Notes

Integer-only raises were not safe for this baseline. The selected decimal thresholds are all:

```txt
above the previous threshold
below the measured coverage
at least 0.30 percentage points below the measured coverage
```

No coverage include/exclude/provider/reporter settings were changed.
