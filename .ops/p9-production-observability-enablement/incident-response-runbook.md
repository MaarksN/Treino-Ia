# P9 — Incident Response Runbook

## 1) Como identificar incidente
- Monitorar sinais críticos da matriz (5xx, OAuth callback failures, Gemini timeout/failure spike, auth/session failures).
- Classificar como incidente quando houver impacto em fluxo crítico, exposição sensível ou indisponibilidade.

## 2) Classificação de severidade
- **SEV1** — app fora do ar, dados sensíveis expostos, pagamento/OAuth crítico.
- **SEV2** — fluxo crítico quebrado sem exposição sensível.
- **SEV3** — degradação parcial ou warning operacional.
- **SEV4** — documentação, UX menor, melhoria preventiva.

## 3) Como preservar evidência
- Registrar timestamp UTC de início/fim.
- Preservar `requestId` de respostas 500 e trechos de logs redigidos.
- Salvar comando/resultado técnico executado durante triagem.
- Não copiar tokens, cookies, OAuth code/state, payload bruto sensível.

## 4) Como checar logs sem expor secrets
- Priorizar mensagens sanitizadas por `handleApiError`.
- Buscar por `requestId` e status code, não por payload completo.
- Se necessário compartilhar evidência, usar apenas campos redigidos (`[REDACTED]`).

## 5) Como validar rollback
- Confirmar versão/commit atual.
- Reaplicar smoke mínimo pós-rollback: auth, chamada API crítica, rota de integração afetada.
- Verificar redução do erro no mesmo sinal que disparou incidente.

## 6) Como comunicar status
- Abrir thread de incidente com: severidade, impacto, owner, mitigação imediata, próximo update (ETA).
- Atualizações periódicas até mitigação.
- Encerrar com status final e riscos remanescentes.

## 7) Como fechar incidente com postmortem
- Documentar causa raiz, fatores contribuintes, detecção, resposta, prevenção.
- Criar ações com owner/data para evitar recorrência.
- Vincular aprendizado ao backlog da próxima fase (P10+).
