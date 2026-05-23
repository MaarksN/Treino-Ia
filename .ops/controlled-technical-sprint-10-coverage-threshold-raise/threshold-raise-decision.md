# Threshold Raise Decision

| Métrica | Threshold anterior | Resultado atual | Novo threshold | Margem | Motivo |
|---|---:|---:|---:|---:|---|
| Statements | 25% | 27.47% | 27% | 0.47% | Elevação conservadora abaixo do resultado real para evitar falhas em CI devido a flutuação. |
| Branches | 20% | 23.49% | 23% | 0.49% | Elevação conservadora; não subido para 24% pois o resultado atual é 23.49%. |
| Functions | 25% | 27.80% | 27% | 0.80% | Margem segura garantindo crescimento sem flaky em CI. |
| Lines | 25% | 27.28% | 27% | 0.28% | Threshold conservador alinhado com Statements. |