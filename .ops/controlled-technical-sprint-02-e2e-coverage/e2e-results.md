# E2E Results — Controlled Technical Sprint 02

**Data:** 2026-05-22  
**Runner:** Playwright v1.60.0  
**Browser:** Chromium (headless) v148.0.7778.96  
**Spec:** `tests/e2e/app-smoke.spec.ts`  
**Server:** `npm run preview` (Vite preview, porta 4173)

## Resultado

```
Running 4 tests using 1 worker

  ok 1 [chromium] › tests/e2e/app-smoke.spec.ts:42:3 › App smoke › app loads with status 200 (866ms)
  ok 2 [chromium] › tests/e2e/app-smoke.spec.ts:47:3 › App smoke › page title is set (449ms)
  ok 3 [chromium] › tests/e2e/app-smoke.spec.ts:53:3 › App smoke › React root element renders (467ms)
  ok 4 [chromium] › tests/e2e/app-smoke.spec.ts:62:3 › App smoke › no critical console errors on load (2.4s)

  4 passed (7.1s)
```

## Cobertura do smoke

| Check | Resultado |
|---|---|
| HTTP 200 na raiz | ✅ PASS |
| `page.title()` não vazio | ✅ PASS (`Treino Inteligente`) |
| `#root` visível com filhos | ✅ PASS |
| Sem erros críticos no console | ✅ PASS |

## Constraints respeitadas

- Sem login / OAuth real.
- Sem Billing / Stripe real.
- Sem secrets no spec ou config.
- Usa `vite preview` (build pré-existente).
- Placeholder env vars: `VITE_SUPABASE_URL=https://example.supabase.co`.

## Erros benignos filtrados (não contabilizados)

Erros de rede para recursos externos (supabase, google fonts, favicon) são filtrados explicitamente no spec e não constituem falha.
