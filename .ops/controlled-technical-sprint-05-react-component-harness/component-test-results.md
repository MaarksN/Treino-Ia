# Component Test Results — Controlled Technical Sprint 05

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 05 — React Component Test Harness Foundation  
**Comando:** `npx vitest run src/components/BottomNav.test.tsx src/components/OnboardingTour.test.tsx`  
**Duração:** 2.31s

---

## Resultados por teste

| Teste | Resultado | Tempo | Observação |
|---|---|---|---|
| **BottomNav** | | | |
| renders default navigation items | ✅ PASS | <1ms | Verifica 4 labels: Início, Treino, Progresso, Perfil |
| renders custom items when provided | ✅ PASS | <1ms | Props customizados + assert negativo |
| has accessible navigation landmark | ✅ PASS | <1ms | `aria-label="Navegação móvel"` |
| renders all items as buttons | ✅ PASS | <1ms | 4 buttons via `getAllByRole` |
| calls onChange with item id when clicked | ✅ PASS | <1ms | `vi.fn()` + `fireEvent.click` |
| applies active styling to the active item | ✅ PASS | <1ms | CSS class `text-brand-neon` verificada |
| **OnboardingTour** | | | |
| renders the first step with welcome title | ✅ PASS | <1ms | Texto: "Bem-vindo ao Treino App 💪" |
| advances to next step when clicking "Próximo" | ✅ PASS | <1ms | Step 1 → Step 2: "IA Personalizada" |
| goes back to previous step when clicking "Anterior" | ✅ PASS | <1ms | Forward + back navigation |
| shows "Começar" button on the last step | ✅ PASS | <1ms | 6 clicks → Step 7: "Pronto para começar!" |
| calls onComplete when "Começar" is clicked | ✅ PASS | <1ms | `vi.fn()` callback verification |
| calls onSkip when "Pular" is clicked | ✅ PASS | <1ms | `vi.fn()` callback verification |
| renders correct number of step indicators | ✅ PASS | <1ms | 7 step dots via DOM query |

---

## Resumo

| Métrica | Valor |
|---|---|
| **Test files** | 2 |
| **Testes** | 13 |
| **Passaram** | 13 |
| **Falharam** | 0 |
| **Flaky** | 0 |
| **Duração** | 2.31s |

---

## Impacto no test suite global

| Métrica | Antes (Sprint 04) | Depois (Sprint 05) | Delta |
|---|---|---|---|
| Test files | 150 | **152** | +2 |
| Tests | 578 | **591** | +13 |
| Componentes com render test | 0 | **2** | +2 |
