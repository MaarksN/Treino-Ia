# Batch: Data, Premium UX, Media & Adaptive Protocols — Evidence

**Lote:** Itens 08, 18, 19, 28, 94
**Data:** 2026-05-17
**Autor:** Engenheiro Staff Frontend/React

---

## 1. Objetivo do lote

Implementar 5 itens estratégicos cobrindo arquitetura de dados (JSONB adapters), UX premium (customização de tema), mídia segura (PiP, importação com crop) e protocolos adaptativos para PCD, transformando foundations em features reais com UI, services testáveis e disclaimers honestos.

---

## 2. Itens implementados

| Item | Título | Status anterior | Status novo |
|------|--------|-----------------|-------------|
| 08 | Migração JSONB progressiva | `foundation_created` | `implemented_now` |
| 18 | Customização de tema premium | `foundation_created` | `implemented_now` |
| 19 | Picture-in-picture áudio/vídeo | `foundation_created` | `implemented_now` |
| 28 | Importação por imagem/PDF com crop | `foundation_created` | `implemented_now` |
| 94 | Protocolos para PCD | `foundation_created` | `implemented_now` |

## 3. Itens mantidos como foundation

Nenhum. Todos os 5 itens foram implementados como `implemented_now`.

---

## 4. Arquivos criados

### Services

- `src/services/data/jsonbWorkoutAdapter.ts` — Adapter tipado para sessões de treino JSONB
- `src/services/data/jsonbWorkoutAdapter.test.ts` — 7 testes
- `src/services/data/jsonbProfileAdapter.ts` — Adapter tipado para perfil JSONB
- `src/services/data/jsonbProfileAdapter.test.ts` — 7 testes
- `src/services/premium/themeCustomizationService.ts` — Preview local de temas premium
- `src/services/premium/themeCustomizationService.test.ts` — 5 testes
- `src/services/media/pictureInPictureService.ts` — Status API de PiP sobre mediaPipService
- `src/services/media/pictureInPictureService.test.ts` — 3 testes
- `src/services/media/workoutImportService.ts` — Metadata extraction e validação de import
- `src/services/media/workoutImportService.test.ts` — 8 testes
- `src/services/accessibility/adaptiveProtocolsService.ts` — 7 protocolos PCD
- `src/services/accessibility/adaptiveProtocolsService.test.ts` — 9 testes

### Components

- `src/components/premium/ThemeCustomizationPanel.tsx` — Painel de preview de temas
- `src/components/media/PictureInPicturePanel.tsx` — Status PiP com checklist
- `src/components/media/WorkoutImportPanel.tsx` — Resumo de import e OCR guard
- `src/components/accessibility/AdaptiveProtocolsPanel.tsx` — Protocolos PCD expandíveis

---

## 5. Arquivos alterados

- `src/pages/Dashboard.tsx` — Novas seções integradas
- `src/features/strategic-items/strategicItems.registry.ts` — 5 itens atualizados
- `src/features/strategic-items/strategicItems.test.ts` — Batch assertions atualizadas

---

## 6. Testes criados

| Arquivo de teste | Testes | Escopo |
|------------------|--------|--------|
| `jsonbWorkoutAdapter.test.ts` | 7 | Adaptação, null, corrompido, fallback, lista |
| `jsonbProfileAdapter.test.ts` | 7 | JSON, relational, nível, completude |
| `themeCustomizationService.test.ts` | 5 | Opções, aplicação, persistência, disclaimer |
| `pictureInPictureService.test.ts` | 3 | Suporte, sem mídia, disclaimer |
| `workoutImportService.test.ts` | 8 | Metadata, validação, formatos, limites |
| `adaptiveProtocolsService.test.ts` | 9 | Protocolos, sanitize, persist, disclaimers |

**Total de testes novos neste lote:** 39

---

## 7. Como fake implementation foi evitada

- **Item 08:** Adapters usam as mesmas interfaces de `database.ts`. Read-models existentes (`trainingReadModels.ts`) já estão integrados no `DatabaseService`. Nenhum schema Supabase foi alterado.
- **Item 18:** Temas são aplicados via CSS vars reais. Disclaimer explícito: "Billing real não está ativo". Nenhum entitlement fake.
- **Item 19:** PiP usa `mediaPipService` existente que detecta `document.pictureInPictureEnabled` e procura vídeo real. UI mostra claramente quando PiP está indisponível. Nenhum player fake.
- **Item 28:** Upload/preview/crop já funciona via `ImportWorkoutView`. Service adiciona metadata e validação. OCR permanece `not_started` com disclaimer: "OCR não está ativo neste lote".
- **Item 94:** Protocolos são sugestões educacionais com disclaimers individuais + global. Nenhum protocolo prescreve tratamento médico. Linguagem de suporte usada em amputação.

---

## 8. Resultado real dos comandos

```txt
npm run lint        → PASS (exit code 0)
npm run typecheck   → PASS (exit code 0)
npm test            → PASS (416/416 testes, 112 arquivos)
npm run build       → PASS (built in 6.17s)
git status --short  → 3 modified, 7 new
```

---

## 9. Próxima recomendação

Próximo lote sugerido (5 itens `foundation_created` restantes):

| Item | Título |
|------|--------|
| 9 | Caching preditivo IA |
| 10 | Multi-tenancy segura |
| 25 | AR overlay de postura |
| 30 | Preload de mídia offline |
| 86 | Leaderboard global gamificado |
