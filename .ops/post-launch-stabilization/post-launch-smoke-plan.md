# Controlled Post-Launch Smoke Plan

## Rules
- Do not execute real OAuth without an authorized environment.
- Do not execute real billing outside approved sandbox/test mode.
- Do not mark any smoke as PASS unless it was executed and evidence was captured.
- Use redacted evidence only. No tokens, cookies, OAuth codes, secrets, personal data, or health data.

| Smoke | Environment | Prerequisite | Expected result | Executed? | Result |
|---|---|---|---|---|---|
| App boot | Controlled rollout deploy or local runtime | Deploy URL or local `npm run dev` runtime available | App loads without fatal frontend/runtime error | No | BLOCKED - no controlled deploy URL provided and local `npm` runtime is unavailable in current shell |
| Dashboard | Controlled rollout deploy or local runtime | Authorized non-personal test account/session | Dashboard route renders without 5xx or frontend crash | No | BLOCKED - requires controlled environment and approved test identity |
| Active Workout | Controlled rollout deploy or local runtime | Approved test data and route access | Workout flow opens and core state transitions do not fail | No | BLOCKED - requires controlled environment and approved test data |
| Recovery | Controlled rollout deploy or local runtime | Approved test data and route access | Recovery route renders and does not expose health data in logs | No | BLOCKED - requires controlled environment and redacted log review |
| Nutrition | Controlled rollout deploy or local runtime | Approved test data and route access | Nutrition route renders and no protected data leaks into telemetry/logs | No | BLOCKED - requires controlled environment and redacted log review |
| AI fallback | Controlled rollout deploy or local runtime | Gemini/AI unavailable scenario or approved mock/sandbox | Fallback path is user-safe and no secret is logged | No | BLOCKED - requires approved sandbox/mock or controlled fault injection |
| OAuth start/callback with authorized sandbox | Authorized OAuth sandbox | Provider sandbox credentials, redirect allowlist, and non-personal test account | Start/callback completes or fails safely with redacted logs | No | BLOCKED - authorized OAuth sandbox not provided |
| Billing sandbox | Authorized billing sandbox | Test keys, test price, webhook secret, and no real charge path | Test-mode checkout/guard/webhook behavior is captured | No | BLOCKED - billing sandbox secrets/test price not provided |
| PWA offline/cache | Browser-capable controlled runtime | E2E/browser support or manual browser smoke window | Service worker/cache behavior matches expected offline policy | No | BLOCKED - browser smoke environment not available and `test:e2e` script absent |
| Telemetry/redaction | Controlled rollout deploy or local runtime | Log/telemetry review access | No token, key, cookie, OAuth code, personal data, or health data appears | No | BLOCKED - provider pending; manual logs required in deployment environment |
| CSP headers | Controlled rollout deploy with headers visible | Deploy URL and browser/header inspection | CSP matches configured policy; unsafe directives remain tracked if present | No | BLOCKED - deploy URL/header evidence not available |
| Rollback readiness | Approved release window | Deploy platform access and N-1 release identified | Rollback can be initiated within SLA or rehearsal is abortable | No | NOT EXECUTED - requires approval |

## Smoke Evidence Format
- Date/time and environment.
- Commit/release identifier.
- Operator/owner.
- Redacted screenshots/log excerpts where allowed.
- PASS/FAIL/BLOCKED with reason.
- Follow-up issue/action for every FAIL or BLOCKED item.
