# Browser Smoke Decision - Sprint 06

| Smoke | Pode executar? | Bloqueador | Metodo | Decisao |
|---|---|---|---|---|
| Service worker registration | Parcial | A automacao do browser expos `document/window`, mas `navigator` e `window.navigator` vieram `undefined` no `evaluate`. | `npm run preview`, abrir `http://127.0.0.1:4173/`, tentar `navigator.serviceWorker.ready`; complementar com static/test. | `BROWSER PWA CACHE SMOKE BLOCKED/PARTIAL`; nao declarar PASS browser de SW. |
| CacheStorage availability | Nao diretamente | `caches` e `window.caches` vieram `undefined` na avaliacao do browser. | Tentar inspecao real de `caches.keys()`; complementar com teste estatico do SW. | Bloqueado no browser; valido por static/test para `/api/*` e auth. |
| `/api` request not cached | Nao diretamente | Sem `CacheStorage` inspecionavel no browser. | Testes `cachePolicy` + static test de `public/sw.js` confirmam `networkOnly()` e sem `cache.put`. | PASS por TEST/STATIC; browser direto bloqueado. |
| Authorization request not cached | Nao diretamente | Sem `navigator`/`caches` no browser automation. | Testes cobrem `Authorization` e `authorization`; static test confirma `hasAuthorizationHeader(request)`. | PASS por TEST/STATIC; browser direto bloqueado. |
| Static asset cache | Parcial | Entradas reais de CacheStorage nao acessiveis. | Browser `pageAssets` observou assets versionados; policy permite `cache-first` para `/assets`. | PASS parcial para carregamento de assets; cache storage nao provado. |
| Offline fallback | Nao diretamente | Sem SW/CacheStorage e sem offline toggle confiavel nesta automacao. | Static review/teste de `offline.html` e fallback API 503 no-store. | PASS por STATIC; offline browser real pendente. |
| Manifest/installability | Parcial | Installability real exige API de browser nao exposta/Lighthouse fora do escopo. | `index.html` contem manifest; `manifest.webmanifest` revisado. | PASS parcial por static review; install prompt nao validado. |
