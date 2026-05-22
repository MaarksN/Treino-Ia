# Flow Selection — Controlled Technical Sprint 04

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 04 — E2E Critical Flow Expansion

---

## Critérios de seleção

Um fluxo só é elegível se:

1. **Determinístico** — resultado sempre o mesmo, sem randomness.
2. **Sem secrets** — não requer API keys, tokens, ou credenciais reais.
3. **Sem pagamento real** — não executa checkout ou cobrança.
4. **Sem OAuth real** — não requer autenticação externa.
5. **Sem dependência externa obrigatória** — não precisa de internet para passar.

---

## Avaliação de fluxos candidatos

| Fluxo candidato | Requer secret? | Requer internet externa? | Determinístico? | Escolhido? | Motivo |
|---|---|---|---|---|---|
| **App boot (HTTP 200, #root)** | ❌ Não | ❌ Não | ✅ Sim | ✅ Já existente | Smoke test da Sprint 02 — mantido |
| **Onboarding tour (7 steps)** | ❌ Não | ❌ Não | ✅ Sim | ✅ **SIM** | Tour é localStorage-driven; todas as 7 etapas navegáveis; skip e back testáveis |
| **Registration form (local)** | ❌ Não | ❌ Não | ✅ Sim | ✅ **SIM** | Formulário local sem OAuth; persiste em localStorage; sem chamada externa |
| **Navigation/routing** | ❌ Não | ❌ Não | ✅ Sim | ✅ **SIM** | Rota raiz e rota desconhecida testáveis sem backend; redirect determinístico |
| **Security/secret leak** | ❌ Não | ❌ Não | ✅ Sim | ✅ **SIM** | Verifica ausência de tokens/keys no HTML renderizado — estático |
| **PWA meta tags** | ❌ Não | ❌ Não | ✅ Sim | ✅ **SIM** | Meta tags são estáticas no index.html; não dependem de runtime |
| **HTML semantics (lang, charset)** | ❌ Não | ❌ Não | ✅ Sim | ✅ **SIM** | Atributos HTML estáticos — determinístico |
| **JS error detection (pageerror)** | ❌ Não | ❌ Não | ✅ Sim | ✅ **SIM** | Captura ReferenceError/TypeError no load — sem falso positivo com filtro |
| Dashboard UI completo | ❌ Não | ❌ Não | ⚠️ Parcial | ❌ **NÃO** | Requer profile+plan calculados; estado complexo demais sem mock de DatabaseService; risco de fragilidade |
| Active workout UI | ❌ Não | ❌ Não | ⚠️ Parcial | ❌ **NÃO** | Requer profile+plan+activeDayIndex; dependência de estado interno muito profunda |
| Recovery/readiness UI | ❌ Não | ❌ Não | ⚠️ Parcial | ❌ **NÃO** | Componente condicional — só aparece com profile+plan e history |
| AI fallback/error-safe UI | ❌ Não | ❌ Não | ⚠️ Parcial | ❌ **NÃO** | Componentes de IA são condicionais, requerem profile — frágil sem harness |
| Billing/paywall guard | ⚠️ Parcial | ❌ Não | ⚠️ Parcial | ❌ **NÃO** | MonetizationHub é condicional (profile+plan); sem billing real — pouco valor |
| PWA/offline banner | ❌ Não | ❌ Não | ⚠️ Parcial | ❌ **NÃO** | Service worker não funciona em preview mode; teste seria enganoso |
| CSP console smoke | ❌ Não | ❌ Não | ⚠️ Parcial | ❌ **NÃO** | CSP header não é setado pelo Vite preview; teste real requer servidor real |
| Supabase auth (signIn/signUp) | ✅ **SIM** | ✅ **SIM** | ❌ Não | ❌ **NÃO** | Requer Supabase URL real + anon key real — fora do escopo |
| Stripe checkout | ✅ **SIM** | ✅ **SIM** | ❌ Não | ❌ **NÃO** | Requer Stripe API — fora do escopo |

---

## Resumo

| Categoria | Escolhidos | Não escolhidos | Motivo de exclusão |
|---|---|---|---|
| Boot/smoke | 1 (existente) | 0 | — |
| Onboarding | 1 (novo) | 0 | — |
| Registration | 1 (novo) | 0 | — |
| Navigation/routing | 1 (novo) | 0 | — |
| Security | 1 (novo) | 0 | — |
| PWA/HTML | 1 (novo) | 0 | — |
| Dashboard UI | 0 | 1 | Estado complexo, sem mock de DB |
| Workout/Recovery/AI | 0 | 3 | Dependência de profile+plan |
| Billing/paywall | 0 | 1 | Condicional, sem billing real |
| PWA/offline | 0 | 1 | Service worker não funciona em preview |
| CSP | 0 | 1 | CSP header não setado por Vite |
| OAuth/Stripe | 0 | 2 | Requer secrets reais |
