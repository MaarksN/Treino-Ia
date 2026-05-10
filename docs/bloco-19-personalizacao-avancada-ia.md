# 🤖 Bloco 19 — Personalização Avançada de IA

## Objetivo

Criar um coach IA realmente personalizado: personas, memória, progressive overload, periodização, platô, lesões, replanejamento, previsão de PR, voz, vídeo, relatórios e notificações preditivas.

## Camadas do bloco

- Personalidade do coach
- Memória e histórico
- Treino adaptativo
- Multimodalidade com voz/vídeo
- Previsões e relatórios

## Arquivos sugeridos

```txt
src/types/ai.ts
src/services/aiCoachService.ts
src/services/aiMemoryService.ts
src/services/aiPeriodizationService.ts
src/services/aiVisionService.ts
src/services/aiReportService.ts
src/utils/predictiveTraining.ts
src/utils/coachPersonas.ts
src/components/ai/CoachPersonaSelector.tsx
src/components/ai/AiCoachChat.tsx
src/components/ai/AiVoiceCoach.tsx
src/components/ai/ExerciseVideoAnalysis.tsx
src/components/ai/PlateauDetector.tsx
src/components/ai/PredictivePrCard.tsx
src/components/ai/AiPersonalizationHub.tsx
docs/bloco-19-personalizacao-avancada-ia.md
```

## Tabela dos 20 itens

| # | Item | Prioridade sugerida |
|---:|---|---|
| 1 | Personas de coach IA: Rigoroso, Motivador, Técnico, Amigo | MVP / Base |
| 2 | Memória de longo prazo (IA lembra histórico de 6 meses) | Premium / V2 |
| 3 | Ajuste automático de carga semana a semana (progressive overload) | MVP / Base |
| 4 | Periodização IA: Mesociclo → Microciclo automático | Premium / V2 |
| 5 | Detecção de platô e proposta de variação de estímulo | MVP / Base |
| 6 | Substituição automática de exercício por lesão reportada | MVP / Base |
| 7 | Replanejamento por dia perdido ("faltou ontem?") | MVP / Base |
| 8 | Análise preditiva: quando atingirá o próximo PR? | Premium / V2 |
| 9 | Recomendação de suplemento personalizada por perfil | Premium / V2 |
| 10 | Chat com IA coach em linguagem natural (streaming) | MVP / Base |
| 11 | Modo voz: resposta em áudio (TTS Gemini) | Premium / V2 |
| 12 | Análise de vídeo de execução (Gemini Vision) | Premium / V2 |
| 13 | Geração de variações do treino atual (A/B de estímulo) | MVP / Base |
| 14 | Plano de pico: semanas finais antes de competição | Premium / V2 |
| 15 | Protocolo de reintrodução pós-pausa (voltou após 30 dias) | MVP / Base |
| 16 | Relatório trimestral em PDF gerado por IA | Premium / V2 |
| 17 | Comparação com baseline de usuários similares (anon.) | Roadmap / Futuro |
| 18 | Notificação preditiva ("você tende a pular às quintas") | Premium / V2 |
| 19 | Score de consistência com forecast de tendência | MVP / Base |
| 20 | Modo turbo: treino de 20min com máxima eficiência | MVP / Base |

## Organização por prioridade

**MVP / Base:** 1, 3, 5, 6, 7, 10, 13, 15, 19, 20

**Premium / V2:** 2, 4, 8, 9, 11, 12, 14, 16, 18

**Roadmap / Futuro:** 17

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
// Exemplo conceitual de rota/tela para o Bloco 19
{currentView === 'bloco-19' && <PersonalizacaoAvancadaDeIaHub />}
```

## Resultado esperado

Ao concluir o **Bloco 19 — Personalização Avançada de IA**, a plataforma terá uma camada organizada, documentada e pronta para evolução incremental, com os 20 itens mapeados e separados por prioridade.
