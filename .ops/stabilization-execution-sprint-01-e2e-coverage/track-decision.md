# Track Decision

| Track | Viable? | Test performed | Blocker | Selected? | Reason |
|---|---|---|---|---|---|
| Playwright / Browser E2E | Yes | `npm view @playwright/test version`, `npm install -D @playwright/test --package-lock-only`, `npm install -D @playwright/test`, `npx playwright install chromium`, `npm run test:e2e` | None in this environment | Yes | It satisfies the priority rule, dependency install worked, Chromium installed, and the browser smoke passed |
| Vitest Coverage | Yes for dependency resolution, not selected | `npm view @vitest/coverage-v8 version`, `npm install -D @vitest/coverage-v8 --package-lock-only` | Not blocked by registry now; not implemented because Playwright was viable and selected first | No | Coverage remains a follow-up risk; the package-lock-only test was reverted to avoid carrying an unselected provider/runtime change |

## Decision
Selected Track A - Playwright / Browser E2E.

## Justification
P12 and Post-Launch Stabilization listed E2E/Playwright as an accepted risk. The registry blocker from P10 is no longer present in this environment, browser install completed, and a minimal real browser suite can run without credentials, OAuth, billing, Supabase schema changes, or product features.
