# Evidência Operacional — P2 E2E / Coverage / Production QA

## 1. Objetivo
Criar base realista de QA de produção para fluxos críticos sem introduzir features novas.

## 2. Setup encontrado
- Runner: Vitest.
- Scripts existentes: lint/typecheck/test/build.
- Sem Playwright configurado.
- Sem script `test:coverage`.

## 3. Setup criado/ajustado
- Criados artefatos operacionais em `.ops/p2-e2e-coverage-production-qa/`.
- Estratégia definida: integration-first como gate atual.
- Playwright **não adotado** em P2 por priorização de estabilidade + ausência de requisito bloqueante imediato.

## 4. Fluxos cobertos
- App boot/dashboard bootstrap.
- Onboarding/session local.
- Active workout.
- Recovery (pain/caffeine/readiness).
- IA fallback + safe parser.
- PWA cache policy.
- Segurança UI/telemetry redaction.
- Gamificação (eventos e idempotência em nível de serviço/API).

## 5. Fluxos não cobertos e motivo
- E2E browser com Playwright não implementado nesta fase.
- Billing/OAuth reais fora de escopo por dependerem de credenciais/provedores externos.

## 6. Scripts adicionados
- Nenhum script permanente adicionado (coverage bloqueado por política de dependência).

## 7. Resultado real dos comandos
- `npm run lint`: OK.
- `npm run typecheck`: OK.
- `npm test`: OK (140 files / 534 tests).
- `npm run build`: OK.
- `npx vitest run --coverage`: FAIL (missing `@vitest/coverage-v8`).
- `npm i -D @vitest/coverage-v8`: FAIL (403 policy).

## 8. Próxima fase recomendada
P3 Architecture Decomposition com adoção progressiva de Playwright smoke e coverage percentual após liberação da dependência de provider.
