# Relatório de Migração de Aggregate - Training (Workouts)

## Resumo
O escopo principal da aplicação, o registro e monitoramento de sessões de treino, começou a ser transposto para as diretivas limpas através do Aggregate `Training`. Toda a fundação para lidar de forma estrita com a entrada de dados (RPE, Volume) foi migrada sem acoplamento.

## Entidades e Objetos de Valor Migrados
- **`WorkoutSession`** (Aggregate Root): Centraliza a execução histórica de um dia de treinamento completo. Garante a somatória de volumes via métodos Factory validados.
- **`Exercise`** (Entity): Isola as instruções, feedbacks e propriedades estáticas do movimento contido em um plano.
- **`WorkoutVolume`** (Value Object): Prevê anomalias negando estritamente valores métricos de carga e volume globais negativos.
- **`RPE`** (Value Object): Lógica de "Rate of Perceived Exertion" que não apenas impõe limite matemático (0 a 10) mas também exige precisão mecânica limitando a saltos literais de frações (.5).

## Repositórios de Domínio
- **`ITrainingRepository`**: Interface com métodos base `findById`, `findByUserId`, e `save`, desconectada do Supabase ou de drivers Node.

## Use Cases (Aplicação)
- **`LogWorkoutSessionUseCase`**: Caso de Uso focado no ato de persistir um treino de forma limpa convertendo requisições DTO em VOs, montando o Agregado `WorkoutSession` e passando a responsabilidade de timestamp unicamente para a camada Application.

## Testes e Validação
- Os testes Vitest confirmaram as restrições complexas impostas (e.g. os arremessos customizados de "Invalid RPE: 8.2" para frações incorretas) de ponta a ponta sem impactar lógicas espalhadas pela UI. `Vitest` rodou com 50/50 testes aprovados nas classes novas.
- Como esta é uma arquitetura em paralelo, nenhum contrato do front-end (`Dashboard`) quebrou.

## Dívida Técnica Remanescente e Dependências Legadas
1. As regras em `src/rules/workoutEngine.ts` que manipulam o avanço dos microciclos dentro de um plano precisam ser movidas para a arquitetura de *Domain Services* agora que a *WorkoutSession* base existe.
2. A integração nativa com Supabase local (`workoutDatabase.ts`) continua a injetar lógica nos `src/services/`. Esses deverão ser extirpados na Fase 3 onde a UI será ligada diretamente a injeção dos repositórios via DI (Dependency Injection Container).
