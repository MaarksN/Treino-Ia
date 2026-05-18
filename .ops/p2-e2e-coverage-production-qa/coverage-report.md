# Coverage Report — P2

## Situação atual
- Framework de testes: Vitest.
- Execução completa atual: **140 arquivos / 534 testes aprovados**.
- Cobertura de fluxos críticos foi validada por testes unit/integration existentes.

## Tentativa de coverage automatizado
- `npm run test:coverage` não existia no baseline.
- `npx vitest run --coverage` falhou por ausência de provider `@vitest/coverage-v8`.
- Tentativa de instalar `@vitest/coverage-v8` bloqueada por política (HTTP 403 no registry).

## Decisão P2
- Não forçar configuração parcial de coverage que quebraria CI local.
- Manter gate com `npm test` enquanto desbloqueio de dependência é tratado.

## Próxima ação recomendada
1. Liberar `@vitest/coverage-v8` no registry/política.
2. Adicionar script oficial `test:coverage`.
3. Definir baseline mínimo para serviços críticos (AI, recovery, workout, segurança API/PWA).
