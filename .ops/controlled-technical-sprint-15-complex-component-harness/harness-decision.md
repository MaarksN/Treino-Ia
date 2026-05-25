# Controlled Technical Sprint 15 - Harness Decision

## Harness Added

File:

```txt
src/test/renderWithProviders.tsx
```

The harness wraps rendered UI with a test `QueryClientProvider` using the existing `createTestQueryClient` helper.

## Why This Shape

- Keeps the first component harness small and reusable.
- Matches existing React Query test conventions in `src/test/queryClient.tsx`.
- Allows future component tests to pass a custom `QueryClient` when cache assertions are needed.
- Does not introduce global state resets, fake providers or external services by default.

## Current Sprint Usage

`ActiveWorkoutView.test.tsx` uses `renderWithProviders` even though this component does not currently require React Query directly. This establishes a stable pattern for future complex component tests without coupling the component to real services.

## Mocking Boundaries

Mocked:

- `useFeatureFlag`
- `useProgressionSuggestion`
- `useApplyProgressionSuggestion`

Not mocked:

- `SetTracker`
- `RestTimer`
- `ProgressionSuggestionCard`

This keeps the test focused but still exercises real child rendering and user interactions.
