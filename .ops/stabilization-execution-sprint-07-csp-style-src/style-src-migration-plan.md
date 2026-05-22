# Style-src Migration Plan

## 1. Onde ha estilos inline

- Layout completo de `src/pages/ActiveWorkout.tsx`.
- Progress bars em `ActiveWorkoutView`, `BadgeSystem`, `GamificationHub`, `NutritionPanel`, `StreakTracker`, `VolumeLandmarks`, `PlanGenerationProgress`, `RecoveryReadinessSection`, `RemoteGamifiedPanel`, `WeeklyChallengePanel` e componentes correlatos.
- Cores dinamicas em `BiometricDashboard`, `HormonalCycleTracker`, `HydrationTracker`, `NutritionLifestyleHub`, `ReadinessIndex`, `RestTimer`, `SleepTracker`, `WearableSync` e `PoseDetector`.
- Chart tooltip styles em componentes Recharts (`AnalyticsDashboard`, `ExerciseCard`, `ProgressCharts`, `SleepTracker`, `WearableSync`).
- Motion/transform styles em `AICoachChat`, `AssistantPopup`, `ExerciseCard` e componentes com animacao dinamica.
- Share/export card em `WorkoutShareCard` e report/export template em `ExportPanel`.
- CSS variable writes em `App`, `themeUtils` e `accessibility`.

## 2. O que precisa ser refatorado

1. Trocar progress bar widths para CSS custom properties em classes conhecidas, com valores sanitizados.
2. Converter semantic color configs para token/class maps quando os valores forem finitos.
3. Isolar casos realmente dinamicos em CSS variables de escopo controlado e testar impacto CSP.
4. Mover HTML export/report styles para stylesheet ou classes em template controlado.
5. Validar Recharts tooltips sem `contentStyle`/`itemStyle`, ou criar componentes tooltip customizados com classes.
6. Validar `motion/react` com transforms/classes ou aceitar excecao documentada se a lib exigir style attributes.
7. Substituir layout inline de `src/pages/ActiveWorkout.tsx` por classes/Tailwind.

## 3. Nonce/hash necessario?

- Nonce pode ser util para `<style>` tags geradas pelo app ou por libs, mas nao resolve a maioria dos `style` attributes.
- Hash nao e adequado para valores dinamicos como progress, transform, colors e tooltip styles.
- `style-src-elem`/`style-src-attr` e o melhor caminho de politica depois do refactor:

```txt
style-src 'self' https://fonts.googleapis.com;
style-src-elem 'self' https://fonts.googleapis.com;
style-src-attr 'none';
```

Essa politica so deve ser aplicada quando os style attributes produtivos tiverem sido removidos ou quando houver excecao conscientemente aceita.

## 4. Como validar visualmente

- Servir `dist` com CSP candidata real, nao apenas `vite preview`.
- Executar browser smoke desktop e mobile.
- Capturar console errors/warnings e violacoes CSP.
- Verificar computed styles essenciais: fonte display, background, text color, progress widths, chart tooltip, dynamic health colors e motion transform.
- Comparar screenshots antes/depois para rotas principais.

## 5. Rotas/componentes que precisam smoke

- Boot e rota inicial/Dashboard.
- Anamnese/profile form.
- Active workout.
- Analytics/charts.
- Sleep, hydration, wearable, biometric/readiness panels.
- Workout share/export card.
- Components using `motion/react` mounted in UI.
- Mobile viewport for bottom nav/cards/progress bars.

## 6. Criterio para remover unsafe-inline

- Zero `style` attributes produtivos sem alternativa ou excecao aprovada.
- Google Fonts preservado (`fonts.googleapis.com` e `fonts.gstatic.com`).
- `script-src` continua sem `unsafe-inline`/`unsafe-eval`.
- Build, lint, typecheck and unit tests passing.
- Browser smoke under real candidate CSP passing on desktop and mobile.
- No relevant CSP violations in browser console.
- No visual regression in core routes/components.
