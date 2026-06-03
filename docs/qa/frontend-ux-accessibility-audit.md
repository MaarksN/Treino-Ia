# Auditoria Frontend, UX e Acessibilidade

Status: PARTIAL

## Execucoes

- `npm run test:e2e`: PASS, 21/21 testes Chromium.
- `npm run test:a11y`: PASS, 1/1 teste axe smoke.
- `npm run build`: PASS.
- Lighthouse CI local: FAIL/BLOCKED, `NO_FCP`.

## Rotas e fluxos testados por Playwright

- App carrega com status 200.
- Titulo e root React renderizam.
- Sem erros criticos de console no load.
- Rotas core carregam direto.
- Path desconhecido redireciona para rota canonica.
- Page source nao vaza strings de segredo.
- Onboarding: completar, pular e voltar.
- Cadastro local: formulario visivel, persistencia starter user e retorno sem formulario.
- Ciclo de treino: deep links, anamnese, finalizar treino, historico e aceitar/recusar sugestao de IA pendente.
- Acessibilidade smoke: sem violacoes criticas axe na primeira superficie do dashboard.

## Lacunas

- Sem teste manual/automatizado em tablet, mobile landscape e mobile portrait fora do projeto Chromium desktop.
- Sem auditoria completa WCAG; `docs/accessibility-wcag-vpat.md` tambem declara status parcial.
- Lighthouse falhou com `NO_FCP`, entao performance/SEO/best-practices nao foram medidos com sucesso nesta execucao.
- UX com dados reais de Supabase/Stripe/Gemini nao foi validada.

## Achados

- `src/components/GlobalFeed.tsx:4` usa `FAKE_POSTS`.
- `src/components/platform/AdvancedPlatformHub.tsx:611` usa endpoint `https://example.com/n8n/treino`.
- `npm run format:check` falhou em 717 arquivos, afetando consistencia de codigo/UX maintenance.

## Decisao frontend

PARTIAL. O local smoke esta bom, mas a experiencia real em staging e auditoria completa de acessibilidade/performance ainda nao passam.
