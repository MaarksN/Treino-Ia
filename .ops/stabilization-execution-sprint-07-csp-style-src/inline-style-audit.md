# Inline Style Audit - Sprint 07

## Summary

Inline style usage is material and widespread. The audit found 128 matches related to inline style/style props across 41 source files, plus runtime CSS variable writes on `document.documentElement.style`. Removing `style-src 'unsafe-inline'` without refactoring would likely break visible UI state, dynamic colors, progress bars, chart tooltips, animation sizing, and generated share-card markup.

## Search Evidence

```txt
rg -n -F -e "style=" -e "style={{" -e "style: " -e "setAttribute('style'" -e "setAttribute(\"style\"" -e "cssText" -e "insertRule" -e "adoptedStyleSheets" -e "dangerouslySetInnerHTML" src index.html vite.config.ts vercel.json
Select-String -SimpleMatch -Path @("src\**\*","index.html","vite.config.ts","vercel.json") -Pattern $patterns -ErrorAction SilentlyContinue
rg -n 'style=\{\{|style=\{|contentStyle=|itemStyle=|labelStyle=|dangerouslySetInnerHTML|style\.setProperty|document\.documentElement\.style' src
```

| Arquivo | Padrao encontrado | Uso | Risco | Acao |
|---|---|---|---|---|
| `src/pages/ActiveWorkout.tsx` | Multiple `style={{ ... }}` props | Full page layout, colors, spacing, progress and button styling. | High if `style-src 'unsafe-inline'` is removed; route could lose core layout/visual state. | Refactor to classes/CSS variables before strict removal. |
| `src/components/WorkoutShareCard.tsx` | Many `style={{ ... }}` props + `html2canvas` capture target | Share-card rendering uses inline layout, colors, typography and dynamic theme values. | High; export/share visual could break and html2canvas output could regress. | Convert to class-based templates or CSS custom properties, then smoke export flow. |
| `src/components/AnalyticsDashboard.tsx` | `style={{ ... }}`, `contentStyle`, `itemStyle` | Dynamic progress bars and Recharts tooltip styles. | High; chart tooltips and dynamic bars depend on inline styles/runtime props. | Replace with CSS classes where possible; validate Recharts separately. |
| `src/components/ExerciseCard.tsx` | `style={{ transform, transition }}`, Recharts tooltip props | Swipe transform, transitions, charts and tooltip styling. | High; interactions and chart surfaces can visually regress. | Move swipe state to CSS variable/classes or keep exception until migrated. |
| `src/components/BiometricDashboard.tsx` | Dynamic color/background/border inline styles | Score colors and phase cards use computed values. | Medium/high; health/biometric visual signals may lose semantic color. | Introduce token/class mapping or CSS variables. |
| `src/components/HormonalCycleTracker.tsx` | Dynamic color/background/border inline styles | Cycle phase cards and legends. | Medium/high; phase state visual meaning depends on inline styling. | Convert phase config to class/token map. |
| `src/components/WearableSync.tsx` | Dynamic `borderColor`, `color`, `background`, width styles | Heart-rate zone colors and chart-like bars. | Medium/high; wearable zone UI likely degrades. | Refactor to CSS variables/classes and smoke wearable tab. |
| `src/components/SleepTracker.tsx` | Dynamic color/background + Recharts tooltip styles | Sleep quality colors and chart tooltip. | Medium/high; visual state and tooltip styling could break. | Refactor state colors and validate charts. |
| `src/components/ConsistencyHeatmap.tsx` | Dynamic background/position/width styles | Heatmap cell colors and month positioning. | Medium/high; heatmap can lose layout/meaning. | Convert color scale/positions to CSS variables or generated classes. |
| `src/components/ThemeSelector.tsx` | Dynamic theme preview style props | Theme swatches and preview colors. | Medium; style strict removal can break theme selection preview. | Use CSS variables/data attributes. |
| `src/App.tsx`, `src/utils/themeUtils.ts`, `src/utils/accessibility.ts` | `document.documentElement.style.setProperty(...)` | Runtime theme and accessibility CSS variables. | Medium; strict CSP impact must be browser-tested because runtime style mutation is active. | Validate with strict CSP candidate before removal. |
| `src/components/AICoachChat.tsx`, `src/components/AssistantPopup.tsx`, `src/components/ExerciseCard.tsx` | `motion/react` components plus style props | Runtime animation/layout effects. | Medium/high; motion may inject transform/transition styles. | Smoke mounted motion components under strict candidate before removal. |
| `src/components/ExportPanel.tsx` | Literal HTML `style="..."` inside export template string | Exported/report HTML watermark styling. | Medium; generated HTML or preview/export content may rely on inline style. | Move generated export styling to CSS or documented print/export stylesheet. |
| `src/pages/Dashboard/components/socialContent/OfflineMediaViewer.tsx` | `dangerouslySetInnerHTML` for sanitized SVG content | Inline SVG rendering path. | Medium; not a style-src issue by itself, but needs CSP review when tightening inline surfaces. | Keep blocked from strict declaration until SVG/media smoke is covered. |
| `index.html` | External Google Fonts stylesheet, no inline `<style>` found | Fonts load from `fonts.googleapis.com`; scripts are external. | Low for inline style, high if provider is removed. | Preserve `https://fonts.googleapis.com` and `https://fonts.gstatic.com`. |
| `vercel.json` | `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` | Current CSP exception. | Medium security risk, but removal is high visual/runtime risk today. | Maintain exception with migration plan. |
