# P6 — Production Stabilization Backlog

| ID | Risco | Severidade | Área | Status atual | Próxima ação | Bloqueador | Prioridade |
|---|---|---|---|---|---|---|---|
| P6-01 | Playwright/browser E2E ausente/parcial | Alta | QA/E2E | Sem suíte browser E2E executável neste ambiente | Definir plano de suíte Playwright e matriz de cenários críticos (auth, dashboard, treino ativo, recovery, billing guard) | Instalação/dependência de Playwright não aprovada neste ciclo | P1 |
| P6-02 | Coverage percentual ausente | Média | Qualidade | Cobertura percentual consolidada não publicada como gate | Definir comando padrão e meta inicial de cobertura por domínio crítico | Ferramenta/provider de coverage pode exigir instalação/config extra | P2 |
| P6-03 | CSP final pendente | Alta | Segurança Web | CSP pode estar relaxada dependendo do ambiente | Executar plano de tightening por fases com validação em preview/staging | Ausência de smoke browser real por ambiente para validar regressão | P1 |
| P6-04 | Observability/logs/alertas pendentes | Alta | SRE/Operação | Sem checklist operacional fechado para incidentes | Aplicar checklist de observability e definir critérios mínimos de alertas | Provider real de logs/alertas não validado neste ambiente | P1 |
| P6-05 | Rollback rehearsal pendente | Alta | Release | Checklist existe, ensaio recente não confirmado | Executar runbook de rehearsal com janela controlada e smoke pós-rollback | Necessita ambiente de deploy com permissão operacional | P1 |
| P6-06 | OAuth smoke real pendente | Alta | Auth/Security | Guards de redirect/callback avaliados, smoke real não executado | Rodar checklist OAuth em staging com credenciais não pessoais autorizadas | Falta credencial/tenant de teste autorizado | P1 |
| P6-07 | Billing sandbox smoke pendente | Alta | Billing | Guardas documentadas, sem fluxo sandbox executado ponta-a-ponta | Rodar smoke sandbox com cartões de teste e validação de webhooks | Falta chave sandbox/config de ambiente | P1 |
| P6-08 | PWA/offline smoke pendente | Média | PWA/UX | Sem validação browser/network real em modo offline | Executar checklist PWA com throttling/offline e validação de cache | Sem browser E2E configurado no ambiente atual | P2 |
