# Current State — Coverage Configuration

## Audit
- `vitest.config.ts`: Coverage is configured using the `v8` provider. The thresholds are set to baseline values from Sprint 03: Statements 25%, Branches 20%, Functions 25%, Lines 25%. Includes a timeout of 15000 to mitigate slow CI runs under coverage.
- `package.json`: Contains the script `"test:coverage": "vitest run --coverage"`. The version of `@vitest/coverage-v8` is `^4.1.7`.
- `.github/workflows/ci.yml`: The `coverage` job explicitly enforces coverage constraints. It runs `npm run test:coverage` and fails if thresholds are not met. The coverage report is uploaded as an artifact.

| Área | Arquivo | Estado atual | Risco | Ação nesta sprint |
|---|---|---|---|---|
| Vitest Config | `vitest.config.ts` | Thresholds baixos (Sprint 03) | Baixo | Elevar thresholds com base no resultado real atual |
| CI Pipeline | `.github/workflows/ci.yml` | Coverage gate ativado e obrigatório | Baixo | Preservar a configuração |
| NPM Scripts | `package.json` | Script `test:coverage` definido | Baixo | Manter script inalterado |