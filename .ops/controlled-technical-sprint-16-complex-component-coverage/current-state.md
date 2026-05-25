# Controlled Technical Sprint 16 - Current State

## Branch

```txt
codex/sprint-16-complex-component-coverage
```

## Base

Sprint 15 is merged into `main`.

```txt
8374bcf Merge pull request #108 from MaarksN/codex/sprint-15-complex-component-harness
```

## Initial Validation

```txt
git diff --check: PASS
npm run lint: PASS
npm run typecheck: PASS
npm test: PASS - 179 files, 693 tests
npm run build: PASS
npm run test:e2e: PASS - 16 tests
npm run test:coverage: PASS - 179 files, 693 tests
git status --short: clean
```

## Initial Coverage

```txt
Statements: 30.44%
Branches:   26.30%
Functions:  30.36%
Lines:      30.43%
```

## Audit Commands

```txt
rg --files src/components -g "*.tsx" | Sort-Object
rg --files src/components -g "*.test.tsx" | Sort-Object
```

## Existing Component Test Files

```txt
src/components/ActiveWorkoutView.test.tsx
src/components/AppUpdateBanner.test.tsx
src/components/BottomNav.test.tsx
src/components/ConnectivityBanner.test.tsx
src/components/Nutrition/HydrationManualScanner.test.tsx
src/components/Nutrition/MicrobiotaWidget.test.tsx
src/components/Nutrition/PeriodicTable.test.tsx
src/components/OnboardingTour.test.tsx
src/components/ProgressionSuggestionCard.test.tsx
src/components/ReadinessCard.test.tsx
src/components/RegistrationForm.test.tsx
src/components/ThemeSelector.test.tsx
src/components/WeeklyReportCard.test.tsx
```
