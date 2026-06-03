# Ambiente de Auditoria

Status: PARTIAL

## Estado inicial

- `git status --short`: limpo antes da execucao.
- Branch: `main`.
- Commit: `878c0404ed96dd1ee609a63ac578970fe6253ddf`.
- Ultimos commits: `878c040 Merge pull request #138`, `071b180 Merge branch 'main'`, `f3f7858 ci: run e2e with preinstalled playwright browsers`, `fd84507 docs: expand finalization readiness gaps`, `7377610 Merge pull request #132`.

## Ferramentas

| Ferramenta | Resultado |
|---|---|
| SO | Microsoft Windows 11 Pro 10.0.26200 64 bits |
| Git | 2.52.0.windows.1 |
| Node | v24.14.0 via `C:\Users\Marks\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe` |
| npm | 11.16.0 baixado temporariamente de registry.npmjs.org e executado via Node bundled |
| Python | 3.12.13 bundled |
| Docker | BLOCKED: comando `docker` nao encontrado |

## Observacoes de ambiente

- O `node` do PATH apontava para `C:\Program Files\WindowsApps\OpenAI.Codex_...\node.exe` e falhou com "Acesso negado"; a auditoria usou o Node bundled do runtime primario.
- `npm` nao estava instalado no PATH; foi usado `npm-cli.js` temporario em `%TEMP%\codex-npm-runtime`.
- `node_modules` nao existia no inicio; `npm ci` instalou 537 pacotes.
- `npm ci` reportou 0 vulnerabilidades e avisou que scripts de instalacao de `@sentry/cli@2.58.6` e `esbuild@0.27.7` estavam pendentes em `allowScripts`; build/testes nao falharam por isso.
- Sem `STAGING_URL` e sem credenciais sandbox fornecidas.

## Variaveis e segredos

- Busca rapida de padroes hardcoded em codigo e historico Git nao encontrou correspondencias para `password|secret|api_key|private_key` com valor literal.
- Variaveis reais de Supabase, Stripe, Gemini e Sentry nao estavam presentes; `npm run preflight:sprint3` falhou por essa ausencia.

## Status

Ambiente local suficiente para install, lint, typecheck, build, unit, coverage, E2E local e buscas estaticas.
Ambiente insuficiente para staging smoke, Supabase real, Stripe real, Gemini real, Sentry release, backup/restore e validacao multi-tenant dinamica.
