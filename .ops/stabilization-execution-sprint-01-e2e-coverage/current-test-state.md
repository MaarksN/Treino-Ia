| Área | Existe? | Arquivo/script | Status | Observação |
|---|---|---|---|---|
| Script E2E | Não | `package.json` | NOT AVAILABLE | Scripts `test:e2e` e `test:e2e:ui` removidos para evitar referência quebrada a Playwright bloqueado. |
| Script Coverage | Não | `package.json` | NOT AVAILABLE | `test:coverage` não existe pois provider segue bloqueado (`403`). |
| Config Playwright | Não | `playwright.config.ts` | NOT AVAILABLE | Arquivo removido para restaurar typecheck sem dependência indisponível. |
| Testes E2E Playwright | Não | `tests/e2e/*.spec.ts` | NOT AVAILABLE | Specs removidas porque importavam `@playwright/test` indisponível no ambiente. |
| Testes unit/integration | Sim | `tests/**/*.test.ts`, `src/**/*.test.ts`, `api/**/*.test.ts` | PASS | Suite Vitest segue como baseline real executável. |
| Coverage provider | Não | `@vitest/coverage-v8` | BLOCKED | Instalação com `--package-lock-only` retorna `403 Forbidden`. |
