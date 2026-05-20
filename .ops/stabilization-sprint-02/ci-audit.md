# CI Audit

## Files Reviewed
- `.github/workflows/ci.yml`
- `.github/workflows/lighthouse.yml`
- `.github/workflows/vercel-deploy.yml`
- `package.json`
- `playwright.config.ts`
- `tests/e2e/app-smoke.spec.ts`
- `tests/e2e/security-smoke.spec.ts`

## Workflow Inventory
| Workflow | Purpose | Current status |
|---|---|---|
| `.github/workflows/ci.yml` | Main CI for pull requests and pushes to `main`/`master` | Primary workflow to harden |
| `.github/workflows/lighthouse.yml` | Lighthouse CI on PR paths and manual dispatch | Not selected for E2E |
| `.github/workflows/vercel-deploy.yml` | Conditional Vercel production deploy when secrets exist | Not selected for E2E |

## Main CI Before Hardening
| Audit item | Exists? | Evidence | Gap |
|---|---|---|---|
| Workflow running lint/typecheck/test/build | Yes | `lint`, `typecheck`, `test`, `build` jobs in `ci.yml` | None for base gates |
| `npm ci` | Yes | Every base job has an `Install` step using `npm ci` | None |
| Node setup | Yes | `actions/setup-node@v4`, Node 22 | None |
| npm cache | Yes | `cache: npm` in setup-node | None |
| Playwright browser install | No | No `npx playwright install` in CI before this sprint | Add Chromium install |
| `npm run test:e2e` | No | No E2E job or step before this sprint | Add real E2E execution |
| Playwright artifacts upload | No | No `actions/upload-artifact` for `playwright-report/` or `test-results/` | Add failure artifact upload |
| External secrets required | No for base CI | Existing build uses placeholder Supabase values | Keep E2E secret-free |

## Current Playwright Setup
| Item | Status |
|---|---|
| `test:e2e` script | Present |
| Playwright config | Present |
| `webServer` | Present; starts `npm run dev` |
| Port/base URL | Port 3000, `http://127.0.0.1:3000` |
| Chromium project | Present |
| Trace/screenshot | Present before hardening |
| Video | Added in this sprint for failure debug |

## Decision
Integrate an `e2e` job into the existing main CI workflow instead of creating a duplicate workflow. This keeps the CI surface coherent and makes E2E blocking after lint/typecheck/unit/build gates pass.
