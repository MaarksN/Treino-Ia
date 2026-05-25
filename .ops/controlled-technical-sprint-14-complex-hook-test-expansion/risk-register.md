# Controlled Technical Sprint 14 - Risk Register

<<<<<<< HEAD
| Risk | Status | Evidence | Mitigation |
| --- | --- | --- | --- |
| Dirty worktree existed before Sprint 14 | ACCEPTED RISK | `git status --short` showed pre-existing changes before edits | Sprint 14 only added new test/evidence files and avoided dirty source files. |
| Additional unrelated changes appeared during final validation | ACCEPTED RISK | Final `git status --short` included `src/services/database.ts`, `src/utils/migrations.ts`, and `src/services/database.localStorage.test.ts` alongside earlier dirty files | Preserved them and did not stage them for Sprint 14. |
| `git pull` could mix unrelated local work | BLOCKED WITH EVIDENCE | Worktree dirty on `main` | Pull was not executed; state recorded in `current-state.md`. |
| Hook tests accidentally hitting real services | CLOSED | Services/hooks/utilities mocked with `vi.mock` | Tests assert mocked services were called and do not configure real credentials. |
| Timer tests flaking due real time | CLOSED | `vi.useFakeTimers` and fixed system time used | Timer assertions are deterministic. |
| Coverage gate regression | CLOSED | `npm run test:coverage` passed after changes | Coverage increased and thresholds were unchanged. |
| E2E regression | CLOSED | `npm run test:e2e` passed after changes | Existing E2E suite retained. |
=======
| Risco | Severidade | Status anterior | Status apos sprint | Mitigacao | Proxima acao |
|---|---|---|---|---|---|
| Timer flake | Medio | `useRestTimer` sem teste direto | Mitigado | Fake timers e system time fixo | Manter padrao em hooks com timers |
| Query/cache leakage | Medio | React Query coberto nas Sprints 11/12 | Estavel | Novos testes mockam hooks React Query e nao criam cache compartilhado | Continuar QueryClient isolado em hooks React Query reais |
| Zustand leakage | Medio | Hooks complexos sem teste direto | Mitigado | Reset de `useAppStore` antes/depois | Reusar padrao em novos hooks |
| Storage leakage | Medio | localStorage usado por timer/store | Mitigado | `localStorage.clear()` em setup/teardown | Expandir para sessionStorage quando houver alvo |
| Supabase/rede real | Alto | Proibido pelo escopo | Mitigado | Todos os services/utilitarios externos mockados | Manter sem secrets e sem ambiente real |
| E2E regression | Alto | E2E 16/16 baseline | Preservado | Nenhum produto/runtime alterado | Confirmar no CI do PR |
| Coverage gate | Alto | Thresholds elevados na Sprint 13 | Preservado | `npm run test:coverage` passou sem alterar thresholds | Nao elevar threshold nesta sprint |
| Hooks complexos restantes | Medio | Ainda ha hooks sem cobertura | Parcial | 3 hooks recomendados cobertos | Sprint futura pode atacar hooks restantes |
| Componentes complexos | Medio | Muitos componentes seguem 0% | Inalterado | Fora do escopo | Sprint futura dedicada a componentes |
| CI runtime | Baixo | Suite ja passa em CI | Monitorar | Adicionados 10 testes deterministas | Observar tempo do PR |

>>>>>>> codex/sprint-14-complex-hook-test-expansion
