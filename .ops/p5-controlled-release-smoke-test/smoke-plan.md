# P5 Controlled Release Smoke Plan

| Área | Smoke | Ambiente | Pré-requisito | Resultado esperado |
|---|---|---|---|---|
| App boot | Abrir app via build/preview sem tela branca e sem erro crítico visual | Local preview | Build concluído (`npm run build`) | App inicializa e rota raiz renderiza |
| Dashboard | Carregamento do dashboard sem erro vermelho aparente | Local preview | Sessão mock/local válida | Dashboard renderiza componentes principais |
| Active Workout | Iniciar treino, preencher peso/reps/RPE, finalizar fluxo | Local preview/browser | Browser funcional | Fluxo completo sem crash |
| Recovery | Registrar dor, caffeine/readiness e validar estado vazio | Local preview/browser | Browser funcional | Entradas aceitas e UI estável |
| Nutrition | Abrir área de nutrição e validar render básico | Local preview/browser | Browser funcional | Tela renderiza sem erro crítico |
| AI fallback | Forçar falha de IA e validar fallback seguro | Ambiente com endpoint IA controlável | Modo de falha simulável | Fallback executa sem vazar segredo |
| OAuth health callback/start | Validar bloqueio de redirect inválido e fluxo permitido | Ambiente com OAuth configurado | Credenciais de teste/autorização | Sem open redirect e sem leak de token |
| Billing/sandbox | Validar guard/sandbox sem cobrança real | Sandbox billing | Chaves sandbox | Fluxo de cobrança de teste controlado |
| PWA/service worker | Validar estratégia de cache/offline com foco em `/api/*` | Browser com DevTools | Service worker ativo | `/api/*` não cacheado; assets estáticos ok |
| Telemetry | Validar redaction PII e correlação de request | Ambiente com logs | Acesso a logs/monitoramento | Logs sem PII e com requestId |
| Music embed security | Validar embeds sem relaxar política de segurança | Local preview/browser | Conteúdo com embed ativo | Render com restrições esperadas |
| Privacy panel | Validar painel de privacidade e controles visíveis | Local preview/browser | Browser funcional | Controles disponíveis e consistentes |
| Rollback | Confirmar checklist e passo pós-rollback | Documental + ambiente release | Artefatos de rollback disponíveis | Caminho de rollback claro e testável |
