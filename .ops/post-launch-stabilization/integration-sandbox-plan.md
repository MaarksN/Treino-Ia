# OAuth and Billing Sandbox Plan

## Rules
- Do not use personal credentials.
- Do not run real OAuth without an authorized environment.
- Do not run real billing outside approved sandbox/test mode.
- Do not commit or paste secret values.
- Evidence must be redacted.

| Integration | Prerequisite | Required secret | Smoke | Status | Risk |
|---|---|---|---|---|---|
| OAuth provider sandbox | Approved provider sandbox project and non-personal test account | Provider client id and client secret stored outside repo | Start OAuth flow and confirm redirect to provider | BLOCKED - sandbox not provided | Auth remains unverified against real provider |
| OAuth redirect allowlist | Approved callback URL for controlled environment | None in repo; provider-side allowlist only | Confirm callback URL matches deployed environment | BLOCKED - controlled URL/provider access pending | Callback may fail in production-like environment |
| OAuth callback | Authorized sandbox credentials and redirect allowlist | Provider client secret outside repo | Complete callback or verify fail-closed behavior with redacted logs | BLOCKED - authorized OAuth sandbox pending | Login regressions may surface only after rollout |
| Stripe/Billing sandbox | Approved Stripe test mode project, test price, and test account | Test secret key outside repo | Start checkout/session in test mode | BLOCKED - sandbox keys/test price pending | Monetization path remains unverified |
| Webhook secret sandbox | Publicly reachable controlled webhook endpoint and test webhook secret | Test webhook signing secret outside repo | Verify signed sandbox webhook and reject invalid signature | BLOCKED - webhook secret/endpoint pending | Webhook guard may not be proven in real transport |
| Billing guard | Billing sandbox or approved mock/test environment | Test key or approved mock config outside repo | Verify missing/invalid billing state fails closed | BLOCKED - sandbox/mock not authorized in this phase | Access control around paid flows remains accepted risk |

## Evidence Requirements
- Redacted request/response summaries only.
- No OAuth code, token, cookie, client secret, webhook secret, customer PII, or payment data.
- Test mode indicator captured for billing.
- Provider/project names may be recorded only if approved by release/security owner.
