# Controlled Technical Sprint 16 - Risk Register

| Risk | Mitigation | Status |
|---|---|---|
| Export tests could trigger real downloads or print windows. | Mocked export utilities and `window.open`; asserted calls without browser side effects. | Controlled |
| Export panel entitlement gate could call billing services. | Mocked `PremiumFeatureGate` to render children only. | Controlled |
| Import tests could rely on image canvas behavior. | Used PDF and unsupported local files for import preparation; avoided image crop execution. | Controlled |
| File import tests could use external network or real provider behavior. | Used local jsdom `File` and `FileReader` only. | Controlled |
| Exercise library tests could leak localStorage state. | Cleared localStorage before each test and asserted only component-owned keys. | Controlled |
| Custom exercise IDs could be nondeterministic. | Mocked `crypto.randomUUID` with a stable UUID. | Controlled |
| New tests could become placeholder coverage. | Each test asserts rendered states, callbacks, persisted data, generated drafts, or mocked side effects. | Controlled |

## Residual Risk

The selected tests intentionally mock download/print and premium entitlement boundaries. This keeps Sprint 16 within scope and avoids real Billing/Stripe/provider activity, but it does not replace dedicated integration tests for those systems.
