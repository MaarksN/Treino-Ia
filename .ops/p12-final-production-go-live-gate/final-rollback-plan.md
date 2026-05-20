# Final Rollback Plan (P12)

## 1. Como identificar necessidade de rollback
- Aumento sustentado de erros 5xx, regressão funcional crítica, falha de autenticação/pagamento, ou incidente de segurança.
- Alarmes de disponibilidade/latência acima de SLO por mais de 10 minutos.

## 2. Como reverter deploy
- Reverter para o último artifact estável aprovado (N-1) no provedor de deploy.
- Caso deploy por commit SHA, promover SHA anterior validado.

## 3. Como reverter env/config
- Restaurar snapshot/versionamento de variáveis de ambiente do release anterior.
- Invalidar configuração nova que afete CSP, endpoints externos ou flags de integração.

## 4. Como validar rollback
- Executar smoke mínimo (home, login, dashboard, APIs essenciais).
- Verificar redução de erro e retorno dos indicadores de saúde à baseline.

## 5. Quem aprova
- Release Manager (primário) + Owner técnico de plantão + Security (quando incidente de segurança).

## 6. SLA
- Decisão de rollback: até 15 minutos após confirmação do incidente.
- Rollback efetivado: até 30 minutos após decisão.

## 7. Comunicação
- Canal de incidente interno imediato.
- Atualização executiva após contenção.
- Post público somente se impacto externo confirmado.

## 8. Pós-incidente
- RCA em até 48 horas.
- Plano de ação com owner/prazo.
- Atualização do runbook e critérios de gate.
