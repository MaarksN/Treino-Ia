# Offline Fallback Review - Sprint 06

| Caso | Estado | Risco | Decisao |
|---|---|---|---|
| Fallback HTML offline | `public/offline.html` e uma pagina estatica com mensagem generica e botao de reload. | Baixo; nao contem payload de usuario, token, email, CPF, senha ou sessao. | Aceito por static review/teste. |
| `/api/*` offline | `networkOnly()` retorna JSON `503` com `error: "Network unavailable"` e `cache-control: no-store`. | Baixo; nao simula sucesso e nao devolve dado antigo. | Aceito por static review/teste. |
| Requests com `Authorization` | `shouldBypassCache()` manda auth para `networkOnly()`; `networkOnly()` nao usa `cache.put`. | Baixo apos teste; browser CacheStorage nao inspecionado. | Aceito com warning de browser bloqueado. |
| Navegacao offline | `networkFirst()` pode retornar cache da navegacao/app shell ou `/offline.html`. | Medio; smoke offline real nao executado. | Pendente para browser capaz de SW/CacheStorage/offline toggle. |
| Assets estaticos offline | `cacheFirst()` permite cache de assets same-origin e app shell pre-cache no install. | Baixo; comportamento esperado para PWA. | Aceito parcialmente; carregamento de assets validado no browser, entradas de cache nao. |
| Dados sensiveis em CacheStorage | API/auth sao bypass; offline fallback nao tem dados sensiveis. | Medio residual se nova rota sensivel fora de `/api/*` for criada no futuro. | Manter policy/teste como gate e revisar novas rotas sensiveis. |
