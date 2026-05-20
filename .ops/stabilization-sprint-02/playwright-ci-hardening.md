# Playwright CI Hardening

## CI Strategy
Add a blocking `e2e` job to `.github/workflows/ci.yml` with these properties:

| Requirement | Implementation |
|---|---|
| Use `npm ci` | `Install` step runs `npm ci` |
| Install browsers in Linux CI | `npx playwright install --with-deps chromium` |
| Run real E2E | `npm run test:e2e` |
| Do not hide failures | No `continue-on-error` |
| Collect failure artifacts | `actions/upload-artifact@v4` uploads `playwright-report/` and `test-results/` on failure |
| Avoid real secrets | Uses placeholder Supabase env only, matching existing build convention |
| App starts locally | Playwright `webServer` starts `npm run dev` |
| Cache safely | npm cache via `setup-node`; Playwright browser cache keyed by OS and `package-lock.json` |

## Playwright Config Hardening
| Area | Status |
|---|---|
| `webServer` | Configured for `npm run dev`, URL `http://127.0.0.1:3000`, 120s timeout |
| `baseURL` | Configured as `http://127.0.0.1:3000` |
| Timeout | 30s test timeout, 10s expect timeout |
| Retries | `2` in CI, `0` locally |
| Workers | `1` in CI for deterministic smoke execution |
| `forbidOnly` | Enabled in CI |
| Reporter | `list` plus HTML report under `playwright-report` |
| Trace | `on-first-retry` |
| Screenshot | `only-on-failure` |
| Video | `retain-on-failure` |
| External data | None required by current E2E tests |

## Why This Is Not Fake E2E
- CI will install a real Chromium browser through Playwright.
- The tests execute against a local Vite app started by Playwright.
- The job is blocking and does not use `continue-on-error`.
- Artifacts are retained only for debugging failures and do not replace pass/fail status.

## Remaining Gap
This sprint can make CI ready and commit the workflow, but the actual GitHub-hosted run result is only proven after the pushed commit runs in GitHub Actions.
