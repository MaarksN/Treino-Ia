# Roadmap tecnico - Fase 2 + Fase 3

## Objetivo

Transformar o app em um ciclo semanal de uso real:

```txt
anamnese -> plano atual -> treino ativo -> registro por serie -> historico -> IA adapta -> proxima semana
```

Esta fase deve priorizar valor recorrente antes de paywall. O usuario precisa sentir que o app lembra o treino anterior, reduz friccao durante a sessao e entrega uma decisao util para o proximo treino.

## Estado atual do projeto

Arquivos ja existentes que devem ser aproveitados:

```txt
src/pages/Dashboard.tsx
src/components/ActiveWorkoutView.tsx
src/components/SetTracker.tsx
src/components/RestTimer.tsx
src/services/database.ts
src/rules/iaEngine.ts
src/services/aiPersonalizationService.ts
src/utils/personalizationRules.ts
src/utils/predictiveTraining.ts
src/utils/prUtils.ts
supabase/migrations/20260511052000_legacy_training_profile_plan_history.sql
```

Leitura tecnica:

| Area | Ja existe | Lacuna principal |
|---|---|---|
| Plano de treino | `calculateTrainingPlan` cria plano por perfil | Plano precisa ser salvo, reusado e ajustado apos sessoes reais |
| Treino ativo | `ActiveWorkoutView`, `SetTracker`, `RestTimer` | Dashboard principal ainda nao expoe a jornada completa |
| Series | `SetLog` suporta carga, reps, RPE e falhas | Falta persistencia granular por serie e autopreenchimento robusto |
| Historico | `DatabaseService.saveWorkoutSession` salva sessoes | Falta normalizar historico para analytics, PRs e IA semanal |
| IA adaptativa | `aiPersonalizationService` tem contratos e fallbacks | Falta orquestrador de adaptacao semanal aplicado ao plano atual |
| Supabase | Tabelas de perfil, plano e historico existem | Falta tabela granular de series, PRs e recomendacoes aceitas/rejeitadas |

## Principios de entrega

- Uma feature so conta como pronta quando tem fluxo real, dados persistidos, fallback local, estados de erro e teste minimo.
- A IA nao deve sobrescrever treino automaticamente sem mostrar resumo e pedir aceite quando a mudanca for relevante.
- Toda recomendacao de IA deve ter guardrails deterministicos: dor, fadiga, sono ruim e RPE alto bloqueiam aumento agressivo.
- Registro por serie e historico sao a fonte de verdade. Sem bons dados, a IA vira opiniao generica.
- Paywall so entra depois que o ciclo semanal estiver funcionando e demonstrar valor claro.

## Epicos

### E1 - Jornada treino ativo ponta a ponta

Objetivo: permitir escolher o treino do dia, iniciar fullscreen, registrar series e finalizar com resumo.

Escopo MVP:

- Listar dias do plano atual no dashboard.
- Botao "Iniciar treino" por dia.
- Abrir `ActiveWorkoutView` em modo fullscreen.
- Marcar series individualmente em `SetTracker`.
- Registrar carga, reps, RPE, falha concentrica, falha tecnica e nota por serie.
- Finalizar treino com duracao, volume total, exercicios concluidos e feedback rapido.
- Persistir a sessao via `DatabaseService.saveWorkoutSession`.

Fora do MVP:

- Swipe mobile refinado.
- Wearables.
- Analise de video.
- Gamificacao.

Checklist de pronto:

- [ ] Usuario inicia treino a partir do dashboard.
- [ ] Usuario consegue concluir treino sem preencher todos os campos opcionais.
- [ ] Cada serie concluida tem `completedAt`.
- [ ] Volume total usa soma de `weight * reps` por serie, nao apenas valores agregados.
- [ ] Sessao salva em Supabase quando autenticado e localStorage quando offline/sem auth.
- [ ] Resumo aparece apos finalizar.
- [ ] Teste cobre calculo de volume e finalizacao com series incompletas.

### E2 - Historico e autopreenchimento

Objetivo: reduzir friccao semanal usando a ultima sessao como ponto de partida.

Escopo MVP:

- Buscar ultimas sessoes do usuario.
- Exibir "ultima vez" por exercicio com melhor serie relevante.
- Autopreencher carga/reps sugeridas no primeiro contato com o exercicio.
- Preservar edicao manual do usuario.
- Criar tela ou secao de historico com ultimos treinos.
- Mostrar PRs recentes por exercicio.

Regras sugeridas:

| Caso | Acao |
|---|---|
| Mesmo exercicio e RPE <= 8 | Sugerir mesma carga e +1 rep ou +2,5% de carga |
| Mesmo exercicio e RPE 8,5-9 | Sugerir repetir carga/reps |
| RPE >= 9,5 ou falha tecnica | Sugerir manter ou reduzir 2,5%-5% |
| Dor/falha tecnica recorrente | Sugerir substituicao ou reduzir amplitude/carga |
| Sem historico | Usar prescricao do plano |

Checklist de pronto:

- [ ] Historico carrega em menos de um estado visual claro: loading, vazio, erro ou pronto.
- [ ] Autopreenchimento nao sobrescreve campos ja editados.
- [ ] PR por exercicio considera peso, reps e data.
- [ ] Usuario consegue ver no minimo os ultimos 10 treinos.
- [ ] Testes cobrem sugestao por RPE e falha tecnica.

### E3 - Normalizacao de dados de treino

Objetivo: sair de blobs JSON suficientes para MVP e criar estrutura pronta para analytics/IA.

Tabelas Supabase propostas:

```sql
training_workout_sessions
training_workout_exercise_logs
training_workout_set_logs
training_personal_records
training_ai_recommendations
training_plan_revisions
```

Modelo proposto:

| Tabela | Responsabilidade | Campos chave |
|---|---|---|
| `training_workout_sessions` | Uma sessao concluida ou em progresso | `id`, `user_id`, `plan_id`, `day_id`, `started_at`, `completed_at`, `duration_seconds`, `total_volume`, `readiness_score` |
| `training_workout_exercise_logs` | Um exercicio dentro da sessao | `id`, `session_id`, `exercise_id`, `exercise_name`, `muscle_group`, `target_sets`, `target_reps`, `completed`, `notes` |
| `training_workout_set_logs` | Cada serie executada | `id`, `exercise_log_id`, `set_number`, `weight`, `reps`, `rpe`, `failed`, `technical_failure`, `completed_at` |
| `training_personal_records` | PRs derivados ou confirmados | `id`, `user_id`, `exercise_name`, `weight`, `reps`, `estimated_1rm`, `session_id`, `achieved_at` |
| `training_ai_recommendations` | Recomendacoes apresentadas ao usuario | `id`, `user_id`, `feature`, `recommendation_json`, `status`, `reason`, `created_at` |
| `training_plan_revisions` | Historico de mudancas no plano | `id`, `user_id`, `plan_id`, `source`, `diff_json`, `applied_at` |

Politicas RLS:

- `select`, `insert`, `update`, `delete` apenas quando `auth.uid() = user_id`.
- Tabelas filhas podem usar `exists` contra a sessao/plano do proprio usuario.
- Recomendacoes de IA devem pertencer ao usuario e nunca expor prompt bruto com dados sensiveis alem do necessario.

Checklist de pronto:

- [ ] Migration criada com indexes por `user_id`, data e exercicio.
- [ ] RLS habilitado em todas as tabelas.
- [ ] Service TypeScript usa as tabelas novas sem quebrar fallback local.
- [ ] Dados legados em `training_workout_history_records.record_json` continuam legiveis.
- [ ] Teste de adapter converte sessao antiga para formato novo.

### E4 - Adaptacao IA semanal

Objetivo: gerar recomendacao semanal usando historico, RPE, aderencia, PRs e sinais de fadiga.

Entrada minima:

- Perfil.
- Plano atual.
- Ultimas 2 a 4 semanas de sessoes.
- Series por exercicio.
- PRs recentes.
- Check-in de recovery quando existir.

Saida esperada:

```ts
type WeeklyAdaptationDecision = {
  summary: string;
  volumeAdjustment: 'increase' | 'maintain' | 'reduce';
  intensityAdjustment: 'increase' | 'maintain' | 'reduce';
  exerciseChanges: Array<{
    exerciseName: string;
    action: 'increase_load' | 'maintain' | 'reduce_load' | 'swap' | 'remove';
    reason: string;
    suggestedPrescription?: string;
  }>;
  safetyNotes: string[];
  confidence: number;
};
```

Fluxo:

1. Rodar regras locais em `personalizationRules`.
2. Chamar `adaptWeeklyPlan`, `generateLoadProgressionAdvice`, `predictPlateau` e `generateDeloadAdvice`.
3. Mesclar resultado em uma unica recomendacao.
4. Salvar em `training_ai_recommendations` com status `pending`.
5. Mostrar card de revisao para o usuario.
6. Se aceito, criar `training_plan_revisions` e atualizar plano atual.
7. Se rejeitado, manter plano e registrar motivo opcional.

Guardrails obrigatorios:

| Sinal | Bloqueio |
|---|---|
| Dor ou limitacao | Nao aumentar carga no exercicio afetado |
| RPE medio >= 9 | Nao aumentar intensidade global |
| Sono < 6h ou stress alto | Reduzir agressividade |
| Falha tecnica recorrente | Priorizar tecnica ou troca de exercicio |
| Aderencia baixa | Reduzir complexidade antes de aumentar volume |

Checklist de pronto:

- [ ] Recomendacao semanal roda com IA e fallback deterministico.
- [ ] Toda recomendacao fica auditavel.
- [ ] Usuario pode aceitar ou rejeitar.
- [ ] Plano anterior fica recuperavel via revisao.
- [ ] Nenhuma sugestao viola guardrails de dor/fadiga.
- [ ] Testes cobrem pelo menos: progressao, deload, plato e dor.

### E5 - Devolutiva pos-treino

Objetivo: fechar a sessao com recompensa informacional imediata.

Escopo MVP:

- Resumo de volume, duracao, exercicios concluidos e series registradas.
- PRs quebrados.
- Melhor serie do treino.
- Alerta simples de fadiga quando RPE/falhas estiverem altos.
- Mensagem da IA usando `generatePremiumPostWorkoutFeedback` quando disponivel.
- Fallback local quando IA falhar.

Checklist de pronto:

- [ ] Tela de resumo aparece apos finalizar.
- [ ] PRs sao destacados.
- [ ] Devolutiva funciona sem `GEMINI_API_KEY`.
- [ ] Texto da IA nao faz diagnostico medico.
- [ ] Usuario consegue voltar ao dashboard.

## Sequencia recomendada de implementacao

### Sprint 1 - Fluxo real de treino

1. Integrar plano atual com `ActiveWorkoutView` no dashboard.
2. Criar builder de sessao a partir de `WorkoutDay`.
3. Persistir sessao finalizada com series.
4. Calcular volume real por serie.
5. Adicionar resumo pos-treino local.

### Sprint 2 - Historico, PRs e autopreenchimento

1. Criar util de `lastPerformanceByExercise`.
2. Criar util de `detectPersonalRecords`.
3. Exibir ultimos treinos no dashboard.
4. Autopreencher primeira serie usando historico.
5. Testar regras de RPE.

### Sprint 3 - Banco granular

1. Criar migration para sessoes, exercicios, series, PRs e recomendacoes.
2. Implementar service novo ou adapter em `DatabaseService`.
3. Manter compatibilidade com historico legado.
4. Adicionar indices e RLS.

### Sprint 4 - IA semanal

1. Criar `weeklyAdaptationService`.
2. Orquestrar regras locais + IA estruturada.
3. Salvar recomendacoes com status.
4. Criar card de revisao e aplicar plano revisado.
5. Adicionar auditoria e testes.

### Sprint 5 - Polimento mobile

1. Melhorar fullscreen do treino ativo.
2. Haptic feedback ao concluir serie.
3. Timer por serie/exercicio.
4. Estado offline claro.
5. Ajustes de responsividade.

## Dependencias tecnicas

| Dependencia | Necessaria para | Status |
|---|---|---|
| Supabase Auth | Dados por usuario e RLS | Ja previsto |
| Supabase DB | Historico, series e revisoes | Parcial |
| Gemini proxy | Adaptacao IA segura | Ja previsto |
| Feature flags | Rollout gradual | Ja previsto |
| Vitest | Regras de progressao e adapters | Ja previsto |
| PWA/offline | Treino em academia sem conexao | Depois do MVP de treino |

## Arquivos novos sugeridos

```txt
src/services/workoutSessionService.ts
src/services/workoutHistoryService.ts
src/services/weeklyAdaptationService.ts
src/utils/workoutSessionBuilder.ts
src/utils/workoutProgression.ts
src/utils/personalRecords.ts
src/components/PostWorkoutSummary.tsx
src/components/WorkoutHistoryPanel.tsx
src/components/WeeklyAdaptationCard.tsx
src/services/workoutSessionService.test.ts
src/utils/workoutProgression.test.ts
supabase/migrations/YYYYMMDDHHMMSS_training_execution_core.sql
```

## Feature flags sugeridas

```ts
training.activeWorkoutV2
training.setLevelLogging
training.historyAndPrs
training.weeklyAiAdaptation
training.postWorkoutFeedback
```

## Metricas de produto

| Metrica | Porque importa |
|---|---|
| `workout_started` | Mede ativacao do core |
| `workout_completed` | Mede valor real |
| `set_logged` | Mede qualidade dos dados |
| `history_viewed` | Mede retorno ao progresso |
| `weekly_adaptation_generated` | Mede uso da IA |
| `weekly_adaptation_accepted` | Mede confianca na IA |
| `post_workout_feedback_viewed` | Mede recompensa apos treino |

## Riscos e mitigacoes

| Risco | Mitigacao |
|---|---|
| IA recomendar excesso | Guardrails deterministicos antes/depois da IA |
| Dados ruins por friccao | Autopreenchimento e campos opcionais |
| Supabase indisponivel | Fallback local e fila offline |
| Schema duplicado | Adapter legado e migration incremental |
| UX pesada durante treino | Fluxo fullscreen, botoes grandes e minimo texto |

## Definicao de pronto da Fase 2 + Fase 3

- [ ] Usuario cria ou carrega plano atual.
- [ ] Usuario inicia o treino do dia.
- [ ] Usuario registra cada serie com carga, reps, RPE e falhas opcionais.
- [ ] Timer de descanso funciona no treino ativo.
- [ ] Sessao finalizada gera historico.
- [ ] Historico mostra ultimas sessoes e PRs.
- [ ] Proximo treino usa dados anteriores para sugestao/autopreenchimento.
- [ ] IA gera adaptacao semanal com fallback seguro.
- [ ] Usuario aceita/rejeita adaptacao antes de alterar o plano.
- [ ] Supabase persiste dados por usuario com RLS.
- [ ] Local fallback continua funcionando sem auth.
- [ ] Testes cobrem calculos criticos e regras de progressao.
- [ ] Nenhuma recomendacao critica depende apenas de texto livre da IA.

## Proximo passo operacional

Comecar pela Sprint 1. A primeira entrega deve ser pequena e demonstravel: iniciar treino pelo dashboard, registrar series, finalizar sessao e ver resumo salvo no historico.
