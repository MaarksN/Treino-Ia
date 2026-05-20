# Evidence

## Objective
Execute Stabilization Execution Sprint 02 - Browser E2E CI Hardening by making Playwright E2E executable in CI with real browser install, blocking pass/fail behavior, and failure artifacts.

## Base Audited
- Branch: `main`
- Initial local status: only untracked `.ops/technical-debt/`
- Initial local validation: lint, typecheck, Vitest, build, and Playwright E2E all passed
- Sprint 01 commit present: `bb905da Unblock E2E or coverage foundation`

## Files Changed
- `.github/workflows/ci.yml`
- `playwright.config.ts`
- `.ops/stabilization-sprint-02/initial-state.md`
- `.ops/stabilization-sprint-02/ci-audit.md`
- `.ops/stabilization-sprint-02/playwright-ci-hardening.md`
- `.ops/stabilization-sprint-02/validation.md`
- `.ops/stabilization-sprint-02/evidence.md`
- `.ops/stabilization-sprint-02/risk-register.md`
- `.ops/stabilization-sprint-02/final-report.md`

## CI Changes
- Added blocking `e2e` job to `.github/workflows/ci.yml`.
- Job depends on `lint`, `typecheck`, `test`, and `build`.
- Job uses `actions/checkout@v4`, `actions/setup-node@v4`, `npm ci`.
- Job caches npm via setup-node and Playwright browsers via `actions/cache@v4`.
- Job installs Chromium with `npx playwright install --with-deps chromium`.
- Job runs `npm run test:e2e`.
- Job uploads `playwright-report/` and `test-results/` on failure.
- No `continue-on-error` was added.
- No real secrets were added.

## Playwright Changes
- Added `forbidOnly` in CI.
- Added one worker in CI for reproducibility.
- Added video retention on failure.
- Preserved real `webServer`, baseURL, trace, screenshot, Chromium project, and local app execution.

## Validation
See `validation.md` for the final command results:
- `git diff --check`: PASS.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm test`: PASS - 143 test files, 552 tests.
- `npm run build`: PASS WITH KNOWN WARNING - `Generated an empty chunk: "motion"`.
- `npm run test:e2e`: PASS - 4 Playwright tests.

## Scope Control
- No product features.
- No UX changes.
- No Supabase migrations.
- No billing, OAuth, PWA, or observability provider work.
- No secrets.
- No fake E2E.
- No hidden failures.
- `.ops/technical-debt/` was not staged.

## Remaining Evidence Gap
Local validation passed, and CI is configured. The final proof of GitHub-hosted browser execution requires the pushed commit to run in GitHub Actions.
