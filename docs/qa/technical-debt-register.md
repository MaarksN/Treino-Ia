# Registro Consolidado de Divida Tecnica

Status: DIVIDA PARCIALMENTE QUITADA; NO-GO externo por staging/env

Atualizacao 2026-06-05: ver evidencia completa em `docs/qa/technical-debt-execution-2026-06-05.md`.

| ID     | Tipo     | Area               | Problema                                                                | P   | Sev     |  ICE | Esforco | Bloqueia |
| ------ | -------- | ------------------ | ----------------------------------------------------------------------- | --- | ------- | ---: | ------- | -------- |
| DT-001 | 03/09/12 | release            | Smoke real/staging bloqueado por env ausente                            | P1  | ALTA    | 16.0 | M       | SIM      |
| DT-002 | 09       | multi-tenancy      | Isolamento A/B nao validado dinamicamente                               | P1  | ALTA    | 12.9 | M       | SIM      |
| DT-003 | 03       | testes             | Cobertura global baixa: 33.04% stmts, 27.94% branches                   | P1  | CRITICA | 14.4 | L       | SIM      |
| DT-004 | 02       | codigo             | `format:check` quitado em 2026-06-05                                    | P2  | MEDIA   |  9.0 | M       | NAO      |
| DT-005 | 05/10    | seguranca          | Auth, Stripe, Gemini e rate limit reais nao validados                   | P1  | ALTA    | 13.3 | M       | SIM      |
| DT-006 | 06       | dados              | Backup/restore e migrations em banco limpo nao testados                 | P1  | ALTA    | 11.2 | M       | SIM      |
| DT-007 | 08       | observabilidade    | Sentry/alertas/logs reais nao validados                                 | P1  | ALTA    | 10.7 | M       | SIM      |
| DT-008 | 01/02    | arquitetura/codigo | 43 clones restantes e exports aparentemente nao usados                  | P3  | BAIXA   |  7.7 | M       | NAO      |
| DT-009 | 04       | infra              | Sem Dockerfile/IaC; Docker indisponivel localmente                      | P3  | BAIXA   |  6.0 | M       | NAO      |
| DT-010 | 07       | documentacao       | OpenAPI/prod/staging ainda com placeholders e sem ultima evidencia real | P2  | MEDIA   |  5.6 | S       | NAO      |
| DT-011 | 08/13    | performance        | Lighthouse CI passou localmente em 2026-06-05                           | P2  | MEDIA   |  8.0 | M       | NAO      |
| DT-012 | 11       | compliance         | Export/erasure LGPD nao testados com usuario real                       | P1  | ALTA    | 12.6 | M       | SIM      |

## Detalhe dos principais itens

### DT-001 - Smoke real/staging bloqueado

Evidencia: `npm run preflight:sprint3` falhou por 8 blocos de env ausentes; `npm run smoke:sprint3` falhou com `SUPABASE_URL is required`.

Impacto: sem prova de deploy real, auth real, integracoes e smoke pos-deploy.

Acao: executar Vercel Preview com secrets reais e anexar URL/logs.

### DT-002 - Multi-tenancy nao validado dinamicamente

Evidencia: RLS existe em migrations, mas nao houve credenciais para criar Tenant/Usuario A e B.

Impacto: risco de IDOR/BOLA nao eliminado por evidencia direta.

Acao: criar usuarios A/B no Supabase staging e executar leitura/escrita/exclusao cruzada.

### DT-003 - Cobertura baixa

Evidencia: coverage global 33.04% statements, 27.94% branches, 31.96% functions, 33.68% lines; muitos componentes/servicos seguem com 0%. Warnings `act(...)` dos testes duplicados antigos foram removidos.

Impacto: regressao em fluxos nao cobertos pode passar pelo CI.

Acao: subir cobertura de fluxos core para >=60% inicialmente e >=80% em release candidate.

### DT-004 - Format check quitado

Evidencia: `npm run format` aplicado e `npm run format:check` passou em 2026-06-05.

Impacto: ruido de diffs, padrao inconsistente e gate de qualidade incompleto.

Acao: manter `format:check` como gate.

### DT-008 - Clones e exports

Evidencia: `jscpd --min-lines 10 --reporters console src api` reduziu de 100 para 43 clones apos extrair helpers dos registries dos blocos; duplicacao total ficou em 0.92% de linhas. `ts-prune --project tsconfig.json` ainda lista exports suspeitos para triagem manual.

Impacto: menor ruido estrutural nos registries, mas ainda ha duplicacoes em API, hooks/testes e componentes.

Acao: continuar reducao incremental ate `<30` clones ou registrar aceite formal por baixo impacto.

### DT-005 - Integracoes reais nao validadas

Evidencia: preflight sem `STRIPE_*`, `GEMINI_API_KEY`, `SUPABASE_*`, Sentry e OAuth.

Impacto: billing, IA, health OAuth e observabilidade podem falhar em producao.

Acao: provisionar sandbox e rodar smokes estritos.
