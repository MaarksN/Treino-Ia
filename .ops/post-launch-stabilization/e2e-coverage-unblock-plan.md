# E2E and Coverage Unblock Plan

## Decision Rule
Do not install new dependencies until dependency registry access and approval are confirmed. Do not mark E2E or coverage as resolved until scripts run and evidence is captured.

| Item | Blocker | Required package | Unblock action | Owner | Status |
|---|---|---|---|---|---|
| `@playwright/test` | P10 reported registry/dependency blocker; package not present as operational gate | `@playwright/test` | Confirm registry access and approval, install in controlled branch, add minimal critical journey specs | QA + Frontend | BLOCKED - approval/registry path pending |
| Playwright browser install | Browser binaries not installed in current environment | Playwright browser binaries | Run approved browser install in CI-capable environment and cache binaries if allowed | QA + Platform | BLOCKED - Playwright package not approved/installed |
| `@vitest/coverage-v8` | Coverage provider not configured as script | `@vitest/coverage-v8` | Confirm provider approval, add coverage config, produce first baseline report | QA Lead | BLOCKED - approval/registry path pending |
| `test:e2e` script | `package.json` has no `test:e2e` script | `@playwright/test` | Add script after dependency approval and wire to browser smoke suite | QA + Frontend | NOT AVAILABLE |
| `test:coverage` script | `package.json` has no `test:coverage` script | `@vitest/coverage-v8` | Add script after provider approval and document output path | QA Lead | NOT AVAILABLE |
| Initial realistic threshold | No current percentage evidence | Coverage provider plus baseline report | Run baseline first, then set non-blocking threshold before raising progressively | QA Lead + Engineering Manager | PENDING |
| CI browser support | No verified browser execution in CI from current evidence | CI browser image/support | Confirm runner supports browser dependencies and artifacts | Platform + QA | PENDING |

## First Minimal E2E Scope
- App boot.
- Dashboard route.
- Active workout route.
- Auth guard behavior.
- PWA/cache smoke where browser support exists.
- CSP header/browser smoke.

## First Coverage Scope
- Keep the first threshold realistic and based on measured output.
- Do not use invented percentages.
- Publish uncovered critical modules as risk items instead of failing silently.
