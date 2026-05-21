# Evidence

## Objective
Configurar foundation real de Playwright E2E integrada ao CI existente, com teste mínimo real para a home page.

## CI Failure Investigated
- Workflow run analisado: `26198857435` (`CI`, conclusão `failure`).
- Job com falha: `e2e`.
- Erro confirmado nos logs: `npm error Missing script: "test:e2e"`.

## Files Changed
- `playwright.config.ts`
- `e2e/example.spec.ts`
- `.gitignore`
- `.ops/playwright-e2e-setup/evidence.md`

## Playwright Scope
- Script `test:e2e` já presente em `package.json` apontando para `playwright test`.
- Dependência `@playwright/test` já presente em `devDependencies`.
- Configuração Playwright ajustada para executar specs reais em ambos diretórios:
  - `tests/e2e/**/*.spec.ts`
  - `e2e/**/*.spec.ts`
- Teste real mínimo criado em `e2e/example.spec.ts`:
  - navega para `/`
  - valida `title` com padrão `treino|vite|react`.

## Git Ignore
- Adicionados artefatos/cache Playwright:
  - `.cache/ms-playwright/`
  - `.playwright/`
- Já estavam ignorados:
  - `playwright-report/`
  - `test-results/`

## Local Validation
- Baseline antes das mudanças:
  - `npm run lint`: PASS
  - `npm run typecheck`: PASS
  - `npm test`: PASS
  - `npm run build`: PASS
- Após mudanças:
  - `npm run test:e2e`: PASS
  - `npm run lint`: PASS
  - `npm run typecheck`: PASS
  - `npm run build`: PASS

## Scope Control
- Sem alteração de schema.
- Sem alteração de business logic.
- Sem remoção de testes existentes.
- Sem mocks/fakes para E2E.
