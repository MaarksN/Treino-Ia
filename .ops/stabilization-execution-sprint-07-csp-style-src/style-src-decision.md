# Style-src Decision - Sprint 07

| Opcao | Pode aplicar agora? | Risco | Validacao necessaria | Decisao |
|---|---|---|---|---|
| Remover unsafe-inline totalmente | Nao | Alto; ha inline styles reais e amplos em rotas/componentes produtivos. | Refactor de style props, smoke visual desktop/mobile, charts, motion, export/share card e rotas com dados sinteticos. | Bloqueado nesta sprint. |
| Usar nonce | Nao agora | Medio/alto; nonce ajuda `<style>` tags autorizadas, mas nao resolve a maioria dos `style` attributes de React sem refactor. | Arquitetura de nonce por request/deploy e validacao com CSP real. | Plano futuro, nao aplicado. |
| Usar hash | Nao agora | Alto; hashes sao frageis para styles dinamicos, valores variam em runtime. | Inventario de inline styles estaticos e hash generation controlado. | Nao recomendado como estrategia principal. |
| Usar style-src-elem/style-src-attr | Nao agora | Medio/alto; `style-src-attr 'none'` quebraria style props; `style-src-attr 'unsafe-inline'` ainda manteria excecao para attributes. | Browser smoke com matriz visual e decisao explicita de separacao element/attribute. | Candidato futuro apos migrar style attributes. |
| Manter unsafe-inline com plano | Sim | Medio de seguranca residual; menor risco operacional imediato. | Documentar audit, smoke visual do estado atual e plano de migracao. | Escolhido para Sprint 07. |

## Decision

`style-src 'unsafe-inline'` permanece em `vercel.json`.

Esta sprint nao declara CSP strict final. A remocao seca seria insegura porque o app usa muitos style attributes e bibliotecas/runtime que provavelmente dependem de inline styles. O hardening fica condicionado a uma migracao de UI com smoke visual amplo.
