# Documentacao e Manutenibilidade

Status: PARTIAL

## Documentacao existente

- `README.md`: stack, setup local, validacao e envs.
- `docs/api/openapi.yaml`: contratos de API.
- `docs/architecture.md`: arquitetura.
- `docs/database.md`: banco.
- `docs/deployment.md`: deploy.
- `docs/disaster-recovery.md`: DR.
- `docs/runbook.md`: operacao.
- `docs/legal/privacy-policy.md`: privacidade.
- `docs/adr/*.md`: ADRs.
- `.env.example`: variaveis.

## Manutenibilidade

Passou:

- `npm run lint`.
- `npm run typecheck`.
- `npm run build`.
- `madge`: sem ciclos.

Falhou/partial:

- `npm run format:check`: 717 arquivos fora do Prettier.
- `jscpd`: 54 clones.
- `ts-prune`: muitos exports aparentemente nao usados.
- `dependency-cruiser`: sem config de regras, portanto nao valida boundaries.

## Lacunas documentais

- README nao documenta o workaround local usado aqui para ausencia de npm no PATH; isto e especifico do ambiente Codex, nao necessariamente do projeto.
- OpenAPI usa `https://example.vercel.app` como servidor production placeholder.
- Falta relatorio formal de ultima execucao bem-sucedida em staging com URL e evidencias.
- Falta SBOM e politica de supply chain.

## Decisao

PARTIAL. Documentacao e ampla, mas gates de formatting, staging evidence e operating evidence ainda falham.
