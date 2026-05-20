# P7 — Incident Triage Runbook (Operacional)

## 1) Objetivo
Padronizar triagem inicial de incidentes de API/telemetria com base no `requestId` e logs locais.

## 2) Gatilhos
- Aumento de erros 5xx.
- Falha de persistência em `/api/telemetry/errors`.
- Erro de integração OAuth/Billing em smoke controlado.

## 3) Fluxo de triagem
1. Coletar `requestId` devolvido ao cliente em erro 500.
2. Correlacionar com logs do backend (`API HttpError` / `API unexpected error`).
3. Verificar se payload foi redigido (sem token, sem segredo, sem PII sensível).
4. Classificar incidente:
   - **P1** indisponibilidade total API.
   - **P2** degradação parcial funcional.
   - **P3** erro pontual/entrada inválida.
5. Definir contenção:
   - rollback para versão anterior estável (se impacto amplo);
   - desabilitação temporária do fluxo afetado;
   - hotfix pontual sem ampliar escopo.
6. Registrar pós-mortem mínimo (causa, impacto, tempo de detecção, ação corretiva).

## 4) Sinais mínimos esperados
- `requestId` em 500.
- Mensagem genérica ao usuário final.
- Erro interno sanitizado nos logs.
- Endpoint de telemetria respeitando limite de payload e rate-limit.

## 5) Escalonamento
- Sem provider externo nesta fase: usar logs do runtime + evidência local de testes.
- Ao aprovar provider em fase posterior, adicionar alertas automáticos e on-call formal.
