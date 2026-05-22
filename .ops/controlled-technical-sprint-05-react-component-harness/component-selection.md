# Component Selection — Controlled Technical Sprint 05

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 05 — React Component Test Harness Foundation

---

## Critérios de seleção

| Critério | Obrigatório? |
|---|---|
| Não requer secret | ✅ Sim |
| Não requer OAuth | ✅ Sim |
| Não requer Billing real | ✅ Sim |
| Não requer API externa | ✅ Sim |
| Tem comportamento visível testável | ✅ Sim |
| Permite assert real de texto/role/interação | ✅ Sim |
| Baixo risco de refactor amplo | ✅ Sim |
| Componente pequeno/presentacional | Preferido |

---

## Avaliação de componentes candidatos

| Componente candidato | Requer provider? | Requer API? | Requer estado complexo? | Testável agora? | Escolhido? | Motivo |
|---|---|---|---|---|---|---|
| **BottomNav** (63 lines) | ❌ Não | ❌ Não | ❌ Não — props only | ✅ Sim | ✅ **SIM** | Puro presentacional, props simples, interação via onClick, aria-label, default items — ideal para fundação |
| **OnboardingTour** (116 lines) | ❌ Não | ❌ Não | ❌ Não — useState local | ✅ Sim | ✅ **SIM** | Navegação de 7 steps, callbacks onComplete/onSkip, back/forward — bom para testar interação com estado |
| RegistrationForm (90 lines) | ❌ Não | ❌ Não | ⚠️ localStorage | ✅ Sim | ❌ Não | Viável, mas localStorage mock adiciona complexidade; BottomNav/OnboardingTour são mais puros para fundação |
| AppUpdateBanner (1.5KB) | ❌ Não | ❌ Não | ⚠️ Service worker | ⚠️ Parcial | ❌ Não | Depende de SW API — frágil em jsdom |
| ConnectivityBanner (2.1KB) | ❌ Não | ❌ Não | ⚠️ navigator.onLine | ⚠️ Parcial | ❌ Não | Depende de browser API — frágil |
| ReadinessCard (1.5KB) | ❌ Não | ❌ Não | ⚠️ Props complexos | ✅ Sim | ❌ Não | Viável mas props requerem dados de recovery/readiness |
| Dashboard (815 lines) | ❌ Não | ✅ **SIM** DatabaseService | ✅ **SIM** | ❌ Não | ❌ Não | God component — muito grande, muitas dependências |
| ActiveWorkoutView | ❌ Não | ❌ Não | ✅ **SIM** | ❌ Não | ❌ Não | Requer activeDraft, plan, day — estado complexo |
| AnamnesisForm (20KB) | ❌ Não | ❌ Não | ⚠️ Grande | ⚠️ Parcial | ❌ Não | 20KB — muito grande para fundação; melhor em sprint futura |
| BiometricDashboard | ❌ Não | ⚠️ Hardware | ✅ **SIM** | ❌ Não | ❌ Não | Requer hardware APIs |
| BillingCenter | ⚠️ Stripe | ✅ **SIM** | ✅ **SIM** | ❌ Não | ❌ Não | Requer Stripe/billing — fora do escopo |

---

## Resumo

| Status | Componentes |
|---|---|
| ✅ Escolhidos | **BottomNav**, **OnboardingTour** |
| ❌ Não escolhidos | RegistrationForm, AppUpdateBanner, ConnectivityBanner, ReadinessCard, Dashboard, ActiveWorkoutView, AnamnesisForm, BiometricDashboard, BillingCenter |
| Motivo geral de exclusão | Estado complexo, dependência de APIs/hardware, ou componente muito grande para fundação |
