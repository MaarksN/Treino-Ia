# Evidence — Controlled Technical Sprint 05

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 05 — React Component Test Harness Foundation  
**Base:** Commit f17a14d — Expand critical E2E flow coverage

---

## 1. Objetivo

Criar fundação real para testes de componentes React: setup file com jest-dom matchers, primeiro padrão de teste com `@testing-library/react`, e pelo menos 1 componente real testado com asserts reais. Sem instalar dependência nova, sem alterar runtime.

---

## 2. Base auditada

| Item | Valor |
|---|---|
| Branch | `main` |
| Commit inicial | `f17a14d` |
| Estado remoto | `Already up to date` |
| `@testing-library/react` | ^16.3.2 — já instalada, não usada para render |
| `@testing-library/jest-dom` | ^6.9.1 — já instalada, não importada |
| `jsdom` | ^29.1.1 — já instalado, configurado no vitest |
| `setupFiles` | Não existia |
| `.test.tsx` com render | **0** — nenhum componente React testado com render |

---

## 3. Estado atual do setup React test

Antes da sprint:
- Vitest configurado com `environment: 'jsdom'` e `globals: true`
- 4 arquivos `.test.tsx` existentes — todos testam dados/services, nenhum usa `render()`
- `@testing-library/react` e `@testing-library/jest-dom` instaladas mas não usadas
- Nenhum `setupFiles` configurado

---

## 4. Componente escolhido

**BottomNav** (63 lines) e **OnboardingTour** (116 lines):
- Puros presentacionais / estado local simples
- Sem API, sem OAuth, sem secrets
- Props claros: items, activeId, onChange / onComplete, onSkip
- Interações testáveis: click, navigation, callback
- Seletores acessíveis disponíveis: aria-label, role, text

---

## 5. Harness criado/reutilizado

**Reutilizado:** `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` — já no package.json.

**Criado:**
- `src/test/setup.ts` — importa `@testing-library/jest-dom/vitest`
- `vitest.config.ts` — adicionado `setupFiles: ['./src/test/setup.ts']`

**Nenhuma dependência nova instalada.**

---

## 6. Testes criados

### `src/components/BottomNav.test.tsx` — 6 testes
1. Renderiza items default (Início, Treino, Progresso, Perfil)
2. Renderiza items customizados
3. Tem landmark de navegação acessível
4. Renderiza todos os items como buttons
5. Chama onChange com item id ao clicar
6. Aplica estilo ativo no item selecionado

### `src/components/OnboardingTour.test.tsx` — 7 testes
1. Renderiza primeiro step com título de boas-vindas
2. Avança step ao clicar "Próximo"
3. Volta ao step anterior ao clicar "Anterior"
4. Mostra "Começar" no último step
5. Chama onComplete ao clicar "Começar"
6. Chama onSkip ao clicar "Pular"
7. Renderiza número correto de indicadores de step

---

## 7. Resultado do teste específico

```
npx vitest run src/components/BottomNav.test.tsx src/components/OnboardingTour.test.tsx

✓ src/components/BottomNav.test.tsx (6 tests) 221ms
✓ src/components/OnboardingTour.test.tsx (7 tests) 369ms

Test Files  2 passed (2)
     Tests  13 passed (13)
  Duration  2.31s
```

---

## 8. Resultado de lint/typecheck/test/build/e2e/coverage

| Comando | Resultado |
|---|---|
| `git diff --check` | ✅ PASS |
| `npm run lint` | ✅ PASS |
| `npm run typecheck` | ✅ PASS |
| `npm test` | ✅ 152 files, 591 tests PASS (+2 files, +13 tests) |
| `npm run build` | ✅ PASS (1970 modules) |
| `npm run test:e2e` | ✅ 16/16 PASS (29.0s) |
| `npm run test:coverage` | ✅ PASS — 26.21/22.86/26.30/25.99 (all above thresholds) |

---

## 9. Riscos remanescentes

| Risco | Status |
|---|---|
| 78+ componentes sem render test | 🟡 Ativo — fundação criada |
| Dashboard/workout/recovery | 🔴 Requer mocks |
| OAuth/Billing sandbox | 🔴 Fora do escopo |
| @testing-library/user-event | 🟡 Não instalada — fireEvent suficiente |
| Visual regression | 🔴 Fora do escopo |

---

## 10. Próxima ação

```
Controlled Technical Sprint 06 — React Component Coverage Expansion
```

Se OAuth disponível:

```
Controlled Technical Sprint 06 — OAuth/Billing Sandbox Provisioning
```
