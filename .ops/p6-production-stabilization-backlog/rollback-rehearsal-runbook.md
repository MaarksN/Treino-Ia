# P6 — Rollback Rehearsal Runbook

## Objetivo
Executar ensaio controlado de rollback para reduzir risco de release.

## Pré-requisitos

- Janela de manutenção aprovada.
- Responsáveis de engenharia e operação definidos.
- Build anterior estável identificada.
- Checklist de smoke pós-rollback pronto.

## Procedimento manual (alto nível)

1. Validar versão atual e coletar baseline de saúde.
2. Executar deploy controlado da versão candidata.
3. Rodar smoke rápido (app boot, dashboard, auth health, erros críticos).
4. Acionar rollback para versão estável anterior.
5. Rodar smoke pós-rollback e comparar baseline.
6. Registrar tempos (detecção, decisão, rollback, recuperação).
7. Publicar relatório com lições e ações corretivas.

## Critérios de sucesso

- Rollback concluído sem perda de integridade.
- App retorna estado saudável após rollback.
- Tempo total dentro do objetivo operacional definido.
