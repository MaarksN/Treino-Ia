# PWA / Offline Smoke

| Caso | Resultado | Evidência | Observação |
|---|---|---|---|
| `/api/*` não cacheia | PASS (audit) | política PWA marca API/network-first e evita cache persistente sensível | confirmado por código |
| Requests com Authorization não cacheiam | PASS (audit) | guards no SW/policy evitam cache autenticado | confirmado por código |
| Assets estáticos com política esperada | PASS (audit) | assets versionados/cache-first controlado | padrão PWA esperado |
| Offline fallback não expõe dados sensíveis | PASS (audit) | fallback genérico, sem payload sensível | sem dados privados offline |
| Smoke browser offline | BLOQUEADO PARCIAL | sem execução Playwright/browser nesta fase (script inexistente) | dependente de suíte E2E browser real |
