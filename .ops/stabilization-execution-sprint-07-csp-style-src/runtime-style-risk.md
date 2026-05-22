# Runtime Style Risk - Sprint 07

| Fonte | Possivel inline style? | Evidencia | Risco se remover unsafe-inline | Decisao |
|---|---|---|---|---|
| React `style` props | Sim | 128 audit matches across 41 source files. | High; React renders these as style attributes that strict `style-src` can block. | Do not remove in this sprint. |
| Runtime theme CSS variables | Sim | `src/App.tsx`, `src/utils/themeUtils.ts`, `src/utils/accessibility.ts` call `.style.setProperty(...)`. | Medium; theme/accessibility state can regress if style mutation is affected. | Validate under strict candidate after refactor. |
| `motion/react` | Sim/likely | `AICoachChat`, `AssistantPopup`, `ExerciseCard` import `motion/react` and render `<motion.*>`. | Medium/high; transforms and animation styles can be runtime-applied. | Smoke mounted motion components before strict mode. |
| Recharts | Sim/likely | `AnalyticsDashboard`, `ExerciseCard`, `ProgressCharts`, `SleepTracker`, `WearableSync` use `Tooltip`, `ResponsiveContainer`, `contentStyle`, `itemStyle`, `labelStyle`. | Medium/high; charts/tooltips may rely on inline style and injected SVG attributes. | Keep providers and inline exception until chart smoke exists. |
| `html2canvas` | Indirect | `WorkoutShareCard` uses `window.html2canvas` and heavily styled capture markup. | Medium; generated image/export can regress if card inline styles are blocked. | Keep `script-src` provider and refactor card styles before strict removal. |
| Dynamic progress bars | Sim | Width/background inline styles in workout, gamification, nutrition, readiness and dashboards. | High; progress indicators lose size/color. | Convert to CSS variables/classes. |
| Dynamic semantic colors | Sim | Biometric, sleep, hydration, wearable and hormonal components use inline colors. | Medium/high; semantic health/zone color can disappear. | Map to known classes or CSS variables with tests/smoke. |
| Generated export/report HTML | Sim | `ExportPanel` template contains literal `style="..."`. | Medium; report/watermark styling may break under strict style-src. | Move generated styles to class/CSS or document export exception. |
| Google Fonts | External stylesheet, not inline | `index.html` links `fonts.googleapis.com`; CSP has `style-src ... https://fonts.googleapis.com`, `font-src ... https://fonts.gstatic.com`. | High if blocked; typography visibly changes. | Preserve font providers. |
| Tailwind/Vite CSS bundle | No inline dependency for build CSS | Build emits `dist/assets/index-*.css`. | Low if `style-src 'self'` preserved. | Preserve `'self'` in `style-src`. |
