# P10 Current Test Setup

| Área | Existe? | Arquivo/script | Status | Observação |
|---|---|---|---|---|
| Unit/integration tests (Vitest) | Sim | `package.json` (`test`), `vitest.config.ts` | Ativo | Suíte existente executa `vitest run` com 552 testes passando. |
| Coverage script | Não | N/A | Ausente | Não existe `test:coverage` no estado inicial. |
| Coverage provider (Vitest) | Não | `package-lock.json` / `npm ls @vitest/coverage-v8` | Bloqueado | Provider não instalado e instalação retornou HTTP 403 por política do registry. |
| Playwright dependency | Não | `npm ls @playwright/test` / `npx playwright --version` | Bloqueado | Pacote Playwright indisponível no ambiente (HTTP 403). |
| Playwright config | Não | `playwright.config.ts` | Ausente | Nenhuma configuração E2E browser detectada. |
| Browser E2E tests | Não | `tests/e2e/*.spec.ts` | Ausente | Não há suíte Playwright real neste repositório. |
