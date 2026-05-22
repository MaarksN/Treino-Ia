# Evidence — Controlled Technical Sprint 06

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 06 — React Component Coverage Expansion  
**Base:** Commit d19ebb3 — Add React component test harness foundation

---

## 1. Objetivo

Expandir a cobertura de testes de componentes React usando o harness criado na Sprint 05. Selecionar 2 a 4 componentes puros ou com dependências fáceis de mockar, criar testes reais com asserts de renderização e interações, garantindo que E2E e o gate de coverage permaneçam passando.

---

## 2. Base auditada

| Item | Valor |
|---|---|
| Branch | `main` |
| Commit inicial | `d19ebb3` |
| Coverage antes | 26.21 / 22.86 / 26.30 / 25.99 |
| `.test.tsx` files | Existiam BottomNav e OnboardingTour |

---

## 3. Componentes candidatos

Uma listagem em `src/components/` retornou dezenas de componentes não testados. Focamos nos de menor tamanho e menor complexidade de dependências (evitando `Dashboard`, `ActiveWorkoutView`, etc.).
Foram avaliados: `ReadinessCard.tsx`, `AppUpdateBanner.tsx`, `ConnectivityBanner.tsx`, `WeeklyReportCard.tsx`.

---

## 4. Componentes escolhidos

1. **ReadinessCard** (37 linhas) — Renderização puramente baseada em props condicionais, dependência isolada `calculateReadiness`.
2. **AppUpdateBanner** (48 linhas) — Usa `useEffect` com listeners e triggers visuais condicionados ao callback. Mocks de PWA fáceis.
3. **ConnectivityBanner** (71 linhas) — Lida com `navigator.onLine` e listeners globais, testa UI dinâmica.

---

## 5. Testes criados

- `src/components/ReadinessCard.test.tsx` (2 testes)
- `src/components/AppUpdateBanner.test.tsx` (4 testes)
- `src/components/ConnectivityBanner.test.tsx` (4 testes)

Todos com asserts de UI, nenhum fake teste, mocks apropriados localizados.

---

## 6. Resultado dos testes específicos

```
npx vitest run src/components/ReadinessCard.test.tsx src/components/AppUpdateBanner.test.tsx src/components/ConnectivityBanner.test.tsx
```
**Resultado:** 10 testes passados. Duração: 1.87s.

---

## 7. Resultado de lint/typecheck/test/build/e2e/coverage

| Comando | Resultado |
|---|---|
| `git diff --check` | ✅ PASS |
| `npm run lint` | ✅ PASS |
| `npm run typecheck` | ✅ PASS (após incluir beforeEach no OnboardingTour.test.tsx da Sprint 05) |
| `npm test` | ✅ 155 files, 601 tests PASS (+3 files, +10 tests) |
| `npm run build` | ✅ PASS (1970 modules) |
| `npm run test:e2e` | ✅ 16/16 PASS (29.8s) |
| `npm run test:coverage` | ✅ PASS — todos limiares mantidos e crescidos |

---

## 8. Impacto na coverage

| Métrica | Sprint 05 | Sprint 06 | Delta | Threshold | Passou? |
|---|---:|---:|---:|---:|---|
| Statements | 26.21% | 26.55% | +0.34% | 25.00% | ✅ Sim |
| Branches | 22.86% | 22.98% | +0.12% | 20.00% | ✅ Sim |
| Functions | 26.30% | 26.63% | +0.33% | 25.00% | ✅ Sim |
| Lines | 25.99% | 26.34% | +0.35% | 25.00% | ✅ Sim |

---

## 9. Riscos remanescentes

| Risco | Status |
|---|---|
| Componentes grandes (Dashboard/Workout) | 🔴 Requerem mock profundo |
| Visual regression | 🔴 Fora do escopo |

---

## 10. Próxima ação

```
Controlled Technical Sprint 07 — React Component Coverage Expansion II
```

Ou, se OAuth/Billing estiverem autorizados com secrets:

```
Controlled Technical Sprint 07 — OAuth/Billing Sandbox Provisioning
```
