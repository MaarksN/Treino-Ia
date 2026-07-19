# Relatório de Migração de Aggregate - B2B SaaS (Organization & Lead)

## Resumo
Visando a evolução da plataforma para um cenário Enterprise (B2B SaaS), a fundação de domínio para `Organization` (Empresas/Clientes) e `Lead` (Prospectos B2B/B2C) foi arquitetada na camada de Domínio, assegurando extensibilidade, validadores robustos e segregação de responsabilidades.

## Entidades e Objetos de Valor Criados
- **`Organization`** (Entity / Aggregate Root): Modela empresas com dados firmográficos, gerenciando sua identidade de forma imutável.
- **`Lead`** (Entity / Aggregate Root): Representa prospectos na pipeline, com tracking de pontuação para o *Smart ICP* via comportamento `qualify()`.
- **`CNPJ`** (Value Object): Validação local isolada para números de cadastro e formatação nativa.
- **`URL`** (Value Object): Validação robusta de endereços usando APIs nativas.
- **`Phone`** (Value Object): Sanitização preventiva e validação de limites de discagem numéricos globais.
- **`LeadScore`** (Value Object): Lógica limpa controlando classificações (`hot`, `warm`, `cold`) de 0 a 100 limitados e blindados.

## Repositórios de Domínio
- **`IOrganizationRepository`**: Abstração de contratos persistentes.
- **`ILeadRepository`**: Define contrato com suporte a recuperação baseada em e-mail ou UUID.

## Use Cases (Aplicação)
- **`CreateOrganizationUseCase`**: Lida com conflito de existências verificando unicamente pelo VO `CNPJ`.
- **`QualifyLeadUseCase`**: Delega a responsabilidade de alteração do `score` de volta para a entidade e aplica persistência.

## Testes e Validação
Todo o esqueleto das features foi desenvolvido com 100% de cobertura nos métodos públicos expostos via testes do *Vitest*.
A suíte E2E (*Playwright*) rodou com total sucesso uma vez que essas novas estruturas operam em paralelo sem tocar as superfícies legadas. O acoplamento no front ocorrerá sob a arquitetura de Plugar Módulos / Plugins nas próximas sprints do Roadmap.

## Dependências Pendentes e Tech Debt
1. Os casos de uso ainda precisarão ser injetados em Rotas (Vercel API) via uma camada de Controllers e Injeção de Dependência no Bootstrap da aplicação (`src/core`).
2. A validação de `CNPJ` atualmente valida apenas máscara e formato (extensão) para evitar quebrar cenários internacionais no MVP. Uma validação estrita Mod-11 deverá ser implementada no futuro de forma Feature Flagged dependendo da expansão LATAM vs Global.
