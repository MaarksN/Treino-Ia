| Trilha | Bloqueador | Evidência | Próxima ação |
|---|---|---|---|
| Playwright / Browser E2E | Política/allowlist do registry bloqueia pacote crítico | `npm view @playwright/test version` e `npm install -D @playwright/test --package-lock-only` retornam `E403 403 Forbidden`. | Liberar `@playwright/test` e depois instalar browsers com `npx playwright install chromium` em CI/aprovado. |
| Vitest Coverage | Política/allowlist do registry bloqueia provider de coverage | `npm view @vitest/coverage-v8 version` e `npm install -D @vitest/coverage-v8 --package-lock-only` retornam `E403 403 Forbidden`. | Liberar `@vitest/coverage-v8` (ou provider aprovado equivalente) e criar script `test:coverage` com baseline real. |
