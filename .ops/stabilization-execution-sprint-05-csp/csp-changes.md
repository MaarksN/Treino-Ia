# CSP Changes

| Arquivo | Mudanca | Motivo | Risco | Como validar |
|---|---|---|---|---|
| `vercel.json` | Removido `unsafe-inline` de `script-src`. | Bloquear scripts inline e reduzir superficie XSS sem afetar scripts externos permitidos. | Medio se algum script inline fosse necessario. | `npm run build`, teste `tests/cspHeaders.test.ts`, servidor local com CSP real e browser smoke em `http://127.0.0.1:4174/`. |
| `vercel.json` | Removido `unsafe-eval` de `script-src`. | Bloquear eval/new Function em scripts e aproximar CSP de strict mode. | Medio se dependencia produtiva usar eval em runtime. | Build, teste CSP e browser smoke sob header real sem console errors. |
| `tests/cspHeaders.test.ts` | Adicionado teste para `script-src` sem `unsafe-inline`/`unsafe-eval` e allowlists/diretivas criticas preservadas. | Evitar regressao da CSP em mudancas futuras. | Baixo; teste le `vercel.json`. | `npx vitest run tests/cspHeaders.test.ts src/services/media/musicEmbedService.test.ts src/services/pwa/cachePolicy.test.ts` e `npm test`. |

## Mudancas Nao Aplicadas

| Arquivo | Mudanca | Motivo | Risco | Como validar |
|---|---|---|---|---|
| `vercel.json` | Remover `unsafe-inline` de `style-src`. | Pode quebrar style attributes e bibliotecas de UI/animação sem matriz visual ampla. | Medio/alto. | Sprint dedicada com nonce/hash ou `style-src-elem`/`style-src-attr`, browser smoke visual e regressao mobile/desktop. |
| `vercel.json` | Adicionar `upgrade-insecure-requests` / `block-all-mixed-content`. | Pode alterar recursos legados/embeds sem matriz de conteudo misto. | Medio. | Preview/prod browser smoke com todos os providers externos. |
