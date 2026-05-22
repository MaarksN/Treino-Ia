# Evidence - Stabilization Execution Sprint 07

## 1. Objetivo

Auditar `style-src 'unsafe-inline'`, avaliar se a remocao e segura, aplicar hardening somente com evidencia suficiente ou documentar bloqueio/plano tecnico seguro.

## 2. Base auditada

| Item | Resultado |
|---|---|
| Branch | `main` |
| Top commit inicial | `9e04562 Add PWA offline cache smoke evidence` |
| Remote | `origin https://github.com/MaarksN/Treino-Ia.git` |
| `git pull` | `Already up to date.` |
| Working tree inicial | Somente `?? .ops/pr-41-review/` pre-existente e preservado |

Historico confirmado na `main`:

| Marco | Evidencia |
|---|---|
| Sprint 06 PWA Offline/Cache Browser Smoke | `9e04562 Add PWA offline cache smoke evidence` |
| Sprint 05 CSP Strict Mode with Browser Smoke | `7d10f58 Add CSP strict mode smoke evidence` |
| Hotfix CI E2E skip honesto | `0764422 ci: skip e2e when Playwright is unavailable` |

## 3. Uso de inline style encontrado

- 128 matches relacionados a inline style/style props/runtime styles.
- 41 arquivos com `style={{...}}`, `style={...}`, `contentStyle`, `itemStyle` ou `labelStyle`.
- Casos relevantes: `ActiveWorkout`, `WorkoutShareCard`, `AnalyticsDashboard`, `ExerciseCard`, `BiometricDashboard`, `HormonalCycleTracker`, `WearableSync`, `SleepTracker`, `ConsistencyHeatmap`, `ThemeSelector`, theme/accessibility runtime styles e `ExportPanel`.
- Browser smoke da rota inicial confirmou `inlineStyleElements=2` no DOM renderizado.

## 4. Decisao de style-src

`style-src 'unsafe-inline'` nao foi removido nesta sprint.

Motivo: o app depende de style attributes reais em UI produtiva, com risco alto de regressao visual se a remocao for feita sem refactor e smoke amplo. A estrategia escolhida foi manter a excecao com plano de migracao documentado.

## 5. Codigo/config alterado

Nenhum codigo de produto, runtime critico, schema, migration ou config CSP foi alterado. Esta sprint criou evidencia operacional e plano tecnico. `vercel.json` permanece com:

```txt
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
```

## 6. Browser smoke executado ou bloqueado

| Item | Resultado |
|---|---|
| Preview HTTP | PASS em `http://127.0.0.1:4173/` |
| Servidor CSP real | PASS em `http://127.0.0.1:4174/`, header CSP presente |
| App boot | PASS |
| Dashboard/rota inicial | PASS |
| Visual/layout basico | PASS/PARTIAL |
| Fonts/styles | PASS |
| Console/CSP violations | PASS, logs vazios |
| Motion/component matrix completa | BROWSER VISUAL SMOKE PARTIAL |

## 7. Comandos executados

```txt
git status --short
git branch --show-current
git log --oneline -20
git remote -v
git pull
git diff --check
npm run lint
npm run typecheck
npm test
npm run build
rg/Select-String inline style audit
rg runtime style risk audit
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
temporary local CSP server on http://127.0.0.1:4174/
browser open/evaluate/pageAssets/log/screenshot inspection
```

E2E NOT AVAILABLE / SKIPPED - risco ja aceito e tratado no Sprint 01.

## 8. Resultado real dos comandos

| Comando | Resultado |
|---|---|
| `git pull` | PASS, `Already up to date.` |
| `git diff --check` inicial | PASS |
| `npm run lint` inicial | PASS |
| `npm run typecheck` inicial | PASS |
| `npm test` inicial | PASS, 148 files / 570 tests |
| `npm run build` inicial | PASS, 1970 modules transformed |
| Inline style audit | 128 matches / 41 files |
| `npm run build` pre-smoke | PASS, 1970 modules transformed |
| `npm run preview` smoke | PASS, HTTP 200 |
| Local CSP server | PASS, HTTP 200 with CSP header |
| Browser app boot | PASS |
| Browser console/CSP logs | PASS, `[]` |
| `git diff --check` final | PASS |
| `npm run lint` final | PASS |
| `npm run typecheck` final | PASS |
| `npm test` final | PASS, 148 files / 570 tests |
| `npm run build` final | PASS, 1970 modules transformed |
| `git status --short` final pre-commit | Sprint 07 artifacts + `?? .ops/pr-41-review/` pre-existente |

## 9. Riscos remanescentes

- `style-src 'unsafe-inline'` permanece como risco aceito.
- Remocao strict ainda exige refactor de inline styles e smoke visual amplo.
- Motion/Recharts/export/share-card precisam de validacao especifica.
- E2E/Coverage continuam indisponiveis/skipped.
- OAuth/Billing sandbox continuam pendentes.
- PWA offline browser real continua pendente.
- Rollback real de deploy provider continua pendente.

## 10. Proxima acao

Stabilization Execution Sprint 08 - Final Accepted Risk Burn-down / Release Closure Report.
