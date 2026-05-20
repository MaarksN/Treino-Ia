# Auditoria de Dívida Técnica — Dívida de Multi-tenancy

## 1. Resumo executivo

- **Status geral:** FAIL
- **Severidade dominante:** CRÍTICA
- **Principais riscos:** A plataforma não possui qualquer mecanismo de multi-tenancy (`tenant_id`, `workspace_id`, ou tabelas associativas). Como consequência, não é possível isolar dados entre empresas/clientes (B2B), criando um risco absoluto de vazamento de dados caso mais de um cliente (organização) utilize o sistema, ou forçando a plataforma a operar exclusivamente no modelo B2C (usuário final único).
- **Recomendação de prioridade:** Implementação imediata de modelo de Tenant/Workspace no banco de dados, injeção de contexto de Tenant em todas as rotas da API, e uso de Row Level Security (RLS) no Supabase forçando a validação de `tenant_id`.

## 2. Escopo analisado

- **Ambiente:** Branch `main`, diretório limpo (`git status` limpo).
- **Diretórios focais:** `/src` (React Frontend) e `/api` (Backend/Serverless).
- **Temas avaliados:** Existência de atributos de isolamento (`tenantId`, `workspaceId`, `organizationId`), filtros globais nas queries, contexto de autenticação com escopo e segurança de dados B2B.

## 3. Evidências coletadas

| Evidência | Caminho | Observação |
|---|---|---|
| Ausência de modelo Tenant | Todo o repositório (`src/` e `api/`) | Buscas exaustivas por `tenant`, `tenant_id`, `workspace`, `organization_id` retornaram 0 resultados. |
| Autenticação focada apenas no indivíduo | `src/services/authService.ts` | Autenticação lida apenas com `SupabaseAuthUser`, sem associar o usuário a um escopo organizacional. |
| Queries desprotegidas de escopo | `api/_lib/billing-store.ts`, `api/jobs/create.ts` | As operações de banco de dados lidam diretamente com `user_id`, mas não consideram em qual empresa a operação está ocorrendo. |

## 4. Achados

| ID | Severidade | Problema | Evidência | Impacto | Esforço | Recomendação |
|---|---|---|---|---|---|---|
| MT-01 | **CRÍTICA** | Falta completa de modelo Multi-tenant | Zero referências a `tenantId` no código. | Risco massivo: Vazamento de dados cruzado. Sem isso, o SaaS não pode ser vendido B2B. Todo dado pertence a um usuário, mas usuários não são agrupados por cliente. | Alto | (Problema Confirmado) Criar tabela `workspaces` e `workspace_users`. Adicionar `workspace_id` em todas as tabelas de domínio. |
| MT-02 | **CRÍTICA** | Ausência de Row Level Security (RLS) baseada em Tenant | Nenhuma policy SQL configurada ou referenciada no código gerenciando RLS por Tenant. | Mesmo se houver filtros na API, qualquer consulta no Frontend direta ao Supabase poderia ler dados de terceiros sem RLS. | Alto | (Problema Confirmado) Implementar RLS no Supabase verificando o `workspace_id` do JWT do usuário atual. |
| MT-03 | **ALTA** | Funções de Banco não exigem Tenant | Arquivos em `api/_lib` operam com o Supabase Admin sem injetar o escopo. | Operações via API podem facilmente cruzar dados ou atualizar registros errados devido a ausência de chave composta (`id` + `tenant_id`). | Médio | (Problema Confirmado) Criar helper/middleware `withTenant` em todas as funções da `api/`. |
| MT-04 | **ALTA** | Compartilhamento de Recursos (Webhooks, Jobs) sem escopo | `api/retention/worker.ts` e serviços associados. | Um webhook de retenção dispara para todos. Não há como o webhook saber de qual "workspace" o evento se originou. | Alto | (Problema Confirmado) Atrelar a configuração de webhooks a um `tenant_id`. |

## 5. Riscos para produção SaaS

1. **Inviabilidade do modelo B2B:** Impossível onboardar "Empresas" (organizações). Só é possível operar no modelo B2C.
2. **Vazamento Cruzado de Dados (Cross-Tenant Data Leak):** Uma vez que múltiplos usuários entrarem, sem RLS por tenant e sem filtros de queries nas APIs, bugs simples como um `GET /api/users` sem WHERE apropriado resultarão na exposição de dados de toda a base.
3. **Impossibilidade de faturamento consolidado:** O sistema atual de billing liga as assinaturas (`stripe_customer_id`) diretamente ao usuário (`user_id`). É impossível fazer um faturamento centralizado por "Empresa/Workspace".

## 6. Correções recomendadas em ordem

1. **Alteração do Schema de Banco (Supabase):**
   - Criar tabelas `tenants` (ou `workspaces`).
   - Criar tabela de relacionamento `tenant_members` (user_id, tenant_id, role).
   - Adicionar a coluna `tenant_id` em **todas** as tabelas do domínio (ex: invoices, workouts, etc).
2. **Implementar Row Level Security (RLS) no Supabase:**
   - Criar políticas que exijam `auth.uid()` IN (SELECT user_id FROM tenant_members WHERE tenant_id = target_table.tenant_id).
3. **Refatorar Middlewares da API:**
   - Para qualquer rota da `api/`, injetar o `tenant_id` selecionado a partir do cabeçalho da requisição ou do JWT para isolar as consultas e não vazar dados.
4. **Atualizar o Frontend para Seleção de Workspace:**
   - Adicionar estado global para o Workspace atual (`currentWorkspaceId`).
   - Todos os envios para a API e chamadas Supabase devem incluir este contexto.

## 7. Testes ou validações que deveriam existir

- Testes E2E: Fazer login com o Usuário A (Tenant A) e tentar acessar/modificar uma URL pertencente ao Tenant B. Deve retornar 403/404.
- Testes unitários de Middlewares garantindo que requests sem `tenant_id` sejam rejeitados ou utilizem o Tenant default (pessoal).

## 8. Itens fora de escopo

- Como gerenciar planos de assinatura individuais vs corporativos (foco no Billing).
- Configurações de DNS/Domínio customizado por Tenant.

## 9. Veredito final

**FAIL.** O sistema carece inteiramente da infraestrutura de Multi-tenancy. A falta de escopo por `tenant_id` representa um bloqueador absoluto (CRÍTICO) se o objetivo deste produto SaaS for vender licenças para outras empresas (B2B), limitando a plataforma atual a ser estritamente um app para o consumidor final (B2C) com grandes fragilidades em isolamento de dados.
