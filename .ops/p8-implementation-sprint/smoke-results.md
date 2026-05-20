# P8 — Smoke Results

| Smoke | Resultado | Evidência | Observação |
|---|---|---|---|
| Build de produção | PASS | `npm run build` | Vite build concluído sem erro |
| Preview/browser manual | WARNING | Não executado | Ambiente sem validação browser interativa nesta fase |
| Lint + Typecheck + Testes | PASS | `npm run lint`, `npm run typecheck`, `npm test` | Sem regressões detectadas |
| Cache policy PWA `/api` | PASS (indireto) | Test suite existente + revisão `public/sw.js`/`cachePolicy` | Mantido bypass de cache para `/api` |
| Headers/CSP | PASS (revisão) | diff em `vercel.json` + matrix alvo | Hardening incremental aplicado |
