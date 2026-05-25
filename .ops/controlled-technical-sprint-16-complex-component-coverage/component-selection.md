# Controlled Technical Sprint 16 - Component Selection

| Componente | Ja tem teste? | Requer mocks | Complexidade | Risco | Escolhido? | Motivo |
|---|---:|---|---|---|---:|---|
| `src/components/ExerciseLibraryModal.tsx` | Nao | `crypto.randomUUID` only | Media | Baixo | Sim | Covers search, filters, favorites, empty state, custom exercise persistence, and close callback with no real network. |
| `src/components/ImportWorkoutView.tsx` | Nao | `FileReader` behavior through jsdom; no service mocks required for PDF flows | Media | Medio-baixo | Sim | Covers file selection, guard states, crop inputs, blocked file fallback, loading state, and import callback using local files only. |
| `src/components/ExportPanel.tsx` | Nao | `PremiumFeatureGate`, export utilities, `window.open` | Media | Medio | Sim | Covers export/backup/restore interactions while isolating entitlement and download/print side effects. |
| `src/components/ExerciseCard.tsx` | Nao | Callback props and richer exercise fixtures | Alta | Medio | Nao | Large candidate, but broader surface is better suited for a dedicated pass to avoid over-scoping this sprint. |
| `src/components/AnamnesisForm.tsx` | Nao | Form callbacks only | Alta | Medio | Nao | Valuable target, but larger branch matrix than the selected three and likely better for focused form-validation coverage. |
| `src/components/CheckInModule.tsx` | Nao | `navigator.geolocation`, `navigator.bluetooth`, timers | Media | Medio | Nao | Hardware browser API mocking is controlled but less representative than the selected file/export/library workflows. |
| `src/components/PremiumPaywall.tsx` | Nao | Billing entitlement service | Media | Medio-alto | Nao | Avoids touching real billing/OAuth/Stripe-adjacent flows in this sprint. |
| `src/components/WearableSync.tsx` | Nao | Browser hardware APIs | Alta | Alto | Nao | Avoided because it is device/provider oriented and higher risk for this controlled coverage expansion. |

## Selection Summary

The selected targets provide real component coverage across list/search UI, file import preparation, and export/restore controls. All external or privileged behavior is mocked or represented with local jsdom APIs only.
