# Evidence - Controlled Technical Sprint 13

## 1. Objective

Audit the real coverage after React Query hook expansion and raise the coverage thresholds conservatively without changing product behavior, CI behavior, coverage scope, dependencies, schema, migrations, or secrets.

## 2. Base Audited

```txt
Base branch: origin/main
Sprint 12 merge commit: f0dda8fcb0b247a1857a9c38c3c14dbce687faff
Working branch: codex/sprint-13-coverage-threshold-raise
Working directory: clean worktree created from origin/main
```

The original workspace had unrelated local changes. A clean Git worktree was used so this sprint only changes `vitest.config.ts` and `.ops/controlled-technical-sprint-13-coverage-threshold-raise-ii`.

## 3. Previous Threshold

```txt
Statements: 27
Branches: 23
Functions: 27
Lines: 27
```

## 4. Captured Real Coverage

Source:

```txt
coverage/coverage-summary.json
```

Measured:

```txt
Statements: 27.67% (3183/11500)
Branches: 23.59% (2056/8712)
Functions: 28.09% (960/3417)
Lines: 27.52% (2787/10127)
```

## 5. New Threshold

```txt
Statements: 27.3
Branches: 23.2
Functions: 27.7
Lines: 27.2
```

All new thresholds are above the previous thresholds and below measured coverage with at least 0.30 percentage points of margin.

## 6. Config Changed

Changed only:

```txt
vitest.config.ts thresholds block
```

Not changed:

```txt
coverage provider
coverage reporters
coverage include
coverage exclude
package scripts
CI workflow
dependencies
runtime product code
```

## 7. CI Confirmed

`.github/workflows/ci.yml` still contains:

```txt
Coverage with threshold gate
run: npm run test:coverage
```

No `continue-on-error` was found. `|| true` exists only in the unrelated build bundle-size report step, not in coverage. Coverage has no optional skip gate.

## 8. Commands Executed

```txt
git status --short
git branch --show-current
git log --oneline -20
git remote -v
git pull
npm ci
git diff --check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run test:coverage
```

## 9. Real Command Results

```txt
git diff --check: PASS
npm run lint: PASS
npm run typecheck: PASS
npm test: PASS - 168 files, 640 tests
npm run build: PASS
npm run test:e2e: PASS - 16 tests
npm run test:coverage before raise: PASS
npm run test:coverage after raise: PASS
```

## 10. Remaining Risks

```txt
Branch coverage remains low.
Complex hooks remain partially uncovered.
Large components remain mostly uncovered.
CI runtime can grow as coverage expands.
Future threshold increases should wait for larger measured margin.
```

## 11. Next Action

```txt
Controlled Technical Sprint 14 - Complex Hook Test Expansion
```

Alternative if an authorized environment exists:

```txt
OAuth/Billing Sandbox Provisioning
```
