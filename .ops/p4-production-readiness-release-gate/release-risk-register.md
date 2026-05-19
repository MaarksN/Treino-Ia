# P4 Release Risk Register

| ID | Risco | Severidade | Status | Owner | Mitigação | Prazo |
|---|---|---|---|---|---|---|
| P4-R01 | Cobertura E2E browser ainda parcial (dependência de evolução pós-P2/P3) | Médio | Aberto | QA/Platform | Introduzir smoke E2E com evidência em CI antes de elevar para gate obrigatório | 2026-06-05 |
| P4-R02 | Fluxo de testes completos sem relatório consolidado | Médio | Mitigado | Engenharia | `npm test` executado com sucesso na remediação; manter artifact em CI | 2026-05-23 |
| P4-R03 | Regressão em integrações OAuth/redirect em mudanças futuras | Alto | Mitigado Parcial | Backend/Security | Manter validações de redirect + testes de contrato para callback/start | 2026-05-30 |
| P4-R04 | Falha de rollback por divergência de configuração entre ambientes | Alto | Aberto | Release Manager/DevOps | Checklist de rollback + validação de configuração por ambiente antes do deploy | 2026-05-24 |

## Critério de aceite de risco
- Riscos **Altos** só podem permanecer abertos com plano e owner explícitos.
- GO final de produção exige pelo menos mitigação parcial verificada para todos os riscos Altos.
