# Controlled Technical Sprint 15 - Risk Register

| Risco | Severidade | Status anterior | Status apos sprint | Mitigacao | Proxima acao |
|---|---|---|---|---|---|
| Threshold agressivo | Alto | Thresholds em `27.3 / 23.2 / 27.7 / 27.2` | Mitigado | Novos valores ficam abaixo do real com margem >= 0.31 p.p. | Nao subir novamente sem novo ganho real |
| Coverage flake | Medio | Coverage real depende da suite completa | Monitorado | `npm run test:coverage` executado antes e depois da mudanca | Confirmar no CI remoto |
| E2E preview flake | Medio | Primeira execucao falhou por `ERR_CONNECTION_REFUSED` | Documentado | Rerun passou 16/16 sem mudanca de codigo | Monitorar CI |
| Exclusoes indevidas | Alto | Nenhuma exclusao nova planejada | Mitigado | `exclude` nao alterado | Manter bloqueio contra escopo artificial |
| CI runtime | Medio | Coverage leva varios minutos localmente | Monitorado | CI existente preservado | Observar tempo remoto |
| Branch coverage | Medio | Ainda e uma das metricas mais baixas | Melhorado | Threshold branches elevado para 24.8 | Expandir testes de caminhos alternativos |
| Componentes complexos | Medio | Muitos componentes seguem com baixa cobertura | Inalterado | Fora do escopo da sprint | Sprint futura de componentes |
| Hooks complexos restantes | Medio | Parte ja coberta na Sprint 14 | Parcialmente mitigado | Threshold raise baseado em ganho real ja mergeado | Expandir hooks remanescentes |
| OAuth/Billing | Alto | Requer ambiente autorizado | Inalterado | Fora do escopo | Provisionar sandbox quando autorizado |

