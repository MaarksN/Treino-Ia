# Contribuindo para Treino-IA

## Setup local

```bash
git clone <repo-url>
cd Treino-Ia
cp .env.example .env.local
npm install
npm run dev
```

## Branches

- `main` ou `master`: producao.
- Branches de feature: `feat/nome-curto`.
- Branches de bugfix: `fix/nome-curto`.
- Branches do Codex: `codex/nome-curto`.

## Commits e PRs

- Prefira conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
- Abra PRs pequenos, com escopo claro e testes relevantes.
- Antes de abrir PR, rode:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Checks de seguranca

- Nunca coloque secrets em variaveis `VITE_*`.
- Nunca commite `.env.local` ou chaves reais.
- Use `npm run security:audit` para checar dependencias de producao.
- Use `npm run check:circular` antes de refactors grandes.

## Testes

- `npm test`: testes unitarios e de integracao.
- `npm run test:e2e`: smoke E2E Playwright.
- `npm run test:e2e:visual`: screenshots visuais Playwright.
- `npm run test:coverage`: cobertura com thresholds progressivos.
