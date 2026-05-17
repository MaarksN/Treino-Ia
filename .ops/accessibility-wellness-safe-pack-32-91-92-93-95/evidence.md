# Accessibility & Wellness Safe Pack — Evidence

**Lote:** Itens 32, 91, 92, 93, 95
**Data:** 2026-05-17
**Autor:** Engenheiro Staff Frontend/React

---

## 1. Objetivo do lote

Implementar 5 itens estratégicos relacionados a acessibilidade e bem-estar, transformando foundations e existing_supported em features reais premium com UI, services testáveis, estados vazios, copy segura e disclaimers médicos.

---

## 2. Itens implementados

| Item | Título | Status anterior | Status novo |
|------|--------|-----------------|-------------|
| 32 | Check-in de dor | `existing_supported` | `implemented_now` |
| 91 | Trilhas adaptativas acessíveis | `foundation_created` | `implemented_now` |
| 92 | Modo alto contraste total | `foundation_created` | `implemented_now` |
| 93 | Navegação por leitor de tela | `foundation_created` | `implemented_now` |
| 95 | Linguagem simples guiada | `foundation_created` | `implemented_now` |

---

## 3. Arquivos criados

### Services

- `src/services/accessibility/adaptivePathwaysService.ts` — Service com 6 trilhas adaptativas
- `src/services/accessibility/adaptivePathwaysService.test.ts` — 8 testes
- `src/services/accessibility/highContrastModeService.ts` — Toggle de alto contraste com persistência e DOM
- `src/services/accessibility/highContrastModeService.test.ts` — 5 testes
- `src/services/accessibility/screenReaderSupportService.ts` — Auditoria de landmarks e anunciador aria-live
- `src/services/accessibility/screenReaderSupportService.test.ts` — 6 testes
- `src/services/accessibility/plainLanguageService.ts` — Glossário com 15 termos técnicos/simples
- `src/services/accessibility/plainLanguageService.test.ts` — 8 testes

### Components

- `src/components/accessibility/AdaptivePathwaysPanel.tsx` — Painel de trilhas com seleção, expansão, disclaimers
- `src/components/accessibility/HighContrastModeToggle.tsx` — Toggle switch com role, aria-checked, status
- `src/components/accessibility/ScreenReaderSupportPanel.tsx` — Checklist de landmarks com score
- `src/components/accessibility/PlainLanguagePanel.tsx` — Glossário buscável com modo simples/técnico

---

## 4. Arquivos alterados

- `src/components/recovery/PainCheckinPanel.tsx` — Reescrito como componente premium com sliders, notas, disclaimer
- `src/services/recovery/painCheckinService.test.ts` — Expandido de 2 para 12 testes
- `src/pages/Dashboard.tsx` — Adicionada seção "Acessibilidade & Bem-estar"
- `src/features/strategic-items/strategicItems.registry.ts` — 5 itens atualizados

---

## 5. Testes criados

| Arquivo de teste | Testes | Escopo |
|------------------|--------|--------|
| `painCheckinService.test.ts` | 12 | Clamp, sanitize, persistence, corruption |
| `adaptivePathwaysService.test.ts` | 8 | All pathways, sanitize, persistence, disclaimers |
| `highContrastModeService.test.ts` | 5 | Toggle, persistence, DOM manipulation |
| `screenReaderSupportService.test.ts` | 6 | Landmarks, scoring, live region, disclaimer |
| `plainLanguageService.test.ts` | 8 | Toggle, glossary, lookup, simplification |

**Total de testes novos neste lote:** 39

---

## 6. Como a acessibilidade foi aplicada

- **Alto contraste (item 92):** Toggle real que aplica classe CSS `treino-high-contrast` ao document root, alterando cores para fundo preto/texto branco/amarelo.
- **Leitor de tela (item 93):** Auditoria de landmarks (main, nav, header, h1, aria-live, skip-link), anunciador aria-live polite, checklist visual.
- **Linguagem simples (item 95):** Glossário de 15 termos com modo técnico/simples, busca, toggle persistente.
- **Trilhas adaptativas (item 91):** 6 trilhas para perfis diferentes com disclaimers individuais.
- **Check-in de dor (item 32):** Range sliders com aria-labels, role status para feedback, campos com labels for/id.
- **Todos os componentes:** `aria-labelledby`, `role="switch"`, `aria-checked`, `aria-expanded`, `aria-pressed`, `focus:ring`, `focus:outline-none`.

---

## 7. Como claims médicos foram evitados

- Item 32: Disclaimer explícito "não constitui diagnóstico médico"
- Item 91: Cada trilha tem disclaimer individual recomendando profissional qualificado
- Item 91: Header warning "não substituem avaliação e acompanhamento profissional"
- Item 93: Disclaimer "requer testes com leitores de tela reais e auditoria profissional WCAG"
- Item 95: Copy "conteúdo médico não é alterado para evitar interpretações imprecisas"
- Nenhum item promete cura, tratamento ou adaptação perfeita

---

## 8. Resultado real dos comandos

```txt
git diff --check    → PASS (warnings de CRLF apenas)
npm run lint        → PASS (exit code 0)
npm run typecheck   → PASS (exit code 0)
npm test            → PASS (377/377 testes, 106 arquivos)
npm run build       → PASS (built in 8.37s)
git status --short  → 4 modified, 2 new directories
```

---

## 9. Próxima recomendação

Implementar próximo lote com itens restantes não implementados. Candidatos sugeridos baseados em impacto e viabilidade:

- Item 8 — Migração JSONB progressiva (foundation_created)
- Item 18 — Customização de tema premium (foundation_created)
- Item 19 — Picture-in-picture áudio/vídeo (foundation_created)
- Item 28 — Importação por imagem/PDF com crop (foundation_created)
- Item 94 — Protocolos para PCD (foundation_created)
