# Risk Register

| Risk | Severity | Status | Mitigation in this phase | Next action |
|---|---|---|---|---|
| Playwright flakiness | Medium | OPEN | Added small smoke suite, Chromium-only project, realistic timeouts, trace on first retry, screenshot on failure | Run in CI and tune retries/timeouts only with evidence |
| Coverage threshold low | Medium | OPEN | Coverage was not implemented because Playwright was viable and selected first | Execute a dedicated coverage sprint with measured baseline before thresholds |
| Browser install in CI | Medium | OPEN | Local `npx playwright install chromium` passed | Add CI browser install/cache step and publish artifacts |
| Registry 403 | Medium | MITIGATED LOCALLY | `npm view` and package install succeeded for `@playwright/test`; coverage provider also resolved | Keep registry allowlist documented and verify in CI |
| Onboarding/session state | Low | MITIGATED FOR SMOKE | E2E sets onboarding localStorage only to reach the public app shell without user credentials | Add authenticated/sandbox flows only with approved test identity |
| OAuth real pending | Medium | OPEN | Not touched; E2E avoids OAuth entirely | Provision authorized OAuth sandbox before real auth smoke |
| Billing sandbox pending | Medium | OPEN | Not touched; E2E avoids billing/payment | Provision billing sandbox and test keys before billing smoke |
| PWA offline pending | Low | OPEN | Not touched; Playwright foundation can support it later | Add offline/cache browser smoke after service worker behavior is scoped |
| Observability provider pending | Medium | OPEN | Not touched; no provider added | Run approved observability provider sprint |
| Rollback rehearsal pending | Medium | OPEN | Not touched; no deploy rollback executed | Run approved rollback rehearsal in release window |

## Policy
No risk is closed unless there is command output, CI evidence, provider evidence, or smoke evidence. This sprint closes the "no operational E2E script" gap locally, but CI browser support remains open.
