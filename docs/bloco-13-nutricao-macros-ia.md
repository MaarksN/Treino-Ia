# 🥗 Bloco 13 — Nutrição & Macros IA

## Objetivo

Adicionar camada nutricional inteligente: TDEE, metas de macros, diário alimentar, plano alimentar por IA, refeições por foto, suplementação, hidratação e score nutricional.

## Camadas do bloco

- Cálculo metabólico
- Diário alimentar
- IA nutricional
- Foto e visão computacional
- Relatórios e exportação

## Arquivos sugeridos

```txt
src/types/nutrition.ts
src/utils/tdee.ts
src/utils/macros.ts
src/utils/nutritionScore.ts
src/services/foodDatabase.ts
src/services/nutritionAiService.ts
src/components/nutrition/TdeeCalculator.tsx
src/components/nutrition/MacroTargets.tsx
src/components/nutrition/FoodDiary.tsx
src/components/nutrition/MealPhotoAnalyzer.tsx
src/components/nutrition/HydrationTracker.tsx
src/components/nutrition/IntermittentFastingTimer.tsx
src/components/nutrition/NutritionDashboard.tsx
docs/bloco-13-nutricao-macros-ia.md
```

## Tabela dos 20 itens

| # | Item | Prioridade sugerida |
|---:|---|---|
| 1 | Calculadora de TDEE (gasto calórico total diário) | MVP / Base |
| 2 | Definição de metas de macros (proteína, carbo, gordura) | MVP / Base |
| 3 | Diário alimentar diário com busca de alimentos (TACO/USDA) | MVP / Base |
| 4 | Scanner de código de barras para alimentos | Roadmap / Futuro |
| 5 | Geração de plano alimentar IA baseado no objetivo | MVP / Base |
| 6 | Análise de adequação calórica vs treino do dia | MVP / Base |
| 7 | Sugestão de pré-treino e pós-treino (alimento + horário) | MVP / Base |
| 8 | Protocolo de cutting/bulking IA com fase e semana | Premium / V2 |
| 9 | Hidratação: meta diária de água com lembretes | MVP / Base |
| 10 | Integração de suplementos: whey, creatina, cafeína | Premium / V2 |
| 11 | Receitas high-protein geradas por IA | Premium / V2 |
| 12 | Relação macro × desempenho (correlação no gráfico) | Premium / V2 |
| 13 | Modo refeição rápida (últimas refeições salvas) | MVP / Base |
| 14 | Alerta de déficit calórico excessivo (risco à saúde) | Roadmap / Futuro |
| 15 | Histórico nutricional semanal/mensal com gráfico | Premium / V2 |
| 16 | Exportar diário alimentar em PDF | Premium / V2 |
| 17 | Modo jejum intermitente com timer e janela configurável | Premium / V2 |
| 18 | Registro de refeição por foto (Gemini Vision) | Premium / V2 |
| 19 | Plano vegetariano / vegano / low-carb por preferência | Premium / V2 |
| 20 | Score nutricional diário (A–F) com dica de melhoria | MVP / Base |

## Organização por prioridade

**MVP / Base:** 1, 2, 3, 5, 6, 7, 9, 13, 20

**Premium / V2:** 8, 10, 11, 12, 15, 16, 17, 18, 19

**Roadmap / Futuro:** 4, 14

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
// Exemplo conceitual de rota/tela para o Bloco 13
{currentView === 'bloco-13' && <NutricaoMacrosIaHub />}
```

## Resultado esperado

Ao concluir o **Bloco 13 — Nutrição & Macros IA**, a plataforma terá uma camada organizada, documentada e pronta para evolução incremental, com os 20 itens mapeados e separados por prioridade.
