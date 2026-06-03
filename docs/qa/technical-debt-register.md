# Registro Consolidado de Divida Tecnica

Status: DIVIDA PRESENTE

| ID | Tipo | Area | Problema | P | Sev | ICE | Esforco | Bloqueia |
|---|---|---|---|---|---|---:|---|---|
| DT-001 | 03/09/12 | release | Smoke real/staging bloqueado por env ausente | P1 | ALTA | 16.0 | M | SIM |
| DT-002 | 09 | multi-tenancy | Isolamento A/B nao validado dinamicamente | P1 | ALTA | 12.9 | M | SIM |
| DT-003 | 03 | testes | Cobertura global baixa: 34.05% stmts, 28.78% branches | P1 | CRITICA | 14.4 | L | SIM |
| DT-004 | 02 | codigo | `format:check` falha em 717 arquivos | P2 | MEDIA | 9.0 | M | NAO |
| DT-005 | 05/10 | seguranca | Auth, Stripe, Gemini e rate limit reais nao validados | P1 | ALTA | 13.3 | M | SIM |
| DT-006 | 06 | dados | Backup/restore e migrations em banco limpo nao testados | P1 | ALTA | 11.2 | M | SIM |
| DT-007 | 08 | observabilidade | Sentry/alertas/logs reais nao validados | P1 | ALTA | 10.7 | M | SIM |
| DT-008 | 01/02 | arquitetura/codigo | 54 clones e exports aparentemente nao usados | P3 | BAIXA | 7.7 | M | NAO |
| DT-009 | 04 | infra | Sem Dockerfile/IaC; Docker indisponivel localmente | P3 | BAIXA | 6.0 | M | NAO |
| DT-010 | 07 | documentacao | OpenAPI/prod/staging ainda com placeholders e sem ultima evidencia real | P2 | MEDIA | 5.6 | S | NAO |
| DT-011 | 08/13 | performance | Lighthouse CI falhou com `NO_FCP` | P2 | MEDIA | 8.0 | M | NAO |
| DT-012 | 11 | compliance | Export/erasure LGPD nao testados com usuario real | P1 | ALTA | 12.6 | M | SIM |

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

Evidencia: coverage global 34.05% statements, 28.78% branches, muitos componentes/servicos com 0%.

Impacto: regressao em fluxos nao cobertos pode passar pelo CI.

Acao: subir cobertura de fluxos core para >=60% inicialmente e >=80% em release candidate.

### DT-004 - Format check falha

Evidencia: `npm run format:check` reportou 717 arquivos.

Impacto: ruido de diffs, padrao inconsistente e gate de qualidade incompleto.

Acao: rodar formatacao em PR dedicado ou ajustar config/escopo.

### DT-005 - Integracoes reais nao validadas

Evidencia: preflight sem `STRIPE_*`, `GEMINI_API_KEY`, `SUPABASE_*`, Sentry e OAuth.

Impacto: billing, IA, health OAuth e observabilidade podem falhar em producao.

Acao: provisionar sandbox e rodar smokes estritos.
