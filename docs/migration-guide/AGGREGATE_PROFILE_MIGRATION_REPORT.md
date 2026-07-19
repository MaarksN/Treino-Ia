# Relatório de Migração de Aggregate - Profile

## Resumo
A camada de domínio e aplicação para o Aggregate de Perfil de Usuário (`UserProfile`) foi criada em conformidade total com os princípios de Domain-Driven Design e Clean Architecture, atendendo aos objetivos da Fase 1.

## Entidades e Objetos de Valor Migrados
- **`UserProfile`** (Entity / Aggregate Root): Criado em `src/domain/entities/UserProfile.ts`. Encapsula todos os dados comportamentais associados ao perfil primário de um usuário.
- **`Age`** (Value Object): Valida idades válidas (0-120).
- **`Weight`** (Value Object): Valida pesos aceitáveis (0-500kg).
- **`Height`** (Value Object): Valida alturas aceitáveis (0-300cm).
- **`ExperienceLevel`** (Value Object): Força normalização entre os níveis base de experiência aceitos pela engine (beginner, intermediate, advanced).

## Repositórios de Domínio
- **`IUserProfileRepository`**: Interface desacoplada da infraestrutura persistente, possuindo suporte CRUD assíncrono. Localizada em `src/domain/repositories/IUserProfileRepository.ts`.

## Use Cases (Aplicação)
- **`CreateUserProfileUseCase`**: Avalia colisão de existências e salva na persistência provida pela injeção.
- **`UpdateUserProfileUseCase`**: Lida com merges de atributos parcialmente submetidos preservando a entidade instanciada a partir de Value Objects puros.
Ambos isolados atrás dos contratos de **DTOs** (`UserProfileDTO`, `CreateUserProfileRequestDTO`).

## Testes e Validação
Todos os blocos recém-criados possuem cobertura com testes unitários modulares rodando perfeitamente e de forma assíncrona.
- Os 786+27 (totais) testes Unitários em `Vitest` mantiveram 100% de sucesso.
- Nenhuma funcionalidade E2E `Playwright` existente do front-end falhou ou apresentou regressões. A retrocompatibilidade do MVP antigo persiste enquanto a adoção do domínio segue limpa.

## Dívida Técnica Remanescente e Dependências Legadas
1. Atualmente o FrontEnd (`Dashboard.tsx`, `AnamnesisForm.tsx`) continua usando os tipos espaguete e chamadas diretas ao `src/services/dashboardPlanService.ts` acoplado ao Supabase via RPCs legadas.
2. A integração entre a Interface UI e a UI-Hook deve ser reconectada para instanciar os Casos de Uso com um adaptador concreto da interface do Repositório construída aqui. Isto será atacado na rodada de Implementação de Infraestrutura e Apresentação (Injeção de Dependências).
