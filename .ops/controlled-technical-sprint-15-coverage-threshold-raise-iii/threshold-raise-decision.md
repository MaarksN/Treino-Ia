# Controlled Technical Sprint 15 - Threshold Raise Decision

| Metrica | Threshold atual | Resultado real | Novo threshold | Margem | Decisao | Motivo |
|---|---:|---:|---:|---:|---|---|
| Statements | 27.3 | 29.46 | 29.0 | 0.46 | Elevar | Ganha gate real mantendo margem contra arredondamento |
| Branches | 23.2 | 25.13 | 24.8 | 0.33 | Elevar | Branches subiu apos Sprint 14; margem mantida acima de 0.30 |
| Functions | 27.7 | 29.31 | 29.0 | 0.31 | Elevar | Eleva sem ultrapassar resultado real |
| Lines | 27.2 | 29.42 | 29.0 | 0.42 | Elevar | Mantem folga conservadora |

## Politica aplicada

- Novo threshold sempre abaixo do coverage real medido.
- Nenhum threshold reduzido.
- Nenhum threshold acima do resultado real.
- Margem minima mantida: `0.31` p.p.
- Nenhuma exclusao nova.
- Nenhuma mudanca de CI, script ou dependencia.

