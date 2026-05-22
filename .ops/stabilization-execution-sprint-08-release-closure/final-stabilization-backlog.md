# Final Stabilization Backlog - Sprint 08

| Prioridade | Item | Tipo | Bloqueador | Esforco | Risco reduzido | Criterio de pronto |
|---|---|---|---|---|---|---|
| P1 | Provisionar OAuth/Billing sandbox com secrets autorizados | Ambiente/Seguranca | OAuth client secrets, Stripe test keys, Supabase sandbox, redirect allowlist | Medio | OAuth/Billing reais bloqueados | Start/callback OAuth e checkout/portal em test mode com evidencia redigida |
| P1 | Stripe webhook payload minimization | Backend/Privacidade | Decisao sobre campos minimos e compatibilidade com billing store | Pequeno/Medio | Persistencia excessiva de payload Stripe | Evento persistido com payload minimo ou excecao aprovada + testes |
| P1 | Playwright/coverage registry allowlist | QA/Platform | Registry 403 / dependency approval | Medio | E2E/Coverage bloqueados | `test:e2e` e `test:coverage` reais implementados e passing no CI |
| P1 | Rollback rehearsal em staging/deploy provider | Release/SRE | Ambiente autorizado, artifact N-1, janela de release | Medio | Rollback real pendente | Rehearsal executado com URL/logs/smoke e rollback abortavel |
| P2 | PWA offline browser smoke com SW/CacheStorage real | Frontend/QA | Browser automation com `navigator.serviceWorker`, `caches` e offline toggle | Medio | PWA offline/cache parcial | SW registrado, CacheStorage inspecionado, `/api`/auth ausentes de cache, offline fallback validado |
| P2 | CSP style-src refactor/migration | Frontend/Security | 128 inline style matches, Recharts/motion/export visual matrix | Alto | `style-src 'unsafe-inline'` aceito | Inline styles migrados, CSP candidata passa smoke desktop/mobile sem violacoes |
| P2 | Observability provider externo aprovado | SRE/Security | Provider, LGPD/privacy review, secrets | Medio | Manual monitoring only | Sentry/PostHog/Datadog/etc aprovado com redaction e ingestao segura |
| P3 | Dashboards/alertas reais | SRE/Operations | Provider externo aprovado | Medio | Falta de alertas e visibilidade real | Dashboards, alertas e runbooks testados com evento sintetico |
