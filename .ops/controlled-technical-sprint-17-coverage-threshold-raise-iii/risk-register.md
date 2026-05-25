# Controlled Technical Sprint 17 - Risk Register

| Risk | Mitigation | Status |
|---|---|---|
| Threshold could exceed real coverage and fail CI. | Read `coverage/coverage-summary.json` and set every threshold below the measured result. | Controlled |
| Threshold could be too close to measured result and become flaky. | Kept 1.35-1.50 percentage points of margin for every metric. | Controlled |
| Sprint could accidentally raise coverage by changing tests. | No tests were changed in this sprint. | Controlled |
| Coverage gate could be weakened by exclusions or provider changes. | Did not change coverage include/exclude/provider/reporter configuration. | Controlled |
| CI behavior could change unnecessarily. | Reviewed `.github/workflows/ci.yml` and made no CI changes. | Controlled |
| Threshold regression could reduce existing gates. | Every new threshold is higher than the previous threshold. | Controlled |

## Residual Risk

Future changes that remove tests or add large untested files can still fail the raised gate. That is the intended protection of this sprint.
