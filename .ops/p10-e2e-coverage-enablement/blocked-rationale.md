# P10 Blocked Rationale

| Trilha | Bloqueador | Evidência | Próxima ação |
|---|---|---|---|
| Playwright / Browser E2E | Política de registry bloqueia pacote `playwright` | `npx playwright --version` => `npm ERR! 403 Forbidden - GET https://registry.npmjs.org/playwright` | Liberar allowlist para `playwright` e `@playwright/test`; depois executar instalação e smoke E2E mínimo. |
| Vitest Coverage | Política de registry bloqueia pacote `@vitest/coverage-v8` | `npm install -D @vitest/coverage-v8` => `npm ERR! 403 Forbidden - GET https://registry.npmjs.org/@vitest%2fcoverage-v8` | Liberar allowlist para `@vitest/coverage-v8` (ou provider alternativo aprovado) e habilitar `test:coverage` com thresholds iniciais. |
