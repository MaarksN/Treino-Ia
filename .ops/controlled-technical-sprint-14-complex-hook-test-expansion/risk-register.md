# Controlled Technical Sprint 14 - Risk Register

| Risk | Status | Evidence | Mitigation |
| --- | --- | --- | --- |
| Dirty worktree existed before Sprint 14 | ACCEPTED RISK | `git status --short` showed pre-existing changes before edits | Sprint 14 only added new test/evidence files and avoided dirty source files. |
| Additional unrelated changes appeared during final validation | ACCEPTED RISK | Final `git status --short` included `src/services/database.ts`, `src/utils/migrations.ts`, and `src/services/database.localStorage.test.ts` alongside earlier dirty files | Preserved them and did not stage them for Sprint 14. |
| `git pull` could mix unrelated local work | BLOCKED WITH EVIDENCE | Worktree dirty on `main` | Pull was not executed; state recorded in `current-state.md`. |
| Hook tests accidentally hitting real services | CLOSED | Services/hooks/utilities mocked with `vi.mock` | Tests assert mocked services were called and do not configure real credentials. |
| Timer tests flaking due real time | CLOSED | `vi.useFakeTimers` and fixed system time used | Timer assertions are deterministic. |
| Coverage gate regression | CLOSED | `npm run test:coverage` passed after changes | Coverage increased and thresholds were unchanged. |
| E2E regression | CLOSED | `npm run test:e2e` passed after changes | Existing E2E suite retained. |
