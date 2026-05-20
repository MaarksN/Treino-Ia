# Risk Register

| Risk | Severity | Status | Mitigation in this sprint | Next action |
|---|---|---|---|---|
| Browser E2E not proven in CI | High | MITIGATED, awaiting remote run evidence | Added blocking CI `e2e` job with browser install and artifact upload | Verify GitHub Actions run after commit/push |
| Playwright browser cache drift | Medium | MITIGATED | Cache key uses OS plus `package-lock.json` hash | Rebuild cache on dependency changes |
| Linux browser dependencies missing | Medium | MITIGATED | CI runs `npx playwright install --with-deps chromium` | Inspect first CI run logs |
| E2E flakiness | Medium | OPEN | CI uses retries, one worker, traces/screenshots/video on failure | Tune only with CI evidence |
| Artifact gaps on failure | Low | MITIGATED | Uploads `playwright-report/` and `test-results/` on failure, ignoring missing paths | Review artifact contents after first failure |
| External environment dependency | Medium | MITIGATED | Current E2E uses local Vite app and placeholder env only | Keep OAuth/Billing out of this suite until sandbox approved |
| Known Vite empty chunk `motion` warning | Low | ACCEPTED | Not caused by this sprint and not changed | Track separately if it becomes build noise |
| Unrelated `.ops/technical-debt/` content | Low | OPEN LOCAL | Excluded from staging/commit | Owner should decide separately |

