# Initial Monitoring Checklist

## Mode
manual monitoring / provider pending

No external observability provider is connected in this phase. Provider selection, SDK installation, dashboards, or outbound telemetry require explicit approval.

## Checklist
- [ ] Verify build/deploy status
- [ ] Verify 5xx logs
- [ ] Verify frontend errors
- [ ] Verify OAuth failures
- [ ] Verify billing/guard failures
- [ ] Verify Gemini/AI fallback failures
- [ ] Verify telemetry/redaction
- [ ] Verify service worker/cache
- [ ] Verify critical routes
- [ ] Verify rollback readiness

## Minimum Review Cadence
- First 2 hours after controlled rollout: review every 15 minutes.
- First 24 hours: review at least every 2 hours during staffed window.
- First 7 days: daily review until accepted risks are burned down or re-accepted.

## Manual Evidence To Capture
- Deploy identifier, commit SHA, and environment name.
- Timestamped 5xx/API error summary.
- Timestamped frontend error summary.
- Redacted auth and billing failure counts.
- Service worker/cache state for PWA smoke.
- Rollback readiness owner confirmation.

## Escalation Triggers
- Sustained 5xx increase for more than 10 minutes.
- Critical route unavailable for controlled rollout users.
- OAuth or billing guard regression.
- Telemetry leaking token, key, OAuth code, personal data, or health data.
- CSP regression that materially weakens browser protections.
- Rollback path cannot be confirmed within the release window.
