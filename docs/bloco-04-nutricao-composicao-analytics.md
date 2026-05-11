# Bloco 04 — Nutrição, Composição Corporal e Analytics

## Status

Implementado como módulo integrado ao dashboard principal.

## Persistência

- Produção: Supabase com RLS nas tabelas de nutrição, medidas corporais, fotos de progresso e metas de recomposição.
- Fotos corporais: Supabase Storage no bucket privado `body-progress-photos`.
- Desenvolvimento local sem Supabase ou sem sessão: fallback explícito com `dataMode: "mock_dev_only"`.

## Backend

Migration:

- `supabase/migrations/20260511031500_block04_nutrition_body_analytics.sql`

Tabelas:

- `nutrition_macro_targets`
- `nutrition_meals`
- `nutrition_supplements`
- `nutrition_favorite_foods`
- `body_metrics`
- `body_progress_photos`
- `body_recomposition_goals`

## Frontend

Componentes integrados:

- `NutritionPanel`
- `BodyCompositionTracker`
- `AnalyticsDashboard`
- `ProgressCharts`
- `ConsistencyHeatmap`

## Observações

As chamadas de IA continuam passando pelo proxy backend existente (`/api/gemini-proxy`). Quando a IA não está disponível, macros e sugestões essenciais usam cálculo determinístico, não dados fake.
