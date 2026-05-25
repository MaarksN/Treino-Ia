# Controlled Technical Sprint 14 - Risk Register

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

