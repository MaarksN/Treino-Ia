# P4 Production Readiness Release Gate

## Objetivo
Definir o gate final de promoção para produção com critérios explícitos de Go/No-Go, considerando o status atual de P2 (QA/Coverage com warnings) e P3 (decomposição incremental com limitações conhecidas).

## Dependências de entrada
- P2 concluído com artefatos e riscos catalogados em `.ops/p2-e2e-coverage-production-qa/`.
- P3 concluído com decomposição incremental e limites documentados em `.ops/p3-architecture-decomposition/`.

## Critérios de Gate (obrigatórios)
1. **Qualidade estática**: `npm run lint` e `npm run typecheck` devem passar.
2. **Testes automatizados**: `npm test` deve passar sem flags inválidas.
3. **Build de produção**: `npm run build` deve passar e gerar artefatos.
4. **Segurança operacional mínima**:
   - Sem segredos hardcoded em código versionado.
   - Fluxos OAuth com sanitização de redirect e armazenamento protegido conforme utilitários existentes.
5. **Risco residual conhecido**:
   - Todos os riscos de severidade alta devem ter owner e ação com data-alvo.
6. **Rollback readiness**:
   - Release precisa de estratégia de rollback documentada (revert de deploy + rollback de configuração).

## Resultado do Gate P4 (estado atual)
- **Lint**: PASS
- **Typecheck**: PASS
- **Testes (`npm test`)**: PASS
- **Build produção**: PASS
- **Decisão**: **GO WITH WARNINGS**

## Warnings ainda abertos
1. Confirmação final de env vars e secrets por ambiente no momento da promoção.
2. Smoke pós-deploy obrigatório (PWA/offline + OAuth + billing crítico).
3. Evidência de observabilidade/alertas ativa antes do GO operacional definitivo.

## Checklist operacional de promoção
- [ ] Tag de release definida e changelog atualizado.
- [ ] Variáveis de ambiente de produção validadas (sem placeholders).
- [ ] Migrações de banco revisadas (forward + rollback) ou marcadas não aplicáveis.
- [ ] Monitoramento/alertas ativos para API e front.
- [ ] Plano de comunicação de incidente e on-call de plantão.
- [ ] Aprovação final de engenharia + produto.

## Estratégia de rollback
- Reverter deploy para versão anterior estável.
- Reverter flags/configurações impactadas.
- Validar healthcheck `/api/health/*` e jornada crítica (login → dashboard → treino).
- Registrar incidente e janela de correção antes de nova tentativa.
