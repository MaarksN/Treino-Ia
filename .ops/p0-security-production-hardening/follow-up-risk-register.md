# Follow-up Risk Register

## Gamificacao transacional

- Risco: eventos/contadores de gamificacao ainda podem sofrer concorrencia se updates nao forem atomicos.
- Proxima fase: mover operacoes criticas para RPC/transacoes no backend com idempotencia.

## OAuth token encryption

- Risco: tokens OAuth exigem criptografia e rotacao de chaves para reduzir impacto de vazamento.
- Proxima fase: definir envelope encryption, KMS/secret management e migracao de dados existentes.

## LocalStorage sensivel

- Risco: dados sensiveis persistidos no cliente podem ser expostos por XSS ou extensoes.
- Proxima fase: inventariar chaves, migrar estado sensivel para backend e manter no cliente apenas cache nao sensivel.

## CSP completa

- Risco: CSP ainda pode depender de `unsafe-inline`/`unsafe-eval` ou scripts remotos sem endurecimento final.
- Proxima fase: medir quebras, remover `unsafe-*`, usar nonces/hashes e SRI onde aplicavel.

## AI gateway distribuido

- Risco: rate limit/cache em memoria continuam por instancia e nao protegem distribuicao horizontal.
- Proxima fase: mover rate limit, cache e circuit breaker para KV/Redis ou gateway dedicado.

## E2E/cobertura

- Risco: fluxos criticos ainda dependem majoritariamente de testes unitarios/helpers.
- Proxima fase: adicionar Playwright/E2E para auth, PWA offline, pagamentos, AI proxy e telemetria.

## God components

- Risco: hubs/componentes grandes seguem caros de testar e revisar.
- Proxima fase: fatiar por dominio com contratos estaveis, sem alterar comportamento em massa.
