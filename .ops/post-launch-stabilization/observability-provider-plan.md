# Observability Provider Plan

## Decision Rule
This phase evaluates options only. Real implementation, SDK installation, data export, dashboards, or alert connections require explicit approval, security review, and LGPD/privacy review.

| Option | Pros | Cons | Data collected | LGPD/security risk | Recommendation |
|---|---|---|---|---|---|
| Sentry | Strong frontend/backend error visibility, release association, alerting, source maps when configured safely | Requires SDK/config, data scrubbing, source map handling, and project approval | Errors, stack traces, release id, route/context metadata | Stack traces may include sensitive values if redaction is incomplete | Good candidate for error monitoring after redaction policy approval |
| PostHog | Product analytics, events, funnels, feature usage signals | Higher privacy review burden for behavioral analytics; not needed for immediate incident response | Product events, user/session identifiers if enabled, page/activity metadata | Elevated LGPD risk if identifiers or health-related behavior are collected | Defer until explicit analytics scope and consent/redaction model exist |
| Datadog | Broad logs/APM/metrics, mature alerting and incident workflows | More complex setup and cost/ops overhead for small rollout | Logs, metrics, traces, service metadata | High data volume increases redaction and retention obligations | Consider only if platform already standardizes on Datadog |
| Logtail/BetterStack | Simple log aggregation and alerting, faster operational onboarding | Less product analytics/APM depth than larger platforms | Application logs, deploy metadata, error summaries | Logs can leak secrets/PII if redaction is incomplete | Practical candidate for initial log-based monitoring after approval |
| Vercel Analytics/Logs | Native fit if deploy is on Vercel, low integration overhead | Platform-specific and may not cover full backend/APM needs | Web vitals, request logs, deploy/build metadata depending product enabled | Must confirm retention, access control, and whether user identifiers are collected | Prefer if Vercel is the approved deploy platform and privacy review passes |
| Manual logs initial | No new provider, no SDK, lowest integration risk during controlled rollout | Labor-intensive, weaker alerting, slower detection, no durable dashboards | Existing deployment logs and manual review notes | Lower vendor risk but still requires redaction discipline | Use for immediate controlled rollout until a provider is explicitly approved |

## Minimum Provider Requirements
- Redaction before export.
- Access control and least privilege.
- Retention policy documented.
- Alert owner and escalation route.
- Release/deploy identifier included.
- No health data, tokens, cookies, OAuth codes, or payment data.
