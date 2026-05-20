# Current Test State

## Summary
The repository started this sprint with Vitest unit/integration coverage in place, but without operational Playwright E2E or coverage scripts. Sprint 01 added a real Playwright foundation while leaving coverage as a remaining risk.

| Area | Exists? | File/script | Status | Observation |
|---|---|---|---|---|
| Unit/integration test runner | Yes | `npm test` -> `vitest run` | PASS | Initial and final runs passed with 143 test files and 552 tests |
| Vitest config | Yes | `vitest.config.ts` | ACTIVE | Uses `jsdom`, globals, and includes `tests/**/*.test.ts`, `src/**/*.test.ts`, `src/**/*.test.tsx`, `api/**/*.test.ts` |
| Vite config | Yes | `vite.config.ts` | ACTIVE | React + Tailwind Vite setup; dev server script uses port 3000 |
| E2E script | Yes | `npm run test:e2e` -> `playwright test` | ADDED | Added in this sprint and executed successfully |
| E2E UI script | Yes | `npm run test:e2e:ui` -> `playwright test --ui` | ADDED | Added for local debugging only; not required for CI gate |
| Playwright config | Yes | `playwright.config.ts` | ADDED | Uses `webServer`, `baseURL` `http://127.0.0.1:3000`, Chromium, trace on first retry, screenshot on failure |
| Browser E2E tests | Yes | `tests/e2e/app-smoke.spec.ts`, `tests/e2e/security-smoke.spec.ts` | ADDED | Covers app boot, known dashboard route, hostile URL reflection, and music embed service boundary |
| Coverage script | No | `npm run test:coverage` | NOT AVAILABLE | Not implemented because Playwright was viable and selected by priority |
| Coverage provider | No direct dependency | `@vitest/coverage-v8` | NOT INSTALLED | Registry/install test was viable with `--package-lock-only`, then reverted because not selected |
| Coverage output ignore | Yes | `.gitignore` -> `coverage/` | ACTIVE | Already ignored before sprint |
| Playwright output ignore | Yes | `.gitignore` -> `playwright-report/`, `test-results/` | ADDED | Prevents generated reports/artifacts from being committed |
| Existing test files | Yes | `api`, `src`, `tests` | ACTIVE | Local audit found 143 Vitest files executed by `npm test` |
| Existing pseudo-E2E smoke | Yes | `tests/qualityCiDataArchitecture.e2eSmoke.test.ts` | ACTIVE | Runs under Vitest; not browser E2E |

## Search Results
- `npm run`: showed no `test:e2e` or `test:coverage` before implementation.
- `Get-ChildItem -Recurse -File | Where-Object { $_.Name -match "playwright|\.spec\.ts|\.e2e\.ts|\.test\.ts" }`: returned existing local tests and vendor tests under `node_modules`; local executable suite remains governed by Vitest include patterns and the new Playwright `testDir`.
- `rg` over `package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`, `.gitignore`: found `coverage/` ignored and Vitest optional peer references, but no operational coverage script or direct provider dependency.
