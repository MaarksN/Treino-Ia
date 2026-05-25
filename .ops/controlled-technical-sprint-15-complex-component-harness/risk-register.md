# Controlled Technical Sprint 15 - Risk Register

| Risk | Status | Evidence | Mitigation |
| --- | --- | --- | --- |
| Clean worktree lacked dependencies | CLOSED | First lint attempt could not find `eslint` | Ran `npm ci`; validation restarted from `git diff --check`. |
| Component accidentally reaching real services | CLOSED | Hooks for flags/progression/apply suggestion mocked | No real network/provider credentials used. |
| Existing placeholder tests remained misleading | CLOSED | `ActiveWorkoutView.test.tsx` now renders real component and asserts behavior | Removed `expect(true).toBe(true)` patterns by replacing tests with real assertions. |
| Timer child causing flake | REDUCED | `voiceEnabled=false`, no timer finish awaited | Existing timer behavior is not the primary assertion path. |
| Coverage threshold regression | CLOSED | `npm run test:coverage` passed | Thresholds unchanged. |
| E2E regression | CLOSED | `npm run test:e2e` passed | Existing E2E retained. |
