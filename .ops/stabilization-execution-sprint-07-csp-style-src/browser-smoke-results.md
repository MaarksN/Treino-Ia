# Browser Smoke Results - Sprint 07

| Smoke | Executado? | Resultado | Evidencia | Observacao |
|---|---|---|---|---|
| `npm run build` pre-smoke | Sim | PASS | Vite build: 1970 modules transformed; build concluido. | Warning conhecido: empty chunk `motion`. |
| `npm run preview` | Sim | PASS | Preview local em `http://127.0.0.1:4173/`, HTTP 200. | Vite preview nao aplica headers de `vercel.json`. |
| CSP header local real | Sim | PASS | Servidor temporario em `http://127.0.0.1:4174/` serviu `dist` com `Content-Security-Policy`; HTTP 200 confirmou header. | CSP atual ainda contem `style-src 'unsafe-inline'`. |
| App boot sob CSP atual | Sim | PASS | Browser abriu `http://127.0.0.1:4174/`, titulo `Treino Inteligente`, `rootHasContent=true`, `rootTextLength=593`. | Sem alteracao de CSP nesta sprint. |
| Dashboard/rota inicial | Sim | PASS | Rota inicial/Dashboard renderizou `Perfil do atleta`; `visibleButtons=5`; screenshot mostrou layout neon, formulario e aviso de persistencia local. | Estado local sintetico/preexistente, sem OAuth/Billing. |
| Visual/layout basico | Sim | PASS/PARTIAL | Computed styles: body background `rgb(10, 10, 10)`, body color `rgb(248, 250, 252)`, heading color `rgb(248, 250, 252)`. | Somente rota inicial; matriz completa de componentes nao executada. |
| Fonts/styles | Sim | PASS | `linkedStyles` incluiu Google Fonts e `/assets/index-DmU2jOHU.css`; heading font family inclui `Bebas Neue`. | `fonts.googleapis.com`/`fonts.gstatic.com` devem ser preservados. |
| Inline style presence | Sim | WARNING | Browser encontrou `inlineStyleElements=2` na rota inicial. | Confirma que remover `unsafe-inline` sem refactor pode afetar runtime. |
| Componentes motion/anime amplos | Parcial | BROWSER VISUAL SMOKE PARTIAL | Assets/scripts carregaram, mas componentes motion especificos nao foram todos montados nesta rota. | Nao declarar strict final. |
| Console/CSP violations | Sim | PASS | Browser logs `error/warn/warning`: `[]`. | Sob CSP atual, nao sob CSP candidata removendo `unsafe-inline`. |

## Verdict

`PASS WITH WARNINGS`.

O estado atual da CSP e visual basico passou sob header real. A remocao de `style-src 'unsafe-inline'` nao foi aplicada porque a auditoria encontrou dependencia relevante de inline style e o smoke visual nao cobre a matriz necessaria para hardening seguro.
