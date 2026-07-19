# Auditoria Enterprise - Plataforma SaaS

## 1. Arquivos e Estruturas Analisadas

A auditoria abrangeu a raiz do projeto e os diretórios principais:

- `src/`: Contém componentes React, hooks, contexts/providers, stores (Zustand), services (integração de negócio/IA/gamification), utils, pages e router.
- `api/`: Vercel Functions serverless, contendo rotas de gamificação, health, stripe, billing, telemetria, sync e compliance.
- `supabase/`: Migrations de banco de dados (`.sql`).
- `tests/`: Scripts e suítes de testes End-to-End e smoke tests (Vitest e Playwright).
- `docs/`: Documentações de ADRs, API (Swagger/OpenAPI), Legal, QA e Segurança.
- Arquivos de configuração: `package.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `capacitor.config.ts`, `tsconfig.json`.

## 2. Dependências Encontradas (Principais)

- **Frontend & Core**: `react` (^19.0.1), `react-dom`, `@tanstack/react-query`, `zustand`, `motion`, `recharts`, `react-markdown`, `lucide-react`, `qrcode.react`.
- **Backend & Infra**: `@supabase/supabase-js`, `stripe`, `@upstash/redis`, `dotenv`, `zod`.
- **Ferramental & Build**: `vite`, `@tailwindcss/vite`, `typescript`, `@sentry/react`, `@sentry/vite-plugin`.
- **Testes & Qualidade**: `vitest`, `@playwright/test`, `jsdom`, `@testing-library/react`, `eslint`, `prettier`.
- **Mobile**: `@capacitor/core`, `@capacitor/android`.

## 3. Tecnologias Utilizadas (Current State)

- **Framework Frontend**: React 19 com Vite.
- **Linguagem**: TypeScript com tipagem estrita (100%).
- **Autenticação & Backend-as-a-Service**: Supabase (PostgreSQL, Auth, Storage, Edge Functions suportadas).
- **Serviços Backend**: Node.js rodando em Vercel Functions.
- **Banco de Dados**: PostgreSQL (via Supabase).
- **Estilização**: Tailwind CSS v4.
- **Monetização**: Stripe.
- **Integração IA**: API do Google Gemini (proxy local/serverless).
- **Observabilidade**: Sentry.
- **Testes**: Vitest (Unitário/Integração) e Playwright (E2E).

## 4. Gargalos

- **Arquitetura Acoplada**: Não há separação rigorosa seguindo o Clean Architecture puro (Application, Domain, Infrastructure, Presentation, Core, Config). A lógica de negócios ainda está parcialmente mesclada entre `services`, `hooks` e funções da `api/`.
- **Falta de Fila/Workers Robustos**: A ausência de um sistema maduro de orquestração de tarefas (como BullMQ ou Temporal) limita o processamento assíncrono complexo, retentativas automáticas e DLQs (Dead Letter Queues).
- **Limitações de IA**: Uso isolado de Gemini sem um framework agnóstico de roteamento multi-modelo (como LiteLLM) e orquestração de agentes autônomos (LangGraph/CrewAI) requeridos. Falta suporte à RAG corporativo robusto (Qdrant) nativo.
- **Mecanismos de Busca**: A busca depende puramente de banco relacional sem motores dedicados para busca full-text/semântica/híbrida de alta performance (Meilisearch).

## 5. Dívida Técnica

- Os adapters, services e controllers não utilizam interfaces estritas (Dependency Inversion), tornando a substituição de provedores (ex: Supabase Auth para Better Auth, ou Gemini para LiteLLM) mais custosa.
- O pipeline CI/CD (Actions) precisa ser expandido para acomodar novas etapas de auditoria de segurança (Vault, SAST/DAST) e deploy de workers.
- Dependência de Vercel Functions para fluxos complexos, o que pode apresentar problemas de timeout (limite de 10-60s) frente à necessidade de processos Enterprise demorados.

## 6. Melhorias Sugeridas (Roadmap Enterprise)

Alinhadas às diretrizes do "PROMPT MESTRE":

- **Arquitetura**: Refatorar o repositório para estrita adesão a Clean Architecture (separar Presentation, Application, Domain, Infrastructure, Shared).
- **IA Avançada**:
  - Implementar RAG (com Qdrant ou pgvector).
  - Adicionar LiteLLM (AI Gateway/Router) e LangGraph/CrewAI para multi-agentes (SDR, BDR, RH, etc).
  - Memory Manager e Prompt Manager corporativos.
- **Armazenamento e Buscas**: Instalar Meilisearch, Qdrant (Vetorial) e escalar uso de Redis.
- **Automação & Processos Assíncronos**: Integrar Temporal ou BullMQ para webhooks, eventos, retries automáticos.
- **Segurança & Autenticação**: Migrar/estender autenticação para Better Auth (com OAuth, 2FA, Magic Link), incluir Vault para secrets e Helmet/CSP/Rate Limiting mais agressivos no gateway.
- **Ferramentas Produtivas**: Integrar Tiptap (Rich Text), Gotenberg (PDF), React Email e React Flow.
- **Observabilidade Total**: Instrumentar com OpenTelemetry, Prometheus, Grafana, Loki, e Jaeger.

## 7. Riscos

- **Risco de Escopo**: Adicionar muitas ferramentas maduras e pesadas simultaneamente pode desestabilizar a aplicação base caso a refatoração para Clean Architecture não seja concluída primeiramente.
- **Custos**: Migrar para múltiplas soluções (Vault, Temporal, OpenTelemetry, Qdrant) aumenta sensivelmente os custos operacionais (Infraestrutura) e o footprint do sistema.
- **Complexidade do Multi-Agent**: Roteamento e coordenação de Crews (CrewAI) exigem limites de taxa restritos, cache inteligente (Redis) e logs robustos para não inflacionar custos de API (OpenAI/Anthropic/Gemini).

## 8. Complexidade

**ALTA**. A transformação exige a transição de um SaaS monolítico modular em Serverless/React para um ecossistema distribuído de classe Enterprise (Orientado a Eventos, Workers e Multi-agentes). A refatoração arquitetural inicial é crítica.

## 9. Prioridade de Execução

1. **Refatoração Clean Architecture (Fase 1)**: Ajustar diretórios e criar abstrações de Domínio e Infraestrutura antes de incluir novas dependências.
2. **Infraestrutura Básica (Fase 2)**: Filas/Workers (Temporal/BullMQ) e Caching/Banco Vetorial (pgvector/Qdrant, Redis).
3. **Mecanismo de IA Central (Fase 3)**: Adicionar LiteLLM, LangGraph e os primeiros agentes de BDR/SDR.
4. **Segurança e Observabilidade (Fase 4)**: OpenTelemetry, Vault, Better Auth.
5. **Ferramentas Auxiliares (Fase 5)**: Tiptap, Gotenberg, Meilisearch, React Flow.
