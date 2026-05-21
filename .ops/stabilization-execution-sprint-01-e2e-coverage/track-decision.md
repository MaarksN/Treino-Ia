| Trilha | Viável? | Teste realizado | Bloqueador | Escolhida? | Motivo |
|---|---|---|---|---|---|
| Playwright / Browser E2E | Não | `npm view @playwright/test version`; `npm install -D @playwright/test --package-lock-only` | `403 Forbidden` no registry para `@playwright/test`. | Não | Dependência base indisponível; artefatos quebrados foram removidos para manter baseline verde. |
| Vitest Coverage | Não | `npm view @vitest/coverage-v8 version`; `npm install -D @vitest/coverage-v8 --package-lock-only` | `403 Forbidden` no registry para `@vitest/coverage-v8`. | Não | Provider indisponível; sem coverage fake. |
