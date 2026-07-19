# Phase 1: Domain Layer Migration Guide

## Objective

Migrate all business rules from presentation, UI components, hooks, and services to pure domain entities and policies.

## Current Progress

We have implemented the initial domain layer architecture using DDD principles:

- **Base Entity**: Created `Entity<T>` abstract class for identity management and equality comparison.
- **Value Objects**: Implemented `Email` Value Object with inherent domain validation.
- **Entities**: Created rich `User` entity encapsulating domain properties and using the `Email` VO.
- **Exceptions**: Created standard `DomainError`, `ValidationError`, and `NotFoundError` to handle domain-specific failures predictably.
- **Repositories Interfaces**: Established `IUserRepository` to follow the Dependency Inversion Principle.
- **Application Layer**: Implemented the first Use Case (`CreateUserUseCase`) enforcing the application logic over the domain layer, paired with corresponding DTOs.

## Rules to Policies

Heuristics like IA Engine, Progression Rules, and Workout Engine will be refactored into `src/domain/policies` as pure functions or classes detached from the infrastructure dependencies.

## Next Steps

1. Iteratively convert more types from `src/types` into rich domain models in `src/domain/entities`.
2. Move leaked business logic out of components/UI hooks and encapsulate them inside new Use Cases in `src/application/usecases/`.
3. Implement `Infrastructure` adapters (e.g., Supabase repository implementations) that satisfy the defined domain interfaces.
