# Risk Burn-Down

| Risk | Initial severity | Current status | Evidence | Next action | Closed? |
|---|---|---|---|---|---|
| `unsafe-inline`/`unsafe-eval` still present in CSP | Medium | OPEN - accepted in P12 | `.ops/p12-final-production-go-live-gate/risk-acceptance.md` and final release matrix | Mitigate with nonce/hash or documented exception, then validate with browser/E2E evidence | No |
| OAuth real smoke pending | Medium | OPEN - sandbox/authorized environment pending | P12 risk acceptance and P11 final report | Provision authorized OAuth sandbox and run redacted start/callback smoke | No |
| Billing sandbox pending | Medium | OPEN - sandbox keys/test price pending | P12 risk acceptance and P11 final report | Provision billing sandbox and run test-mode checkout/guard/webhook smoke | No |
| PWA offline pending | Low | OPEN - browser smoke pending | P12 risk acceptance and P11 final report | Execute browser offline/cache smoke and record evidence | No |
| Observability provider real absent | Medium | OPEN - manual monitoring only | P9 final report and P12 risk acceptance | Approve provider or continue manual monitoring with explicit scale-out limit | No |
| Rollback rehearsal pending | Medium | OPEN - not executed | P12 final rollback plan and this rollback rehearsal runbook | Execute approved rehearsal in release window with N-1 release confirmed | No |
| Coverage low/absent in operational gate | Medium | OPEN - `test:coverage` unavailable | P10 final report and `package.json` script review | Approve coverage provider, add script, capture baseline threshold | No |
| E2E partial/no operational script | Medium | OPEN - `test:e2e` unavailable | P10 final report and `package.json` script review | Approve Playwright path, add script, run critical browser suite | No |

## Burn-Down Policy
- Close one risk at a time.
- Each closure requires command output, smoke evidence, or provider/deploy artifact evidence.
- Do not close risk based on intent, configuration plan, or undocumented manual confidence.
