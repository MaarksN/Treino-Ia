# Controlled Technical Sprint 17 - Evidence

## Commands Executed

Sprint confirmation and setup:

```txt
git fetch origin main
git worktree add -b codex/sprint-17-coverage-threshold-raise-iii C:\Users\Marks\Documents\GitHub\Treino-Ia-sprint-17-coverage-threshold-raise-iii origin/main
npm ci
```

Initial validation:

```txt
git diff --check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run test:coverage
git status --short
```

Coverage/config review:

```txt
Get-Content -Raw coverage/coverage-summary.json
Get-Content -Raw vitest.config.ts
Get-Content -Raw package.json
Get-Content -Raw .github/workflows/ci.yml
```

Threshold validation:

```txt
npm run test:coverage
```

Final validation:

```txt
git diff --check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run test:coverage
git status --short
```

## Artifacts

- `current-state.md`
- `threshold-raise-decision.md`
- `coverage-results.md`
- `risk-register.md`
- `final-report.md`
- `evidence.md`

## Scope Evidence

- Only the `thresholds` block in `vitest.config.ts` was changed.
- No tests were added or modified.
- No coverage exclusions were added.
- No coverage provider or reporters were changed.
- No CI workflow changes were made.
- No schema or migration was created.
- No secrets were added.
- No threshold was reduced.
