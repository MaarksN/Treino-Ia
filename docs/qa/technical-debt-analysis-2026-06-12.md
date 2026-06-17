# Analise de Divida Tecnica - 2026-06-12

Status: plataforma funcional em beta privado; producao permanece NO-GO ate validacoes reais de staging, secrets e operacao.

## Onde paramos

- Worktree iniciou limpo em `main`, sem alteracoes locais pendentes.
- O ultimo documento de lote encontrado (`entrega_final_lote_02.md`) recomendava seguir para `03_lote_03_ux_pwa_core_interface_11_12_16_17_45.txt`, mas esse TXT nao existe no repositorio.
- Os itens 11, 12, 16, 17 e 45 ja constam como `implemented_now` em `src/features/strategic-items/strategicItems.registry.ts`, entao o proximo gargalo real deixou de ser esse lote e passou a ser prontidao operacional.
- A evidencia mais recente de qualidade (`docs/qa/technical-debt-execution-2026-06-05.md`) mostra gates locais PASS, mas bloqueio externo por env/secrets ausentes.

## Sinais objetivos

- Codigo de produto/API: 642 arquivos em `src` e `api`, cerca de 60.960 linhas.
- Testes: 202 arquivos de teste/spec detectados.
- Maiores arquivos atuais:
  - `src/components/platform/AdvancedPlatformHub.tsx`: 1.285 linhas.
  - `src/components/WorkoutDashboard.tsx`: 1.165 linhas.
  - `src/features/strategic-items/strategicItems.registry.ts`: 1.067 linhas.
  - `src/components/RetentionOperationsHub.tsx`: 1.031 linhas.
  - `src/pages/Dashboard.tsx`: 903 linhas.
- Registry estrategico: 78 itens `implemented_now`, 10 `foundation_created`, 11 `blocked_external_dependency`, 1 `deferred_high_risk`.
- Coverage registrado em 2026-06-05: 33.04% statements, 27.94% branches, 31.96% functions, 33.68% lines.

## Achados priorizados

| ID          | Prioridade | Area                 | Achado                                                                                                             | Impacto                                                                                         | Proximo passo                                                                                                                 |
| ----------- | ---------- | -------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| TD-2026-001 | P1         | Release              | Staging real e smokes seguem bloqueados por env/secrets.                                                           | Nao ha prova de auth, Supabase, Stripe, Gemini e rate limit reais.                              | Provisionar secrets em CI/shell seguro e rodar `preflight:sprint3`, `smoke:sprint3`, `smoke:tenant-ab`, `smoke:compliance`.   |
| TD-2026-002 | P1         | Dados/seguranca      | Isolamento A/B e migrations em banco limpo nao foram validados dinamicamente.                                      | Risco residual de RLS/IDOR/BOLA apesar de testes estaticos.                                     | Criar usuarios/tenants A/B de staging, aplicar migrations em banco limpo e registrar `supabase migration list`.               |
| TD-2026-003 | P1         | Testes               | Cobertura global segue baixa para uma plataforma com billing, compliance, IA e treino ativo.                       | Regressao em fluxo core pode passar no CI.                                                      | Subir primeiro cobertura dos fluxos core: onboarding, auth, plano, treino ativo, historico, billing entitlement e compliance. |
| TD-2026-004 | P2         | Arquitetura frontend | Componentes/hubs com mais de 1.000 linhas concentram muitos caminhos de UI.                                        | Aumenta custo de manutencao e risco em alteracoes pequenas.                                     | Extrair subcomponentes e services puros de `AdvancedPlatformHub`, `RetentionOperationsHub` e `WorkoutDashboard`.              |
| TD-2026-005 | P2         | Produto/flags        | Ha 22 itens nao totalmente produtivos (`foundation_created`, `blocked_external_dependency`, `deferred_high_risk`). | Risco de promessa de produto alem da capacidade real se flags/audiencia forem mal configuradas. | Manter features experimentais atras de `internal/off` e criar testes de visibilidade por audiencia.                           |
| TD-2026-006 | P2         | Persistencia         | `mock_dev_only` ainda aparece em fluxos de health, legacy sync, memory e gamification.                             | Pode mascarar falta de backend em ambientes mal configurados.                                   | Fortalecer alertas visuais/telemetria quando `mock_dev_only` ocorre fora de dev e ampliar testes de `ensureSafeDataMode`.     |
| TD-2026-007 | P3         | Codigo               | `strategicItems.registry.ts` virou inventario grande e manual.                                                     | Alteracoes de status ficam dificeis de auditar por lote/bloco.                                  | Quebrar registry por categoria ou gerar de fontes menores, mantendo seletor publico estavel.                                  |

## Trabalho realizado nesta rodada

- Criado `src/services/productionReadiness.ts` para consolidar criterios de prontidao de producao sem ler ou expor secrets.
- Criado `src/components/ops/ProductionReadinessPanel.tsx` como painel interno de operacao.
- Integrado o painel ao Dashboard atras da superficie interna `platformHubs`.
- Criado `src/services/productionReadiness.test.ts` cobrindo NO-GO com validacoes manuais pendentes e bloqueios de env publico.
- Adicionados testes para impedir que `platformHubs` apareca para audiencia `user`/`beta` e para validar que o painel nao expõe secrets nem cria link quebrado para docs fora do bundle.

## Recomendacao de sequencia

1. Validar o novo painel e testes locais.
2. Criar PR pequeno com painel interno + esta analise.
3. Na proxima rodada, atacar TD-2026-003 com testes de fluxo core antes de refatorar hubs grandes.
4. So considerar release candidate apos smokes reais de staging e tenant A/B passarem.
