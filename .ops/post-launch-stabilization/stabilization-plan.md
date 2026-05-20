# Post-Launch Stabilization Plan

## Objective
Convert the P12 `GO WITH WARNINGS` decision into an operational stabilization plan for controlled rollout, monitoring, progressive risk burn-down, and explicit rollback criteria.

## Scope Control
- No new product features.
- No new strategic item batch.
- No Supabase schema change or migration.
- No dependency installation without explicit approval.
- No external provider connection without explicit approval.
- No real payment or unauthorized OAuth execution.
- No accepted risk is marked closed without real evidence.

## Stabilization Matrix

| Area | Accepted risk | Post-launch action | Owner | Due date | Closure criterion |
|---|---|---|---|---|---|
| E2E/Playwright | E2E is partial and no operational script exists in the repo | Unblock approved dependency path, add `test:e2e`, install Playwright browsers in CI-capable environment, and execute critical journey suite | QA + Frontend | 2026-06-18 | `npm run test:e2e` exists, runs in CI/browser environment, and has versioned evidence for app boot, dashboard, workout, auth guard, PWA/cache, and CSP checks |
| Coverage | Coverage percentage is absent or blocked | Approve coverage provider, add `test:coverage`, define realistic baseline threshold, and publish report artifact | QA Lead | 2026-06-18 | `npm run test:coverage` exists, passes with approved baseline, and the threshold/report is documented in CI evidence |
| OAuth sandbox/real authorized | OAuth real smoke is pending authorized environment | Provision authorized sandbox or approved real smoke environment, configure redirect allowlist, and run start/callback without personal credentials | Backend + Security | 2026-06-10 | OAuth start/callback smoke has redacted evidence, no tokens or codes are exposed, and provider allowlist is confirmed outside the repo |
| Billing sandbox | Billing sandbox is pending test keys and test prices | Provision Stripe/Billing sandbox secrets outside repo, run checkout/guard/webhook smoke with test mode only | Backend + QA | 2026-06-10 | Billing sandbox evidence proves test-mode flow and guard behavior with no real charge and no committed secret |
| PWA/offline browser smoke | PWA/offline browser smoke is pending | Execute browser smoke for service worker registration, cache behavior, offline fallback, and recovery to online state | Frontend + QA | 2026-06-20 | Browser evidence shows expected cache/offline behavior and no stale critical data after recovery |
| Observability provider | Real observability provider is absent | Keep manual monitoring during initial rollout, select approved provider, define redaction, alerts, and dashboard before scale-out | SRE/Platform | 2026-06-12 | Approved provider is connected with redacted events/logs, owner alerts, and dashboard evidence |
| Rollback rehearsal | Real rollback rehearsal is pending | Run non-destructive rehearsal in approved release window using deploy platform rollback mechanics | Release Manager | 2026-06-08 | Rehearsal result is recorded with actual current release, previous safe release, elapsed time, validation, and abort criteria |
| CSP unsafe-inline/unsafe-eval | CSP may still depend on `unsafe-inline`/`unsafe-eval` | Replace inline script/style needs with nonce/hash or documented exception, then validate in browser smoke/E2E | Security + Frontend | 2026-06-15 | Production CSP no longer requires unsafe directives, or each remaining exception has explicit risk acceptance and browser evidence |

## Stabilization Exit Criteria
- All P12 accepted risks have an owner, due date, evidence path, and current status.
- Critical runtime commands and smokes are executable in an authorized environment.
- Manual monitoring is replaced or supplemented by approved provider alerts before scale-out.
- Rollback rehearsal is executed or explicitly re-approved as an accepted risk.
- No unresolved high-severity incident is open during rollout expansion.
