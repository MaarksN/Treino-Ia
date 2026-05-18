# Batch: AI Lifestyle & Capability Guards - Evidence

**Lote:** Itens 51, 58, 59, 60, 67
**Data local:** 2026-05-17

## 1. Objetivo do lote

Implementar ou guardar exatamente 5 itens estrategicos do TREINO IA: AI form checker, replanejamento por equipamentos, despensa inteligente, sinal educativo de consistencia/longevidade e AR/WebXR. Recursos dependentes de engine, hardware ou API externa foram mantidos como guard/preview honesto.

## 2. Itens implementados

| Item | Titulo | Status |
| --- | --- | --- |
| 58 | Replanejamento por foto de equipamentos | `implemented_now` |
| 59 | Despensa inteligente | `implemented_now` |
| 60 | Projecao de longevidade | `implemented_now` |

## 3. Itens mantidos como foundation

| Item | Titulo | Status | Motivo |
| --- | --- | --- | --- |
| 51 | AI Form Checker MediaPipe/WASM | `foundation_created` | MediaPipe/WASM nao esta instalado; o painel detecta camera, permissao necessaria, engine e processamento local planejado sem analisar video. |
| 67 | AR/WebXR | `foundation_created` | WebXR depende de navegador/hardware; o painel detecta `navigator.xr` e `immersive-ar` sem iniciar sessao AR. |

## 4. Arquivos criados

- `src/services/ai/formCheckerCapabilityService.ts`
- `src/services/ai/formCheckerCapabilityService.test.ts`
- `src/services/ai/equipmentReplanService.ts`
- `src/services/ai/equipmentReplanService.test.ts`
- `src/services/nutrition/pantryPlannerService.ts`
- `src/services/nutrition/pantryPlannerService.test.ts`
- `src/services/wellness/longevitySignalService.ts`
- `src/services/wellness/longevitySignalService.test.ts`
- `src/services/xr/webxrCapabilityService.ts`
- `src/services/xr/webxrCapabilityService.test.ts`
- `src/components/ai/FormCheckerPreviewPanel.tsx`
- `src/components/ai/EquipmentReplanPanel.tsx`
- `src/components/Nutrition/PantryPlannerPanel.tsx`
- `src/components/wellness/LongevitySignalPanel.tsx`
- `src/components/xr/WebXRPreviewPanel.tsx`

## 5. Arquivos alterados

- `src/pages/Dashboard.tsx` - secao discreta "IA, Habitos & Tecnologias Futuras".
- `src/features/strategic-items/strategicItems.registry.ts` - apenas itens 51, 58, 59, 60 e 67.

## 6. Testes criados

| Arquivo | Testes | Escopo |
| --- | ---: | --- |
| `formCheckerCapabilityService.test.ts` | 8 | Camera ausente/presente, MediaPipe ausente/presente mockado, checklist e disclaimer. |
| `equipmentReplanService.test.ts` | 7 | Lista manual, sanitizacao, persistencia local, adaptacao e guard de foto. |
| `pantryPlannerService.test.ts` | 9 | Despensa vazia, alimentos, persistencia local, sugestoes e guard sem IoT. |
| `longevitySignalService.test.ts` | 6 | Consistencia, sono, hidratacao, recuperacao, RPE excessivo e ausencia de claim medico. |
| `webxrCapabilityService.test.ts` | 5 | WebXR ausente, WebXR presente mockado, `immersive-ar` suportado/unknown e disclaimer. |

**Total de testes novos neste lote:** 35.

## 7. Como fake implementation foi evitada

- **Item 51:** o servico apenas detecta capabilities. Sem MediaPipe/WASM instalado, `status` permanece `foundation_created` e nenhuma analise de video e feita.
- **Item 58:** foto gera somente preview local. Adaptacoes sao calculadas pela lista manual de equipamentos informada pelo usuario.
- **Item 59:** despensa e manual/local; nao existe geladeira inteligente, IoT ou chamada externa.
- **Item 60:** o painel mostra "sinal de consistencia" e "tendencia de habitos"; nao calcula idade biologica real e nao faz promessa medica.
- **Item 67:** WebXR e apenas capability guard/preview. Nenhuma sessao AR e iniciada sem suporte real.

## 8. Resultado real dos comandos

Ambiente Windows: os comandos `npm run ...` foram executados com `C:\Program Files\nodejs` prefixado no `PATH`, porque o `node.exe` da WindowsApps retornava `Acesso negado` quando chamado pelos shims.

```txt
git diff --check  -> PASS (exit code 0; apenas avisos CRLF)
npm run lint      -> PASS (exit code 0)
npm run typecheck -> PASS (exit code 0)
npm test          -> PASS (458/458 testes, 118 arquivos)
npm run build     -> PASS (built in 13.83s)
git status --short -> pendente antes do commit; arquivos deste lote + alteracoes alheias nao estagiadas fora do escopo em `api/_lib/*`, `public/sw.js`, `src/components/MusicPlayer.tsx`, `src/services/media/*` e `src/services/pwa/*`
```

## 9. Proxima recomendacao

Recomendar um proximo lote de 5 itens ainda pendentes/foundation apos confirmar o estado do registry no commit final. Prioridade sugerida: escolher itens sem dependencia externa bloqueante para manter velocidade de entrega real.
