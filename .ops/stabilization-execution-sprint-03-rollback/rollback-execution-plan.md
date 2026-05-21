# Rollback Execution Plan

## 1. Objetivo do rollback
Restaurar rapidamente o ultimo artifact estavel aprovado quando a release atual causar incidente critico, reduzindo impacto aos usuarios sem expor secrets, apagar dados ou alterar schema.

## 2. Quando acionar rollback
Acionar rollback quando uma das condicoes abaixo for confirmada:

- Erros 5xx sustentados ou latencia fora do SLO por mais de 10 minutos.
- Regressao critica em autenticacao, dashboard, API essencial, AI fallback ou billing guard.
- Incidente de seguranca com impacto operacional.
- Falha de deploy que deixe a aplicacao indisponivel ou parcialmente inutilizavel.

## 3. Quem aprova
- Primario: Release Manager.
- Suporte obrigatorio: SRE/Platform.
- Consultar Backend, Frontend e Security conforme natureza do incidente.
- Security deve aprovar quando houver incidente de autenticacao, dados sensiveis ou politica de seguranca.

## 4. Ambiente alvo
- Alvo preferido para rehearsal: staging/preview autorizado.
- Alvo de producao: somente com aprovacao explicita, janela de release, comunicacao aberta e artifact N-1 confirmado.
- Este sprint executou apenas dry-run local.

## 5. Commit atual
`c8a201d34281bce9255f8830190fbd87d87c4558`

## 6. Commit anterior seguro
`48eabf6d837147faf5812c6de537d492b89832a2`

Confirmacao necessaria antes de producao: verificar se esse SHA corresponde ao artifact N-1 no deploy provider.

## 7. Comandos ou acoes de rollback
Dry-run/local:

```bash
git log --oneline -5
git checkout 48eabf6d837147faf5812c6de537d492b89832a2
git diff --check
npm run lint
npm run typecheck
npm test
npm run build
```

Deploy provider autorizado:

```txt
1. Confirmar release atual e artifact N-1 no provedor de deploy.
2. Promover o artifact N-1 aprovado ou acionar rollback nativo do provedor.
3. Nao colar secrets, tokens, OAuth codes ou variaveis sensiveis na evidencia.
4. Registrar timestamp, commit atual, commit alvo e responsaveis.
```

## 8. Validacao pos-rollback
- Aplicacao responde.
- Build ou health check do artifact concluido.
- Logs sem 5xx critico sustentado.
- Observability/redaction continua funcionando.
- API critica responde.
- Auth/OAuth nao piorou.
- Billing guard nao piorou.
- PWA/cache nao piorou.
- AI fallback nao piorou.
- Roll-forward documentado.

## 9. Criterio de sucesso
- Rollback conclui dentro do SLA.
- Smoke minimo passa.
- Erros e latencia retornam para baseline aceitavel.
- Nenhum segredo ou dado sensivel aparece em logs/evidencias.
- Plano de roll-forward para a release atual ou hotfix fica documentado.

## 10. Criterio de abortar
- Artifact N-1 nao confirmado.
- Deploy provider apresenta acao ambigua ou indisponivel.
- Rollback afetaria usuarios fora de janela aprovada.
- Snapshot/config de ambiente anterior ausente.
- Evidencia indica possivel exposicao de segredo ou dado sensivel.
- Validacao pos-rollback falha em rota critica.

## 11. Comunicacao
- Abrir canal de incidente antes do rollback.
- Informar decisao, owner, ambiente, commit atual e commit alvo.
- Atualizar status durante execucao.
- Registrar conclusao, resultado de smoke, riscos e proxima acao.
- Comunicado publico somente se houver impacto externo confirmado.

## 12. Plano de retorno ao commit atual
Dry-run/local:

```bash
git checkout c8a201d34281bce9255f8830190fbd87d87c4558
git switch codex/stabilization-sprint-03-rollback
git status --short
npm run lint
npm run typecheck
npm test
npm run build
```

Deploy provider autorizado:

```txt
1. Corrigir causa raiz ou validar que a release atual pode ser promovida novamente.
2. Promover artifact do commit atual ou hotfix aprovado.
3. Reexecutar smoke minimo.
4. Fechar incidente somente apos estabilidade observada.
```
