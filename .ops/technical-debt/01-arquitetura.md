# Auditoria de Dívida Técnica — Dívida de Arquitetura

## 1. Resumo executivo

- **Status geral:** FAIL
- **Severidade dominante:** ALTA / CRÍTICA
- **Principais riscos:** Falta de suporte a multi-tenancy, acoplamento extremo entre UI e serviços (Spaghetti Code), e mock de infraestrutura no frontend (Webhooks no `localStorage`).
- **Recomendação de prioridade:** Implementar modelagem multi-tenant imediata caso seja foco B2B. Criar aliases de importação para evitar caminhos relativos profundos. Extrair regras de negócio e integrações dos componentes React para uma camada de contexto/domain ou BFF (Backend for Frontend).

## 2. Escopo analisado

- **Ambiente:** Branch `main`, diretório limpo (`git status` limpo). Versões do Node/npm não puderam ser verificadas no ambiente, mas as dependências indicam stack Node moderno (`@types/node: ^22`).
- **Diretórios focais:** `/src` (React Frontend) e `/api` (Backend/Serverless).
- **Temas avaliados:** Acoplamento UI/Infraestrutura, vazamento de regras de negócio, suporte a multi-tenancy, circularidade e gestão de integrações/webhooks.

## 3. Evidências coletadas

| Evidência | Caminho | Observação |
|---|---|---|
| Múltiplos imports relativos e de negócio no UI | `src/components/platform/AdvancedPlatformHub.tsx` | Mais de 70 imports diretos de `services/`, `utils/`, `types/`, violando o isolamento da UI. |
| Acoplamento com Supabase no UI | `src/components/SocialFeed.tsx`, `SocialHub.tsx`, etc. | Componentes de interface interagem diretamente com o `supabaseClient` em vez de via repositórios ou hooks abstraídos. |
| Mock de infraestrutura no Frontend | `src/services/webhookService.ts` | O serviço de webhooks salva "disparos" e histórico no `localStorage` do navegador. |
| Arquitetura sem Multi-tenancy | `src/*`, `api/*` | Nenhuma referência a `tenant_id`, `workspace_id` ou `organization_id` foi encontrada no código. |
| Lógica de domínio nos componentes | `src/components/Nutrition/PantryPlannerPanel.tsx` | UI coordenando diretamente fluxos de IA (`suggestMeals`) sem camada de abstração. |

## 4. Achados

| ID | Severidade | Problema | Evidência | Impacto | Esforço | Recomendação |
|---|---|---|---|---|---|---|
| ARQ-01 | **CRÍTICA** | Ausência de Multi-tenancy | Buscas por `tenant`, `workspace`, `organization` retornaram vazias. | Impede o uso seguro do SaaS em modelo B2B; risco de vazamento de dados entre clientes. | Alto | (Problema Confirmado) Revisar o schema do Supabase e o código para incluir `tenant_id` e RLS correspondente. |
| ARQ-02 | **ALTA** | Componentes React com excesso de responsabilidades | `AdvancedPlatformHub.tsx` (L33-L66) | Componentes inflados dificultam testes, manutenção e reaproveitamento. | Médio | (Problema Confirmado) Mover a orquestração para Custom Hooks ou uma camada de Controllers/State Management. |
| ARQ-03 | **ALTA** | Infraestrutura Fake (Webhooks mockados) | `webhookService.ts` armazenando em `localStorage`. | Falha de arquitetura: webhooks são responsabilidade de backend. No frontend, isso é apenas uma simulação insegura. | Alto | (Problema Confirmado) Mover disparo de webhooks para o backend (API de workers/jobs) e persistir o histórico no DB. |
| ARQ-04 | **MÉDIA** | Acoplamento Direto Frontend-DB | `SocialFeed.tsx` importando `supabaseClient`. | Dificulta mudança de DB ou adição de cache/camadas intermediárias de validação. | Médio | (Problema Confirmado) Criar camada de repositório (ex: `feedRepository.ts`) e consumi-la via React Query. |
| ARQ-05 | **BAIXA** | Dívida de Path Aliases (Spaghetti Imports) | Muitos imports como `../../services/nutritionAiService`. | Torna refatorações pesadas e polui os arquivos. | Baixo | (Melhoria) Configurar paths no `tsconfig.json` e Vite (`@/services`, `@/components`). |

*Nota: Existe uma "Suspeita Forte" de importações circulares e dependências cruzadas (features importando outras features diretamente), devido ao alto acoplamento nos componentes.*

## 5. Riscos para produção SaaS

1. **Risco de Segurança de Dados:** Sem uma arquitetura multi-tenant robusta (RLS no Supabase + tenant keys), o SaaS está limitado a B2C individual ou tem risco massivo de vazamento de informações.
2. **Quebra na Escalabilidade:** O uso intensivo do Supabase direto pelo Client sem camadas de abstração, somado a lógicas pesadas nos componentes React, causará lentidão no Frontend e gargalo de renderização.
3. **Fraude / Inconsistência:** Processamento de webhooks e histórico via `localStorage` no Frontend significa que o usuário pode manipular ou deletar facilmente os dados dos logs de webhook, falhando em auditoria.

## 6. Correções recomendadas em ordem

1. **Modelagem Multi-tenant:** Refatorar banco de dados (Supabase) para incluir contexto de Workspace/Tenant, protegendo endpoints do frontend e backend (`api/`).
2. **Backend para Webhooks:** Substituir o mock do `webhookService.ts` por endpoints reais no backend que operem webhooks da plataforma via `api/jobs` ou workers assíncronos.
3. **Abstração do Banco de Dados:** Isolar o uso do Supabase em Data Access Objects (Repositórios) e evitar importação do `supabaseClient` em componentes `.tsx`.
4. **Desacoplamento de UI:** Refatorar os "Hubs" (`AdvancedPlatformHub.tsx`, etc) para utilizar o padrão Container-Presenter, tirando o peso de orquestração do arquivo visual.
5. **Adoção de Path Aliases:** Atualizar `tsconfig.json` para facilitar refatorações organizacionais sem quebrar os caminhos.

## 7. Testes ou validações que deveriam existir

- Testes E2E (Playwright/Cypress) validando o isolamento de dados entre diferentes tenants.
- Regra de Linter (ESLint: `no-restricted-imports`) proibindo que componentes de UI importem infraestrutura de DB ou APIs diretamente.
- Testes de carga nas APIs para verificar a escalabilidade sem gargalos.

## 8. Itens fora de escopo

- Análise detalhada do código de infraestrutura de IaC e CI/CD.
- Qualidade visual ou UI/UX design (CSS, Tailwind, etc.).
- Performance de rede (Core Web Vitals).

## 9. Veredito final

**FAIL.** O projeto possui estrutura de pastas promissora, mas na prática as camadas não são respeitadas, com lógicas pesadas, mock de infraestrutura de backend no frontend e integrações diretas de DB em componentes visuais. O ponto mais crítico para um SaaS B2B é a **falta de arquitetura multi-tenant**, que precisa ser desenhada do zero para suportar a operação com segurança.
