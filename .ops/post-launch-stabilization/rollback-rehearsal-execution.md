# Rollback Rehearsal Execution Runbook

## Status
NOT EXECUTED - requires approval

## 1. Current commit/release
- Current audited `main` commit before this stabilization package: `4efa3fc` (`Merge pull request #89 from MaarksN/codex/execute-p11-sandbox-integration-smoke`).
- Before execution, replace this value with the actual deployed release identifier from the deploy platform.

## 2. Previous safe commit/release
- Not confirmed in deploy provider during this phase.
- Candidate for investigation: `01de6d8` (`Merge pull request #87 from MaarksN/codex/execute-p7-targeted-remediation-sprint`), because it was the local `main` baseline before pulling P10/P11/P12.
- This candidate must not be used blindly. Confirm the actual N-1 artifact in the deploy platform before rehearsal.

## 3. Rollback command/platform
- Platform: TBD by release owner.
- Command/action: use deploy provider rollback/promote previous deployment action.
- No destructive rollback is authorized by this document.

## 4. Preconditions
- Explicit approval from Release Manager.
- Approved release window and communication channel.
- Current release and previous safe release identified in deploy provider.
- Environment variables/config snapshot available outside the repo.
- Smoke checklist owner assigned.
- No secrets are copied into evidence.

## 5. Execution steps
1. Announce rehearsal start in the release channel.
2. Record current deploy identifier, current commit SHA, and timestamp.
3. Confirm previous safe release/artifact with deploy platform history.
4. Trigger rollback using approved platform mechanism.
5. Monitor deploy completion and error rate.
6. Execute minimum smoke: app boot, dashboard, auth guard, critical APIs, AI fallback guard, billing guard.
7. Confirm no secret, OAuth code, cookie, personal data, or health data is exposed in logs.
8. Announce result and record elapsed time.
9. Restore forward release only if rehearsal plan explicitly includes roll-forward and owner approves.

## 6. Post-rollback validation
- App boot succeeds.
- Critical routes respond without sustained 5xx.
- OAuth and billing guards fail closed when credentials are absent.
- Frontend error rate returns to baseline.
- CSP headers are still present and tracked.
- Telemetry/logs remain redacted.

## 7. Abort criteria
- Previous safe release cannot be verified.
- Deploy platform rollback action is ambiguous or unavailable.
- Rollback would affect real users outside the approved window.
- Environment snapshot is missing.
- Any secret or sensitive user data appears in the rehearsal evidence path.

## 8. Responsible
- Primary: Release Manager.
- Required support: SRE/Platform, Backend owner, Frontend owner, Security for auth/security incident scenarios.

## 9. Maximum acceptable time
- Rollback decision: 15 minutes after incident confirmation.
- Rollback execution: 30 minutes after decision.
- Rehearsal target: complete platform rollback and minimum smoke within 45 minutes.

## 10. Rehearsal result
NOT EXECUTED - requires approval, deploy platform access, release window, and confirmed previous safe release.
