# P0 Security & Production Hardening Quick Wins

## 1. Objetivo da fase

Executar quick wins P0/P1 de seguranca e producao sem criar features novas, sem migrations Supabase e sem refatoracao ampla.

## 2. Achados corrigidos

- MusicPlayer: removido uso de `dangerouslySetInnerHTML`; embeds agora aceitam somente URLs HTTPS validadas para YouTube, Spotify e SoundCloud.
- Service Worker: `/api/*` e requests com `Authorization` usam network-only e nao sao gravados em CacheStorage.
- Telemetria: eventos sao redigidos no cliente e no servidor, metadata/body possuem limites, 500 generico usa `requestId`.
- Gemini proxy: chamadas upstream usam timeout, retry com backoff para 5xx/erros transitorios, erro seguro e cache em memoria com TTL/tamanho.
- Repo hygiene: package renomeado para `treino-ia`, Vite mantido em `devDependencies`, Express removido de package/lock, artefatos locais ignorados.

## 3. Arquivos alterados

- `.gitignore`
- `.ops/p0-security-production-hardening/evidence.md`
- `.ops/p0-security-production-hardening/follow-up-risk-register.md`
- `api/_lib/boundedTtlCache.ts`
- `api/_lib/boundedTtlCache.test.ts`
- `api/_lib/fetchWithTimeout.ts`
- `api/_lib/fetchWithTimeout.test.ts`
- `api/_lib/http.ts`
- `api/_lib/http.test.ts`
- `api/_lib/redact.ts`
- `api/_lib/redact.test.ts`
- `api/_lib/retryPolicy.ts`
- `api/_lib/retryPolicy.test.ts`
- `api/gemini-proxy.ts`
- `api/telemetry/errors.ts`
- `package.json`
- `package-lock.json`
- `public/sw.js`
- `src/components/MusicPlayer.tsx`
- `src/services/media/musicEmbedService.ts`
- `src/services/media/musicEmbedService.test.ts`
- `src/services/pwa/cachePolicy.ts`
- `src/services/pwa/cachePolicy.test.ts`
- `src/utils/errorTelemetry.ts`
- `tests/geminiProxyHardening.test.ts`
- `tsconfig.json`
- `vitest.config.ts`

## 4. Testes criados/ajustados

- `src/services/media/musicEmbedService.test.ts`
- `src/services/pwa/cachePolicy.test.ts`
- `api/_lib/redact.test.ts`
- `api/_lib/http.test.ts`
- `api/_lib/fetchWithTimeout.test.ts`
- `api/_lib/retryPolicy.test.ts`
- `api/_lib/boundedTtlCache.test.ts`
- `tests/geminiProxyHardening.test.ts`
- `vitest.config.ts` passou a incluir `api/**/*.test.ts`.

Cobertura adicionada:

- Rejeicao de HTML bruto, `javascript:`, dominio fora da allowlist e aceite de YouTube, Spotify e SoundCloud.
- Garantia de iframe src HTTPS e props seguras sem `srcdoc`.
- Politica de cache para `/api/user`, `/api/gamification/event`, assets, `/index.html` e Authorization.
- Redaction de Authorization, token, email, payload de imagem base64 e metadata grande.
- 500 generico sem vazamento de mensagem interna.
- Timeout abortavel, retry em 5xx, sem retry em 4xx e erro final seguro no Gemini proxy.
- Cache TTL/tamanho sem crescimento indefinido.

## 5. Itens deixados para fase posterior

- Gamificacao transacional via RPC.
- Criptografia de OAuth tokens.
- Migracao de dados sensiveis de localStorage para backend.
- CSP completa sem `unsafe-*`.
- AI gateway distribuido com KV/Redis.
- E2E/cobertura de fluxos criticos.
- Refatoracao dos hubs/god components.

## 6. Resultado real dos comandos

Baseline sem ajuste de PATH:

- `git status --short`: havia alteracoes locais anteriores ao hardening; durante a execucao, o HEAD avancou externamente de `8fe0935` para `a11f4d5`.
- `git branch --show-current`: `main`.
- `git log --oneline -10`: iniciado em `8fe0935 Implement data premium media adaptive strategic items`; depois avancou para `a11f4d5 Implement AI lifestyle capability strategic items`.
- `npm run lint`: falhou com `Acesso negado.` por resolucao de `node`/PATH no shell.
- `npm run typecheck`: falhou com `Acesso negado.` por resolucao de `node`/PATH no shell.
- `npm test`: falhou com `Acesso negado.` por resolucao de `node`/PATH no shell.
- `npm run build`: falhou com `Acesso negado.` por resolucao de `node`/PATH no shell.

Baseline com `C:\Program Files\nodejs` no inicio do PATH:

- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm test`: PASS, 117 files / 451 tests.
- `npm run build`: PASS, warning conhecido `Generated an empty chunk: "motion"`.

Validacao apos implementacao:

- Testes novos direcionados: PASS, 8 files / 28 tests.
- `git diff --check`: PASS, com warnings CRLF do Git para arquivos tocados.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm test`: primeira execucao final falhou em 5 arquivos com erro de cache/resolucao `Cannot find module /@id/F:/...test.ts`; apos limpar `node_modules/.vite/vitest`, os 5 arquivos passaram isolados e a suite completa passou.
- `npm test`: PASS final, 126 files / 483 tests.
- `npm run build`: PASS, warning conhecido `Generated an empty chunk: "motion"`.
- `git status --short`: somente arquivos desta fase ficaram modificados/novos.

## 7. Warnings conhecidos

- O shell inicial nao tinha Git/npm/Node no PATH esperado; Git foi chamado por caminho absoluto e npm com `C:\Program Files\nodejs` prependido.
- `npm install --package-lock-only --ignore-scripts`: PASS.
- `npm install --ignore-scripts` e `npm ci --ignore-scripts` dentro do workspace travaram e foram encerrados; isso corrompeu uma arvore local de `node_modules`.
- A instalacao foi recuperada com `npm ci --ignore-scripts --prefer-offline` em `C:\Users\marce\AppData\Local\Temp\treino-ia-deps-p0` e uma junction local `node_modules` apontando para essa arvore limpa.
- Artefatos locais incompletos foram movidos para `node_modules_broken_p0_*`, agora ignorados.
- Cache `node_modules/.vite/vitest` precisou ser limpo uma vez depois da troca de `node_modules`.
- Build ainda emite o warning preexistente `Generated an empty chunk: "motion"`.

## 8. Proxima fase recomendada

P1 Security & Data Governance: OAuth encryption, sensitive localStorage migration, transactional gamification.

## 9. Revalidacao em 2026-05-18

- `git diff --check`: PASS.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm test`: PASS, concluiu com 126 files / 483 tests em 338.34s.
- `npm run build`: PASS (mantem warning conhecido `Generated an empty chunk: "motion"`).
- `git status --short`: sem alteracoes de codigo de produto apos a revalidacao.
