# P2 E2E / Coverage / Production QA — Estratégia Inicial

## 1) Fluxos críticos
1. App boot e carregamento de dashboard.
2. Onboarding/session bootstrap via localStorage.
3. Active Workout (abrir treino, preencher métricas, timer, concluir).
4. Recovery (dor, cafeína, readiness).
5. IA (fallback em falha + parser seguro para JSON inválido).
6. PWA (política de cache, especialmente não cachear `/api/*`).
7. Segurança UI (bloqueio de URL inválida no player e redação de telemetria).
8. Gamificação (idempotência de recompensa/eventos repetidos).

## 2) O que será E2E agora
- **Não adotado nesta fase**: Playwright E2E browser full-flow.
- Motivo: projeto já tem base ampla de integração/unit (534 testes) cobrindo os fluxos críticos sem credenciais reais.
- Decisão de QA gate atual: manter **Vitest integration-first** com evidência operacional.

## 3) O que será unit/integration
- Fluxos críticos cobertos por testes existentes em `tests/`, `src/**/*.test.ts` e `api/**/*.test.ts`.
- Mantemos integração para componentes de domínio (workout, recovery, AI guardrails, API security, cache policy PWA).

## 4) O que fica fora por backend/credenciais
- Billing real (Stripe live checkout).
- OAuth real com provedores externos.
- Fluxos online com Supabase real.

## 5) Onboarding/session
- Estratégia: validar bootstrap de sessão/onboarding via estado local seguro (`localStorage`) sem credencial real.
- Não usar token real e não dependemos de backend remoto nos testes críticos.

## 6) Porta do Vite
- `npm run dev` já fixa porta `3000`.
- Caso Playwright seja adotado no futuro, `baseURL` deve apontar para `http://127.0.0.1:3000` com `webServer` usando script `npm run dev`.

## 7) localStorage/test seed
- Estratégia atual usa fixtures deterministicamente em testes de integração.
- Se E2E browser for habilitado em P3, criar `tests/e2e/helpers/testSeed.ts` e `sessionState.ts` para bypass explícito e auditável.

## 8) Riscos de flakiness
- Dependência de horário/timers em workout/recovery.
- Dependência de estado global/localStorage entre suítes.
- Mitigação atual: testes determinísticos, mocks explícitos, reset de estado por suíte.

## 9) Próxima evolução
- P3: Introduzir Playwright com smoke journeys (boot, onboarding bypass, active workout mínimo) quando pipeline suportar instalação das dependências necessárias e browsers.
