# Risk Register — Controlled Technical Sprint 02

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 02 — Playwright/Coverage Registry Allowlist

| Risco | Severidade | Status anterior | Status após sprint | Mitigação | Próxima ação |
|---|---|---|---|---|---|
| Playwright bloqueado por registry | Alto | 🔴 ATIVO — sem `@playwright/test` | ✅ RESOLVIDO — `@playwright/test@1.60.0` instalado | Dependência disponível no npm público | Manter versão travada no semver `^1.60.0` |
| Coverage bloqueado por registry | Médio | 🔴 ATIVO — sem `@vitest/coverage-v8` | ✅ RESOLVIDO — `@vitest/coverage-v8@4.1.7` instalado | Dependência disponível no npm público | Definir thresholds progressivos na Sprint 03+ |
| Browser install em CI | Alto | 🔴 ATIVO — sem browser disponível em CI | ✅ RESOLVIDO — CI usa `npx playwright install --with-deps chromium` (linha 135 do ci.yml) | CI já tinha infra — apenas o script estava ausente | Monitorar tempo de CI; considerar cache de browsers |
| CI skip honesto removido prematuramente | Médio | 🟢 CONTROLADO — skip honesto preservado | ✅ RESOLVIDO — skip honesto substituído por gate real | `test:e2e` agora existe; CI executará E2E real | Monitorar se E2E passa consistentemente em CI |
| Fake E2E criado | Alto | 🟢 CONTROLADO — nenhum fake criado | ✅ MANTIDO — spec real que abre browser real | Spec verifica 200, title, #root, erros | Expandir smoke com páginas adicionais futuramente |
| Fake coverage criado | Alto | 🟢 CONTROLADO — nenhum fake criado | ✅ MANTIDO — coverage real via v8 provider | Provider v8 instrumenta código real | Capturar baseline e adicionar thresholds |
| Registry allowlist bloqueado | Alto | 🔴 ATIVO — não testado | ✅ RESOLVIDO — npm público acessível | `npm view` retornou versão sem erro | Sem ação necessária para npm público |
| Threshold agressivo quebrando baseline | Médio | N/A | 🟡 MITIGADO — sem threshold nesta sprint | Baseline capturado primeiro, sem threshold obrigatório | Adicionar threshold conservador (60-70%) na Sprint 03 |
| E2E flaky por recursos externos | Baixo | N/A | 🟡 MITIGADO — erros benignos filtrados | Filtro de erros de rede para supabase/google no spec | Monitorar se novos erros externos surgem |
| OAuth sandbox real | Alto | 🔴 ATIVO | 🔴 ATIVO — fora do escopo desta sprint | E2E sem login evita dependência de OAuth | Sprint 03 — OAuth/Billing sandbox provisioning |
| Billing sandbox real | Alto | 🔴 ATIVO | 🔴 ATIVO — fora do escopo desta sprint | E2E sem billing evita dependência | Sprint 03 — OAuth/Billing sandbox provisioning |
| Stripe webhook real | Médio | 🟡 WARNINGS ACEITOS | 🟡 WARNINGS ACEITOS — fora do escopo | Minimização do Sprint 01 mitigou risco | Sprint 03+ |
