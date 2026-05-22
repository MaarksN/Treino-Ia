# Risk Register - Sprint 07

| Risco | Severidade | Status anterior | Status apos sprint | Evidencia | Proxima acao |
|---|---|---|---|---|---|
| `style-src 'unsafe-inline'` | Media | Aberto desde Sprint 05/P12 | Aberto com plano tecnico; nao removido por risco visual real | `inline-style-audit.md`, `style-src-decision.md` | Executar migracao de inline styles e smoke com CSP candidata. |
| Visual regression | Alta | Aceito como risco para remocao futura | Reduzido por auditoria; remocao bloqueada | Browser smoke atual PASS/PARTIAL; 128 inline style matches | Refactor + screenshots desktop/mobile antes de hardening. |
| Runtime inline styles | Alta | Suspeito/nao mapeado | Confirmado | React style props, Recharts tooltip styles, motion components, CSS variable writes | Migrar style props ou definir excecao consciente. |
| Browser smoke parcial | Media | Parcial em Sprint 05/Sprint 06 | Ainda parcial para matriz completa de componentes | `browser-smoke-results.md` | Ampliar rotas/componentes e viewport mobile. |
| E2E/Coverage bloqueados | Media | Aceito no Sprint 01 | Inalterado; fora do escopo | `package.json` sem gate E2E/Coverage operacional nesta sprint | Tratar em sprint propria. |
| OAuth/Billing sandbox pendentes | Media | Pendentes apos Sprint 04 | Inalterado; fora do escopo | Sprint 04 final report | Provisionar sandbox/secrets autorizados. |
| PWA offline browser pendente | Baixa/Media | Parcial apos Sprint 06 | Inalterado; fora do escopo | Sprint 06 final report | Reexecutar em browser com SW/CacheStorage/offline. |
| Rollback real deploy pendente | Media | Pendente apos Sprint 03 | Inalterado; fora do escopo | Sprint 03 evidence | Executar em deploy provider/staging autorizado. |
