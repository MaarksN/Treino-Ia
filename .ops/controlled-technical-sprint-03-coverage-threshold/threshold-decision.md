# Threshold Decision — Controlled Technical Sprint 03

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 03 — Coverage Threshold Definition  
**Fonte do baseline:** `coverage/coverage-summary.json` gerado na Sprint 02

## Baseline confirmado (JSON)

```json
"total": {
  "statements": { "total": 11446, "covered": 2983, "pct": 26.06 },
  "branches":   { "total":  8674, "covered": 1970, "pct": 22.71 },
  "functions":  { "total":  3402, "covered":  886, "pct": 26.04 },
  "lines":      { "total": 10076, "covered": 2603, "pct": 25.83 }
}
```

## Tabela de decisão

| Métrica | Baseline Sprint 02 | Threshold proposto | Margem | Motivo |
|---|---:|---:|---:|---|
| Statements | 26.06% | **25%** | -1.06% | Margem de arredondamento; evita flake por variação mínima de 1-2 arquivos |
| Branches | 22.71% | **20%** | -2.71% | Branches são mais voláteis por lógica condicional; margem maior é prudente |
| Functions | 26.04% | **25%** | -1.04% | Margem conservadora; próxima ao baseline sem forçar crescimento |
| Lines | 25.83% | **25%** | -0.83% | Margem mínima — baseline está muito próximo do threshold |

## Princípios aplicados

1. **Não exceder o baseline.** Todos os thresholds são ≤ baseline real.
2. **Margem de arredondamento.** Vitest usa `pct` com 2 casas decimais; thresholds inteiros criam margem natural.
3. **Branches mais conservativo.** Branches são afetadas por qualquer lógica condicional nova; margem -2.71% evita falsos negativos em CI.
4. **Sem exclusões novas.** Não foram excluídos arquivos para subir percentual — o threshold reflete cobertura real.

## Progressão planejada

| Sprint | Statements | Branches | Functions | Lines | Ação |
|---|---:|---:|---:|---:|---|
| Sprint 02 | baseline (26.06%) | baseline (22.71%) | baseline (26.04%) | baseline (25.83%) | Sem threshold |
| **Sprint 03** | **25%** | **20%** | **25%** | **25%** | **Gate conservador** |
| Sprint 04+ | 30% | 25% | 30% | 30% | Após adicionar testes de componente React |
| Sprint 05+ | 40% | 35% | 40% | 40% | Após E2E expandido + hooks testados |

## Exclusões novas esta sprint

**NENHUMA.** Exclusões mantidas idênticas às da Sprint 02:
- `src/**/*.test.ts(x)` — arquivos de teste
- `src/**/*.d.ts` — declarações de tipo
- `src/main.tsx` — entry point
- `src/vite-env.d.ts` — env declaration
- `tests/**` — diretório de testes
- `node_modules/**` — dependências
