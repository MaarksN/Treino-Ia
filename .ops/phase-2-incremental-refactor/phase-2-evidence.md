# Fase 2 — Evidências (Refatoração Incremental)

## Commit de estabilização
- Commit base aprovado: `ec3919e` *(equivalente no branch atual: `0396ffb`)*.
- Commit incremental atual da Fase 2: `f9f73ef`.
- Motivo: restaurar bloco de imports do `src/App.tsx`, recuperar compilação após regressão e seguir com extrações pequenas de baixo risco.

## Arquivos alterados na Fase 2 até o congelamento de escopo
- `src/App.tsx`
- `src/navigation/views.ts`
- `src/types.ts`
- `src/hooks/useAppNavigation.ts`
- `src/hooks/useAuthState.ts`
- `.ops/phase-2-incremental-refactor/phase-2-evidence.md`

## Escopo funcional entregue (Fase 2 incremental)
- Estabilização de `App.tsx` após regressão de imports.
- Preservação de `VIEWS` + `AppView` para tipagem de navegação.
- Preservação de `src/types.ts` como fachada temporária (incluindo alias de compatibilidade).
- Extração do hook `useAppNavigation` (navegação/UI) sem alterar comportamento visual.
- Extração do hook `useAuthState` para assinatura de autenticação e refresh de sessão.
- Escopo congelado neste ponto (sem avançar para Fase 3 e sem extrações de treino/check-in/gamificação nesta rodada).

## Validação local executada
- `npm run typecheck` ✅
- `git diff --check` ✅
- `npm run build` ✅

## Status de CI e limitação do ambiente do agente
- GitHub Actions status could not be checked from the agent environment because GitHub CLI is not installed.
- Local validation passed with npm run typecheck, git diff --check and npm run build.
- Final GitHub Actions status must be verified in the GitHub UI.

## Critério de prontidão da PR da Fase 2
A PR só deve ser marcada como pronta quando estes itens estiverem confirmados no GitHub:
- `CI / validate` verde.
- `Lighthouse / lhci` verde, ou falha justificada tecnicamente se for externa.
- `npm run typecheck` verde.
- `npm run build` verde.
- Evidência da Fase 2 atualizada.
- Escopo limitado à Fase 2 incremental.
