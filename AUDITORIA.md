# ═══════════════════════════════════════════════════════════════════════════
# TECH DEBT AUDIT — SAAS 11-TYPE MASTER PROMPT v1.0
# ═══════════════════════════════════════════════════════════════════════════

CONTEXTO DO SISTEMA:
SaaS multi-tenant focado em treino, IA e nutrição.
- Stack: React 19 + Vite, TypeScript, Sentry, Tailwind CSS v4.
- Serviços: Frontend SPA, Vercel Functions (api), Background jobs cron (Vercel).
- Banco/Auth: Supabase (Auth, PostgreSQL com RLS, Storage).
- Integrações: Stripe Billing, Gemini via Proxy (AI).
- Infraestrutura/Deploy: Vercel e GitHub Actions.

──────────────────────────────────────────────────

[TIPO 01 — DÍVIDA ARQUITETURAL]
STATUS: ⚠️ Dívida Presente
SEVERIDADE: ALTA
ICE: Impact=8 · Confidence=8 · Effort=6 → Score=10.6

ACHADOS:
1. Existência de dependências circulares entre `services/database.ts` e repositórios / models.
2. God Components atuando como hubs misturando lógica de negócio complexa com UI, como o `src/pages/Dashboard.tsx` que tem mais de 1000 linhas de código e gerencia o estado global de treinos.
3. Decisões arquiteturais não formalizadas via ADRs no diretório do projeto.

EVIDÊNCIA:
Output da ferramenta madge identificou "Found 2 circular dependencies!" entre `services/database.ts`, `services/data/workoutSessionRepository.ts` e `services/trainingReadModels.ts`. O arquivo `Dashboard.tsx` tem 1011 linhas. O diretório `adr/` não existe.

AÇÕES CORRETIVAS:
→ Refatorar os services `database.ts` para usar interfaces ou injeção de dependência invertida quebrando o ciclo. — Esforço estimado: 1 sprint
→ Quebrar o `Dashboard.tsx` em hooks (`useDashboardState`) e componentes de UI puramente visuais menores. — Esforço estimado: 2 sprints
→ Criar templates de ADR e registrar as primeiras grandes decisões (uso do Vite, RLS de tenants). — Esforço estimado: 2 dias

──────────────────────────────────────────────────

[TIPO 02 — DÍVIDA DE CÓDIGO]
STATUS: ⚠️ Dívida Presente
SEVERIDADE: ALTA
ICE: Impact=7 · Confidence=9 · Effort=7 → Score=9.0

ACHADOS:
1. Arquivos gigantes (God Objects): `src/components/platform/AdvancedPlatformHub.tsx` com 1115 linhas, `src/features/strategic-items/strategicItems.registry.ts` com 1004 linhas.
2. Métodos densos de atualização e complexidade ciclomática na manipulação de planos de treino, com muitos `if`s aninhados e atualizações de UI acopladas a serviços de IA (`Dashboard.tsx`).
3. Uso de lógica em hardcoded strings e comentários servindo de histórico na collection de itens estratégicos em `strategicItems.registry.ts`.

EVIDÊNCIA:
Comando `find src -type f -name "*.ts*" -exec wc -l {} + | sort -rn | head -10` revelou múltiplos arquivos acima de 800 linhas, como `AdvancedPlatformHub.tsx` (1115) e `Dashboard.tsx` (1011).

AÇÕES CORRETIVAS:
→ Modularizar `AdvancedPlatformHub.tsx` dividindo a responsabilidade em componentes atômicos. — Esforço estimado: 1 sprint
→ Refatorar os pipelines complexos do Dashboard (`persistEditedPlan`, `startActiveWorkout`) abstraindo em um state machine ou Reducer. — Esforço estimado: 1 sprint
→ Remover strings mágicas extraindo para constantes no arquivo de registry e config. — Esforço estimado: 3 dias

──────────────────────────────────────────────────

[TIPO 03 — DÍVIDA DE TESTES]
STATUS: 🚨 Dívida Crítica
SEVERIDADE: CRÍTICA
ICE: Impact=10 · Confidence=9 · Effort=8 → Score=11.2

ACHADOS:
1. Cobertura global de testes insuficiente e caindo para abaixo de 40% na maioria das áreas (ex: coverage de src relata ~32% statements).
2. Testes de hooks frágeis com React state updates não sendo envoltos em `act(...)`, causando múltiplos warnings no CI/Runner.
3. Testes dependendo de instâncias de navegadores/APIs não mockadas (falhas de AudioContext não suportado em Node sem polyfill).

EVIDÊNCIA:
Múltiplos warnings "An update to TestComponent inside a test was not wrapped in act(...)". Falhas de TypeError "AudioContextClass is not a constructor" em `retroSoundService.test.ts`. `npm run test:coverage` mostra statements global ~32.43%.

AÇÕES CORRETIVAS:
→ Corrigir os warnings de React `act()` nos hooks e testes de componentes (ex: `useWorkoutManager.test.ts`). — Esforço estimado: 3 dias
→ Aumentar a cobertura da camada de hooks e stores para 70% adicionando os mocks de context do JS DOM faltantes. — Esforço estimado: 2 sprints
→ Mockar corretamente a API de Web Audio para evitar dependência ambiental no runtime Node. — Esforço estimado: 2 dias

──────────────────────────────────────────────────

[TIPO 04 — DÍVIDA DE INFRAESTRUTURA / DEVOPS]
STATUS: ✅ Sem dívida crítica (Dívida Baixa)
SEVERIDADE: BAIXA
ICE: Impact=3 · Confidence=8 · Effort=3 → Score=8.0

ACHADOS:
1. Implantação baseada em Vercel e GitHub actions para CI e e2e bem documentada e automatizada.
2. Contudo, ausência de ferramentas de IaC para o resto dos recursos que não a Vercel, caso os projetos aumentem (apenas dependendo de painéis).
3. Dependência de Vercel functions e config `vercel.json` manual em vez de scripts reprodutíveis para outros provedores.

EVIDÊNCIA:
O `.github/workflows/` mostra workflows saudáveis (`ci.yml`, `vercel-deploy.yml`). `vercel.json` gerencia bem os crons e rotas de APIs, mas hardcodes em UI/JSON. NENHUMA DÍVIDA ENCONTRADA que comprometa operação imediata.

AÇÕES CORRETIVAS:
→ N/A - Continuar usando Vercel e GitHub Actions.

──────────────────────────────────────────────────

[TIPO 05 — DÍVIDA DE SEGURANÇA]
STATUS: ⚠️ Dívida Presente
SEVERIDADE: MÉDIA
ICE: Impact=7 · Confidence=7 · Effort=4 → Score=12.2

ACHADOS:
1. Headers CSP bem configurados em `vercel.json`, porém políticas permissivas em algumas integrações e iframes permitidos com fontes externas.
2. Possíveis CVEs e warnings retornados pela auditoria de dependências Node (necessitando atualização de packages vulneráveis via `npm audit`).

EVIDÊNCIA:
`vercel.json` possui CSP extensivo. Não foram encontradas hardcoded passwords no root (secrets e chaves anon usam ENVs estritos e GitHub secrets documentados no README).

AÇÕES CORRETIVAS:
→ Rodar `npm audit fix` para tratar as vulnerabilidades expostas no scan de segurança. — Esforço estimado: 1 dia
→ Fortalecer e validar os endpoints de API criados com middleware de Auth nas server functions (caso existam) para rate limiting agressivo. — Esforço estimado: 1 sprint

──────────────────────────────────────────────────

[TIPO 06 — DÍVIDA DE DADOS]
STATUS: ⚠️ Dívida Presente
SEVERIDADE: ALTA
ICE: Impact=8 · Confidence=8 · Effort=5 → Score=12.8

ACHADOS:
1. Migrations acumuladas no repositório `supabase/migrations` que adicionam RLS, mas que não possuem scripts automatizados de `rollback` visíveis caso haja falhas.
2. Uso do RLS mitigando riscos, mas dependência de RPCs (PL/pgSQL) pesados e "Drifts" de schema que precisam de verificação manual.
3. Acúmulo de lógica pesada de domínio em SQL (ex: gamificação, moderation) sem testes integrados claros de persistência reversa.

EVIDÊNCIA:
Pasta `supabase/migrations/` contendo arquivos gigantes (ex: `20260525000000_schema_drift...sql` com 35k caracteres) com acoplamentos pesados.

AÇÕES CORRETIVAS:
→ Mover lógica complexa e extensiva da gamificação do banco de dados (RPCs) para a camada server-side (Vercel Functions/Node) testável, caso necessário, ou testar fortemente os RPCs. — Esforço estimado: 2 sprints
→ Adicionar documentação e passos de rollback para cada novo migration a partir de agora. — Esforço estimado: Continuo

──────────────────────────────────────────────────

[TIPO 07 — DÍVIDA DE DOCUMENTAÇÃO]
STATUS: ⚠️ Dívida Presente
SEVERIDADE: MÉDIA
ICE: Impact=5 · Confidence=8 · Effort=4 → Score=10.0

ACHADOS:
1. API OpenAPI Spec existe em `docs/api/openapi.yaml`, mas documenta poucas rotas ou rotas básicas.
2. Falta de registros ADR para decisões de arquitetura e dependências.
3. README possui instruções básicas, mas falta detalhamento de troubleshoot para o setup local dos crons e do Stripe Webhook.

EVIDÊNCIA:
O arquivo `docs/api/openapi.yaml` documenta `GET /api/billing/entitlement` mas está incompleto. Diretório `adr/` e runbooks ausentes.

AÇÕES CORRETIVAS:
→ Finalizar a documentação do OpenAPI schema para todas as Vercel Functions. — Esforço estimado: 3 dias
→ Criar guias de TroubleShooting e Runbooks para falhas de Webhook e Sync Offline. — Esforço estimado: 2 dias

──────────────────────────────────────────────────

[TIPO 08 — DÍVIDA DE OBSERVABILIDADE]
STATUS: ⚠️ Dívida Presente
SEVERIDADE: ALTA
ICE: Impact=8 · Confidence=9 · Effort=6 → Score=12.0

ACHADOS:
1. Ausência de Distributed Tracing (como OpenTelemetry) para rastrear o impacto de requisições lentas no front-end em relação as proxy Vercel e o banco Supabase.
2. Logging e captura de erros feita localmente ou com Sentry, porém sem IDs de correlação ponta a ponta (`correlation_id`).
3. Ausência de SLOs e SLAs bem definidos na documentação do projeto.

EVIDÊNCIA:
Buscas na codebase por `opentelemetry` não mostraram resultados. Existe `@sentry/react` que mitiga parte, mas sem context propagation robusto das APIs custom.

AÇÕES CORRETIVAS:
→ Implementar propagação de `correlation_id` do Front-end -> Vercel Functions -> RPC / Logs do Supabase. — Esforço estimado: 1 sprint
→ Adicionar dashboards sintéticos e checagens de SLA ao projeto via ferramentas de monitoramento ativas. — Esforço estimado: 1 sprint

──────────────────────────────────────────────────

[TIPO 09 — DÍVIDA DE MULTI-TENANCY]
STATUS: ✅ Sem dívida crítica (Supabase RLS)
SEVERIDADE: BAIXA
ICE: Impact=10 · Confidence=9 · Effort=8 → Score=11.2

ACHADOS:
1. A arquitetura multi-tenant B2C delega completamente para o PostgreSQL e Supabase RLS (Row Level Security).
2. Contextos de usuários injetados via token (Auth API do Supabase).
3. Não há leaks perceptíveis por falta de `tenant_id` pois o RLS impõe o `auth.uid()`.

EVIDÊNCIA:
Os arquivos de migração (ex: `20260511002500_ai_decision_audits.sql`) possuem RLS configurado nativamente usando `auth.uid()`.

AÇÕES CORRETIVAS:
→ NENHUMA DÍVIDA ENCONTRADA na implementação base; manter o padrão rígido de exigência de políticas RLS para novas tabelas.

──────────────────────────────────────────────────

[TIPO 10 — DÍVIDA DE BILLING / METERING]
STATUS: ⚠️ Dívida Presente
SEVERIDADE: MÉDIA
ICE: Impact=7 · Confidence=7 · Effort=5 → Score=9.8

ACHADOS:
1. O código de billing usa definições duras de preços e planos (ex: `src/types/premium.ts` possui tipagem com planos específicos).
2. Ausência de lógicas consistentes para downgrades automáticos e limites flexíveis desacoplados do codebase.
3. Não foi encontrado modulo de Stripe webhook local (`no stripe.ts`) que realize metering em tempo real na raiz visível, podendo estar abstraído nas tabelas.

EVIDÊNCIA:
Tipos `planId: SubscriptionPlanId`, `billingStatus: 'free' | 'trialing'` hardcoded no typescript. Ausência de pasta especializada robusta de webhooks `src/services/billing/` (ou localizados no api/).

AÇÕES CORRETIVAS:
→ Desacoplar IDs de planos (Stripe Price IDs) passando tudo exclusivamente via ENV ou database query sem tipagem estrita no enum. — Esforço estimado: 1 sprint
→ Implementar ou refatorar o handler de webhooks para garantir idempotência estrita usando a `idempotency.ts` já citada no repositório/conhecimento. — Esforço estimado: 1 sprint

──────────────────────────────────────────────────

[TIPO 11 — DÍVIDA DE COMPLIANCE (LGPD/GDPR/SOC2)]
STATUS: ⚠️ Dívida Presente
SEVERIDADE: ALTA
ICE: Impact=9 · Confidence=8 · Effort=5 → Score=14.4

ACHADOS:
1. A base armazena relatórios e decisões de IA por usuário (`ai_decision_audits.sql`), sendo crucial mecanismos de GDPR completos.
2. Ausência de fluxos UI óbvios de Exportação/Exclusão total (Right to erasure) orquestrada (banco, storage, assinaturas Stripe conectadas).
3. Sem `privacy` policy no código como módulos independentes de gestão, embora a doc relate um privacy policy textual.

EVIDÊNCIA:
Tabela `ai_decision_audits` salva histórico de AI atrelado ao `user_id`. Busca por endpoints de data export ou `src/privacy/*.ts` não encontrou implementações.

AÇÕES CORRETIVAS:
→ Criar Vercel Function dedicada e testável para Exportação (Data Portability) em formato JSON contendo todos os treinos, logs e anotações. — Esforço estimado: 1 sprint
→ Implementar trigger e orquestração de Exclusão Física com propagação pro Stripe para cancelar assinaturas. — Esforço estimado: 1 sprint

──────────────────────────────────────────────────

RESUMO EXECUTIVO:
- Total de dívidas encontradas:
  - 1 CRÍTICA (Testes)
  - 5 ALTAS (Arquitetura, Código, Dados, Observabilidade, Compliance)
  - 3 MÉDIAS (Segurança, Documentação, Billing)
  - 2 BAIXAS (Infra, Multi-Tenancy)

- ICE Ranking para Priorização:
  1. Compliance (Score: 14.4)
  2. Dados (Score: 12.8)
  3. Segurança (Score: 12.2)
  4. Observabilidade (Score: 12.0)
  5. Testes (Score: 11.2)

- Estimativa de Esforço Total: Aprox. 12 Sprints / Semanas de Engenharia para zerar as dívidas médias, altas e críticas listadas.
- Risk Score geral do sistema: 7 / 10 (Funcional mas carente de maturidade técnica em testes e compliance de dados).
- Recomendação: Dedicar a próxima Sprint focada exclusivamente em corrigir testes críticos e implementar o Pipeline de Portabilidade de Dados (Compliance), seguidos do isolamento do componente Dashboard.
