# ADR 0002: Vite React SPA

## Status

Aceito

## Contexto

O produto precisa de uma SPA com iteracao rapida, testes unitarios em Vitest, deploy simples na Vercel e compatibilidade com Capacitor para o app Android.

## Decisao

Manter React + TypeScript + Vite como base do frontend. As rotas server-side continuam em Vercel Functions dentro de `api/`, e a SPA consome essas rotas por contratos documentados em `docs/api/openapi.yaml`.

## Consequencias

- Builds e previews ficam leves para ciclos de produto curtos.
- A fronteira entre UI e backend precisa ser explicita para evitar components grandes acoplando regras de negocio.
- Novos fluxos que exigirem segredo, billing, compliance ou integracoes externas devem nascer em `api/`, nao no bundle do cliente.
