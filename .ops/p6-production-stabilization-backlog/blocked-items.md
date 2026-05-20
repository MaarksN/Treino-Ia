# P6 — Itens Bloqueados

## Bloqueios atuais

1. **OAuth real sem credenciais autorizadas**
   - Bloqueado até provisionar credenciais de teste por ambiente com autorização explícita.
2. **Billing sandbox sem chaves sandbox**
   - Bloqueado até configuração segura de chaves e webhook sandbox.
3. **Observability real sem provider operacional confirmado**
   - Bloqueado até confirmação de stack/provedor (logs, métricas, alertas) no ambiente alvo.
4. **Coverage percentual consolidado**
   - Bloqueado caso exija instalação/provider adicional fora do escopo atual.
5. **Playwright/browser E2E**
   - Bloqueado caso dependa de nova dependência/infra não aprovada neste ciclo.
6. **PWA/offline smoke real em browser**
   - Bloqueado até disponibilidade de execução browser/network controlada.

## Regra de desbloqueio

Cada item só muda para "em execução" após:
- pré-requisitos de ambiente completos;
- autorização operacional quando necessário;
- definição de critério objetivo de PASS/FAIL.
