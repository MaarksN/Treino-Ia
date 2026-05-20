# Evidence

## 1. Objective
Execute the Post-Launch Stabilization phase after the P12 `GO WITH WARNINGS` decision, creating an operational plan for controlled rollout, monitoring, smoke execution, accepted-risk burn-down, and rollback criteria.

## 2. Audited base
- Repository: `C:\Users\Marks\Documents\GitHub\Treino-Ia`
- Initial branch: `main`
- Remote: `origin https://github.com/MaarksN/Treino-Ia.git`
- Initial local HEAD before pull: `01de6d8`
- Updated `main` HEAD after pull: `4efa3fc`
- `git pull`: first attempt blocked because untracked P10/P12 files would be overwritten; files were safely stashed, `git pull` fast-forwarded, stash content was compared to `HEAD` with no diff and the duplicate stash was dropped.
- P8 present in history: `b9068bc Implement targeted CSP production hardening`
- P9 present in history: `cbd955c Add production observability enablement`
- P10 present in history: `3c02b71 Merge pull request #91 from MaarksN/codex/execute-p10-e2e-/-coverage-enablement`
- P11 present in history: `4efa3fc Merge pull request #89 from MaarksN/codex/execute-p11-sandbox-integration-smoke`
- P12 present in history: `7a68ca3 Merge pull request #90 from MaarksN/codex/execute-p12-final-production-gate`

## 3. P12 decision
- Final decision inherited from P12: `GO WITH WARNINGS`
- Conditions inherited:
  - Controlled rollout only.
  - Env/secrets checklist completed outside the repository.
  - Explicit approval for OAuth/Billing in authorized environments.
  - Active monitoring and rollback plan.
  - Close accepted risks within the P12 deadlines.

## 4. Accepted risks
- E2E/Playwright absent or blocked.
- Coverage percentage absent or blocked.
- OAuth real smoke pending authorized environment.
- Billing sandbox pending keys/test price/webhook secret.
- PWA/offline browser smoke pending.
- Real observability provider absent.
- Real rollback rehearsal pending.
- CSP may still include `unsafe-inline`/`unsafe-eval`.

## 5. Commands executed
- `git status --short`
- `git branch --show-current`
- `git log --oneline -15`
- `git remote -v`
- `git pull`
- `git stash push -u -m "codex-pre-post-launch-stabilization-pull"`
- `git pull`
- `git log --oneline -15`
- `git log --oneline --grep="P8\|P9\|P10\|P11\|P12\|CSP\|observability\|coverage\|sandbox\|go-live" --all -30`
- `git stash show --include-untracked --name-only 'stash@{0}'`
- `git diff --stat 'stash@{0}^3' HEAD -- .ops/p10-e2e-coverage-enablement .ops/p12-final-production-go-live-gate`
- `git stash drop 'stash@{0}'`
- `git diff --check`
- `npm pkg get scripts`
- `Get-Command node`
- `Get-Command npm`
- `where.exe node`
- `where.exe npm`
- `node --version`
- local search for existing `npm.cmd`
- `node --version` with existing portable Node added to PATH for the command
- `npm --version` with existing portable Node added to PATH for the command
- `npm pkg get scripts` with existing portable Node added to PATH for the command
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `git status --short`
- P12 artifact reads using `Get-Content -Raw`

## 6. Real command results
- `git status --short` before pull: untracked `.ops/p10-e2e-coverage-enablement/` and `.ops/p12-final-production-go-live-gate/`.
- `git branch --show-current`: `main`.
- `git remote -v`: `origin` configured for fetch and push.
- First `git pull`: BLOCKED - untracked P10/P12 files would be overwritten.
- Safety stash/pull: PASS - untracked files stashed, `main` fast-forwarded to `4efa3fc`, stash compared with no diff and dropped.
- `git diff --check` initial: PASS.
- `npm pkg get scripts`: BLOCKED - `npm` is not recognized in current PowerShell session.
- Script review via `package.json`: `lint`, `typecheck`, `test`, and `build` exist; `test:e2e` and `test:coverage` do not exist.
- `node --version`: BLOCKED - bundled `node.exe` failed with access denied in shell.
- Existing portable runtime found: `C:\Users\Marks\.codex\tmp\node-portable-v22.14.0\node-v22.14.0-win-x64`.
- `node --version` with portable runtime PATH: PASS - `v22.14.0`.
- `npm --version` with portable runtime PATH: PASS - `10.9.2`.
- `npm pkg get scripts` with portable runtime PATH: PASS - scripts listed; `test:e2e` and `test:coverage` absent.
- Initial `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` without portable PATH: BLOCKED - `npm` is not recognized.
- Final `npm run lint` with portable runtime PATH: PASS.
- Final `npm run typecheck` with portable runtime PATH: PASS.
- Final `npm test` with portable runtime PATH: PASS - 143 test files and 552 tests passed.
- Final `npm run build` with portable runtime PATH: PASS - Vite production build completed; warning: generated empty chunk `motion`.
- `npm run test:e2e`: NOT AVAILABLE - no script in `package.json`.
- `npm run test:coverage`: NOT AVAILABLE - no script in `package.json`.
- `git status --short` after initial validation: clean.
- `git status --short` after final validation: only `.ops/post-launch-stabilization/` untracked before staging.

## 7. Artifacts created
- `.ops/post-launch-stabilization/evidence.md`
- `.ops/post-launch-stabilization/stabilization-plan.md`
- `.ops/post-launch-stabilization/monitoring-checklist.md`
- `.ops/post-launch-stabilization/post-launch-smoke-plan.md`
- `.ops/post-launch-stabilization/rollback-rehearsal-execution.md`
- `.ops/post-launch-stabilization/e2e-coverage-unblock-plan.md`
- `.ops/post-launch-stabilization/integration-sandbox-plan.md`
- `.ops/post-launch-stabilization/observability-provider-plan.md`
- `.ops/post-launch-stabilization/risk-burndown.md`
- `.ops/post-launch-stabilization/final-report.md`
- `.ops/post-launch-stabilization/delivery-status.md`

## 8. Smokes executed
- None. No controlled deploy URL, authorized OAuth sandbox, billing sandbox, browser/E2E runtime, or working local `npm` runtime was available in this environment.

## 9. Smokes blocked
- App boot: BLOCKED - no deploy URL and local `npm` runtime unavailable.
- Dashboard: BLOCKED - requires controlled environment and approved test identity.
- Active Workout: BLOCKED - requires controlled environment and approved test data.
- Recovery: BLOCKED - requires controlled environment and redacted log review.
- Nutrition: BLOCKED - requires controlled environment and redacted log review.
- AI fallback: BLOCKED - requires approved sandbox/mock or controlled fault injection.
- OAuth start/callback: BLOCKED - authorized OAuth sandbox not provided.
- Billing sandbox: BLOCKED - sandbox keys/test price/webhook secret not provided.
- PWA offline/cache: BLOCKED - browser smoke environment unavailable and `test:e2e` absent.
- Telemetry/redaction: BLOCKED - provider pending; manual deployment logs required.
- CSP headers: BLOCKED - deploy URL/header evidence not available.
- Rollback readiness: NOT EXECUTED - requires approval.

## 10. Next action
Run the Stabilization Execution Sprint one accepted risk at a time, starting with E2E/Coverage unblock or approved observability provider selection. Do not expand rollout until monitoring and rollback readiness have real evidence.
