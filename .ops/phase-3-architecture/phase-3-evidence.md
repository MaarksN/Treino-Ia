# Phase 3 Architecture Evidence

## Escopo

Branch: `architecture-refactoring-phase-3`

Objetivo: iniciar a Fase 3 de forma incremental e validável, sem reescrever `App.tsx`, sem alterar layout/UX, sem tocar Lighthouse e sem mexer em migrations Supabase.

## Etapas Executadas

1. ESLint/Prettier real
   - Adicionados `eslint.config.js`, `.prettierrc.json` e `.prettierignore`.
   - `npm run lint` passou a executar ESLint de verdade em `src`, `tests`, `api` e arquivos de config da raiz.
   - Configuração conservadora para não transformar a etapa em correção ampla de warnings existentes.

2. Utilitário centralizado de erros
   - Criado `src/utils/errors.ts`.
   - Criado teste `src/utils/errors.test.ts`.
   - `src/utils/errorTelemetry.ts` passou a normalizar erros pelo utilitário central.
   - `src/App.tsx` passou a usar `getErrorMessage`/`toError` nos fluxos já existentes de erro.

3. TanStack Query Provider
   - Adicionada dependência `@tanstack/react-query`.
   - Criado `src/providers/QueryProvider.tsx`.
   - `src/main.tsx` passou a envolver `App` com `QueryProvider`.

4. Uma query migrada
   - Criado `src/hooks/useDailyCheckinsQuery.ts`.
   - Apenas a leitura de check-ins diários foi migrada para TanStack Query.
   - Saves de check-in e demais dados permaneceram no fluxo existente.

5. Zustand para estado simples de view
   - Adicionada dependência `zustand`.
   - Criado `src/stores/viewStore.ts`.
   - `src/hooks/useAppNavigation.ts` passou a usar o store apenas para `view` e `setView`.

## Validações Por Etapa

Etapa 1:
- `npm run lint`: passou com warnings existentes de hooks/refresh.
- `npm run typecheck`: passou.
- `npm run build`: passou.

Etapa 2:
- `npm run typecheck`: passou.
- `npm run build`: passou.
- `npm run lint`: passou com os mesmos warnings existentes.

Etapa 3:
- `npm run typecheck`: passou.
- `npm run build`: passou.

Etapa 4:
- `npm run typecheck`: passou.
- `npm run build`: passou.

Etapa 5:
- `npm run typecheck`: passou.
- `npm run build`: passou.

## Decisões

- O lint foi ativado de forma real, mas sem `--max-warnings=0`, para permitir baseline incremental.
- O `react-hooks` ficou limitado às regras seguras para este momento: `rules-of-hooks` como erro e `exhaustive-deps` como warning.
- A migration para TanStack Query foi limitada a `useDailyCheckinsQuery`.
- Zustand foi limitado ao estado simples de view, exposto por `useAppNavigation`.
- Nenhuma migration Supabase foi alterada.
- Nenhum workflow Lighthouse foi alterado.
- Nenhum layout ou UX foi alterado intencionalmente.

## Riscos Restantes

- O lint agora revela warnings existentes de dependências de hooks e fast refresh, mas não falha por eles.
- A adoção de TanStack Query ainda está limitada a uma query; novas migrações devem ser feitas em PRs menores e separadas.
- O store Zustand ainda cobre apenas navegação; não deve ser expandido para treino, check-in ou gamificação nesta fase.

## Status Final

Suíte final executada após o último ajuste:
- `git status --short`: mostrou somente arquivos da Fase 3.
- `git diff --check`: passou; apenas avisos LF/CRLF do Git no Windows.
- `npm run typecheck`: passou.
- `npm run build`: passou.
- `npm test`: passou, 39 arquivos / 139 testes.
- `npm run lint`: passou com 16 warnings de baseline, 0 erros.
