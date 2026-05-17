# Lote 05 — Nutrição e lifestyle

Escopo executado para os itens 33, 34, 35, 38 e 40 do bloco "Nutrição, Sono e Recuperação".

| Item | Entrega |
| --- | --- |
| 33 | Atalho PWA de hidratação com `quickHydrationMl`, ação de notificação para +250ml/+500ml e ponte para persistir no diário local. |
| 34 | Recomendação nutricional dinâmica baseada em fadiga, hidratação e fase do ciclo. |
| 35 | Seleção de receitas por metas de macros, query para API externa e lista de mercado agregada. |
| 38 | Tracker de ciclo hormonal conectado ao painel de recomendação de treino/nutrição. |
| 40 | Scan de refeição com upload de foto, estimativa via Gemini Vision e veredito contra metas do dia. |

Arquivos principais:

- `src/components/NutritionLifestyleHub.tsx`
- `src/services/nutritionLifestyleService.ts`
- `src/utils/hydrationQuickActions.ts`
- `public/sw.js`
- `public/manifest.webmanifest`
