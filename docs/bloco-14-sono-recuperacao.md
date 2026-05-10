# 😴 Bloco 14 — Sono & Recuperação

## Objetivo

Criar um sistema de readiness e recovery com sono, DOMS, humor, energia, estresse, PSE, HRV, deload, overtraining e recomendação de treino/descanso por IA.

## Camadas do bloco

- Registro de sono e bem-estar
- Recovery score
- Deload e overtraining
- Correlação performance x recuperação
- Recomendações de IA

## Arquivos sugeridos

```txt
src/types/recovery.ts
src/utils/recoveryScore.ts
src/utils/overtraining.ts
src/utils/sleepAnalytics.ts
src/services/recoveryAiService.ts
src/components/recovery/SleepLog.tsx
src/components/recovery/RecoveryScoreCard.tsx
src/components/recovery/DomsHeatmap.tsx
src/components/recovery/WellnessDiary.tsx
src/components/recovery/RecoveryRecommendation.tsx
src/components/recovery/SleepPerformanceChart.tsx
src/components/recovery/RecoveryDashboard.tsx
docs/bloco-14-sono-recuperacao.md
```

## Tabela dos 20 itens

| # | Item | Prioridade sugerida |
|---:|---|---|
| 1 | Registro diário de sono (horário, duração, qualidade 1–5) | MVP / Base |
| 2 | Score de recuperação do dia (sono + treino anterior) | MVP / Base |
| 3 | Recomendação IA: treinar hoje ou descansar? | MVP / Base |
| 4 | Protocolo de deload automático (a cada 4–6 semanas) | Premium / V2 |
| 5 | Monitoramento de DOMS por grupo muscular | MVP / Base |
| 6 | Escala de PSE (Percepção Subjetiva de Esforço) por sessão | MVP / Base |
| 7 | Diário de bem-estar: humor, energia, estresse (1–5) | MVP / Base |
| 8 | Alerta de overtraining baseado em padrão de fadiga | MVP / Base |
| 9 | Heatmap corporal de recuperação por grupo muscular | MVP / Base |
| 10 | Gráfico sono × performance ao longo do tempo | Premium / V2 |
| 11 | Rotina de alongamento/mobilidade pós-treino gerada por IA | Premium / V2 |
| 12 | Protocolo de banho frio/contraste com timer | Roadmap / Futuro |
| 13 | Sugestão de horário ideal de treino por cronótipo | Premium / V2 |
| 14 | Integração Apple Health (leitura de dados de sono) | Roadmap / Futuro |
| 15 | Lembretes de horário de dormir personalizados | Premium / V2 |
| 16 | Score HRV simplificado (input manual ou via wearable) | Premium / V2 |
| 17 | Semana de recuperação ativa: treinos leves automáticos | Premium / V2 |
| 18 | Histórico de qualidade de sono com tendência mensal | Premium / V2 |
| 19 | Correlação sono × ganho de força no período | Premium / V2 |
| 20 | Notificação matinal com score do dia ("Você está em 78% hoje") | MVP / Base |

## Organização por prioridade

**MVP / Base:** 1, 2, 3, 5, 6, 7, 8, 9, 20

**Premium / V2:** 4, 10, 11, 13, 15, 16, 17, 18, 19

**Roadmap / Futuro:** 12, 14

## Plano de execução recomendado

### Etapa 1 — Fundação

- Criar os tipos principais do bloco.
- Criar os utilitários/serviços de domínio.
- Criar os componentes de UI sem integração externa obrigatória.
- Persistir inicialmente em `localStorage` ou mock controlado quando o backend ainda não existir.

### Etapa 2 — Integração real

- Conectar os componentes aos serviços reais.
- Adicionar validação de entrada e tratamento de erro.
- Criar logs de auditoria para ações relevantes.
- Adicionar estados de loading, empty state e error state.

### Etapa 3 — Produção

- Adicionar testes unitários para utils/serviços.
- Adicionar testes E2E para fluxos principais.
- Adicionar feature flags para liberar o bloco gradualmente.
- Medir uso, erro, conversão e retenção.

## Critérios de aceite

- Todos os 20 itens do bloco estão representados em UI, serviço, tipo ou documentação.
- O app não quebra quando recursos externos ainda não estão configurados.
- As features críticas possuem fallback seguro.
- O bloco pode ser habilitado/desabilitado por feature flag.
- O usuário entende claramente o valor do bloco na interface.

## Checklist técnico

- [ ] Criar arquivos listados na seção de arquivos sugeridos.
- [ ] Tipar entidades principais.
- [ ] Implementar serviço ou utilitário de domínio.
- [ ] Implementar componentes principais.
- [ ] Integrar no menu principal da plataforma.
- [ ] Adicionar testes dos fluxos principais.
- [ ] Validar responsividade mobile.
- [ ] Validar acessibilidade básica.
- [ ] Documentar variáveis de ambiente, se houver.
- [ ] Registrar limitações e próximos passos.

## Como integrar no menu

```tsx
// Exemplo conceitual de rota/tela para o Bloco 14
{currentView === 'bloco-14' && <SonoRecuperacaoHub />}
```

## Resultado esperado

Ao concluir o **Bloco 14 — Sono & Recuperação**, a plataforma terá uma camada organizada, documentada e pronta para evolução incremental, com os 20 itens mapeados e separados por prioridade.
