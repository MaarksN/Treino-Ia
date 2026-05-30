# Beta privado monitorado

Objetivo: operar um beta pequeno para confirmar se usuarios reais completam o ciclo principal sem suporte manual constante.

## Escopo

- Tamanho: 5 a 20 usuarios convidados manualmente.
- Superficie padrao: apenas core para audiencia `user`.
- Audiencias:
  - `user`: core somente.
  - `beta`: core mais superficies marcadas como beta.
  - `internal`: core, beta e superficies internas.
- Congelamento: nenhuma feature nova entra durante o beta, exceto correcao de bug que bloqueia treino, login, dados, IA simples ou pagamento habilitado.
- Suporte: cada convite deve conter um canal unico de suporte e feedback. Se houver URL publica, ela deve ser configurada no material de convite antes do envio.

Core habilitado:

- Cadastro/login.
- Anamnese.
- Geracao ou edicao leve de plano.
- Treino de hoje.
- Execucao do treino.
- Registro de series, cargas, repeticoes e RPE.
- Historico/evolucao.
- Recomendacao simples da IA.
- Assinatura/limites somente se billing estiver validado no ambiente.

Blocos fora do usuario comum:

- Beta: nutricao simples, recuperacao simples, importacao manual de ficha.
- Internal: social, wearables, marketplace, gamificacao avancada, hubs de plataforma, premium UX, acessibilidade avancada, IA avancada, bem-estar avancado e midia extra.
- Off: OCR, camera/form check, WebXR, tokens de parceiros, scanners biometricos e analise nutricional por foto.

## Checklist de release

Preencher uma linha por release candidata. Qualquer item vermelho bloqueia convite.

| Area             | Evidencia obrigatoria                                                    | Status esperado        |
| ---------------- | ------------------------------------------------------------------------ | ---------------------- |
| Build            | `npm run build`                                                          | Passou                 |
| Lint             | `npm run lint`                                                           | Passou                 |
| Typecheck        | `npm run typecheck`                                                      | Passou                 |
| Testes unitarios | `npm run test`                                                           | Passou                 |
| E2E core         | `npm run test:e2e`                                                       | Passou                 |
| Migrations       | `supabase migration list` e migrations aplicadas no projeto alvo         | Sem drift              |
| Rollback         | ultimo deploy estavel identificado e linkado                             | Documentado            |
| Variaveis        | `.env.example` conferido contra Vercel/Supabase                          | Sem ausencias criticas |
| Sentry           | DSN configurado, ambiente correto, evento de teste recebido              | Ativo                  |
| Supabase         | auth, RLS, leitura/escrita de perfil, plano e treino validados           | Ativo                  |
| Gemini           | proxy responde ou retorna `not_configured` explicito                     | Validado               |
| Stripe           | webhook assinado, checkout/portal testados se billing estiver habilitado | Validado               |
| Feature surface  | `VITE_FEATURE_AUDIENCE=user` para beta comum                             | Core somente           |

## Metricas minimas

Eventos instrumentados para o funil:

- `registration_completed`: cadastro local inicial ou signup Supabase concluido.
- `anamnesis_completed`: anamnese salva.
- `first_plan_created`: primeiro plano criado a partir da anamnese.
- `first_workout_started`: primeiro treino iniciado.
- `set_logged`: serie marcada como concluida.
- `workout_completed`: treino finalizado.
- `first_workout_completed`: primeiro treino finalizado.
- `day_7_return_detected`: retorno apos pelo menos 7 dias da ativacao inicial.
- `workout_save_failed`: falha ao salvar/finalizar treino.
- `ai_error`: falha em chamadas ou persistencia da recomendacao de IA.
- `billing_error`: falha de auth/API em billing.
- `critical_error_captured`: erro global ou boundary capturado.

Funil diario a revisar:

1. Convite enviado.
2. `registration_completed`.
3. `anamnesis_completed`.
4. `first_plan_created`.
5. `first_workout_started`.
6. `first_workout_completed`.
7. `day_7_return_detected`.

## Suporte

- Mensagens de erro devem dizer o que falhou e se o usuario pode tentar novamente.
- Estados vazios devem indicar a proxima acao do core.
- Falha offline/rede deve ficar explicita pelo banner de conectividade e pela mensagem de fallback local.
- O canal de suporte do convite deve pedir: email usado, etapa do fluxo, horario aproximado, print opcional e se estava online/offline.
- Bugs que impedem treino, login, salvamento ou pagamento habilitado entram no topo da fila.

## Rotina de acompanhamento

Diariamente durante o beta:

1. Revisar Sentry por erros novos, regressao de volume e usuarios impactados.
2. Revisar funil de ativacao e queda entre cada evento.
3. Conferir falhas `workout_save_failed`, `ai_error` e `billing_error`.
4. Ler feedback qualitativo e agrupar por bloqueio, friccao e expectativa.
5. Priorizar apenas bugs que impedem o ciclo principal.
6. Manter novas features congeladas.

## Rollback

Rollback rapido:

1. Congelar novos convites.
2. Promover o ultimo deploy estavel na Vercel.
3. Se houver migration com impacto, restaurar backup Supabase ou aplicar migration reversa validada.
4. Confirmar auth, plano, historico e finalizacao de treino no ambiente restaurado.
5. Avisar usuarios impactados no canal de suporte.
6. Registrar causa, impacto e prevencao.

## Decisao pos-beta

Continuar beta pequeno quando:

- 70% dos usuarios convidados concluem anamnese e primeiro plano.
- 50% iniciam pelo menos um treino.
- 35% finalizam pelo menos um treino.
- Nenhum bug aberto bloqueia login, salvamento de treino ou historico.

Abrir para mais usuarios quando:

- Taxa de falha de salvamento de treino fica abaixo de 2% por 7 dias.
- Erros criticos novos em Sentry ficam zerados por 3 dias.
- Feedback qualitativo indica que o usuario entende o que treinar hoje.
- Rollback foi ensaiado ou validado em ambiente de staging.

Bloquear release quando:

- Qualquer erro de dados perde treino, plano ou historico.
- Login/cadastro falha para mais de um usuario sem workaround claro.
- IA simples gera recomendacao vazia ou enganosa.
- Billing habilitado cobra, libera ou bloqueia acesso incorretamente.
- Sentry mostra erro recorrente no fluxo de treino ativo.

Blocos que podem voltar primeiro, nesta ordem:

1. Recuperacao simples, se nao aumentar friccao no treino.
2. Nutricao simples, se houver demanda clara no feedback.
3. Importacao manual de ficha, se reduzir suporte sem prometer OCR.
4. Billing UI completa, apenas com Stripe e entitlements validados.
5. Acessibilidade avancada, como painel interno de melhoria continua.
