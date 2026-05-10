# ♿ Bloco 16 — Acessibilidade, i18n & Inclusão

## Objetivo

Elevar a plataforma para padrões de acessibilidade, internacionalização e inclusão: PT-BR revisado, EN-US, ES, leitor de tela, teclado, alto contraste, modo daltônico e exercícios adaptados.

## Camadas do bloco

- Internacionalização
- Acessibilidade WCAG
- Inclusão visual e motora
- Conteúdo adaptado
- Documentação e conformidade

## Arquivos sugeridos

```txt
src/i18n/pt-BR.json
src/i18n/en-US.json
src/i18n/es.json
src/utils/i18n.ts
src/utils/accessibility.ts
src/utils/adaptiveExercises.ts
src/components/accessibility/LanguageSelector.tsx
src/components/accessibility/FontScaleControl.tsx
src/components/accessibility/AccessibilityPanel.tsx
src/components/accessibility/SkipLink.tsx
src/components/accessibility/HighContrastToggle.tsx
src/components/accessibility/ReducedMotionProvider.tsx
docs/accessibility/wcag-report.md
docs/bloco-16-acessibilidade-i18n-inclusao.md
```

## Tabela dos 20 itens

| # | Item | Prioridade sugerida |
|---:|---|---|
| 1 | Revisão e padronização do PT-BR | MVP / Base |
| 2 | Tradução EN-US (inglês americano) | Premium / V2 |
| 3 | Tradução ES (espanhol latino) | Premium / V2 |
| 4 | Seletor de idioma nas configurações | MVP / Base |
| 5 | Modo daltônico (Deuteranopia / Protanopia) | Premium / V2 |
| 6 | Escala de fonte ajustável (S / M / L / XL) | MVP / Base |
| 7 | Compatibilidade com screen readers (ARIA landmarks) | MVP / Base |
| 8 | Navegação 100% por teclado | MVP / Base |
| 9 | Contraste alto: modo WCAG AAA opcional | MVP / Base |
| 10 | Suporte VoiceOver (iOS) e TalkBack (Android) | Premium / V2 |
| 11 | Legendas em todos os vídeos demonstrativos | Premium / V2 |
| 12 | Modo simplificado para idosos (fonte e ícones grandes) | Premium / V2 |
| 13 | Perfil de limitação física (cadeirante, amputado) | Premium / V2 |
| 14 | Exercícios adaptados para PCDs por grupo muscular | Premium / V2 |
| 15 | RTL layout para árabe/hebraico (roadmap futuro) | Roadmap / Futuro |
| 16 | Alt text em todas as imagens | MVP / Base |
| 17 | Respeitar prefers-reduced-motion globalmente | MVP / Base |
| 18 | Foco automático no primeiro campo ao abrir modais | MVP / Base |
| 19 | Skip link "Ir para conteúdo" em todas as páginas | MVP / Base |
| 20 | Documentação WCAG (VPAT / relatório de acessibilidade) | Premium / V2 |

## Organização por prioridade

**MVP / Base:** 1, 4, 6, 7, 8, 9, 16, 17, 18, 19

**Premium / V2:** 2, 3, 5, 10, 11, 12, 13, 14, 20

**Roadmap / Futuro:** 15

## Plano de execução recomendado

### Etapa 1 — Fundação

- Criar os tipos principais do bloco.
- Criar os utilitários/serviços de domínio.
- Criar os componentes de UI sem integração externa obrigatória.
- Persistir inicialmente em `localStorage` ou mock controlado quando o backend ainda não existir.

### Etapa 2 — Integração real

- Conectar os componentes aos serviços reais.
- Adicionar validação de entrada e tratamento de erro.
- Criar logs de auditoria para ações relevantes.
- Adicionar estados de loading, empty state e error state.

### Etapa 3 — Produção

- Adicionar testes unitários para utils/serviços.
- Adicionar testes E2E para fluxos principais.
- Adicionar feature flags para liberar o bloco gradualmente.
- Medir uso, erro, conversão e retenção.

## Critérios de aceite

- Todos os 20 itens do bloco estão representados em UI, serviço, tipo ou documentação.
- O app não quebra quando recursos externos ainda não estão configurados.
- As features críticas possuem fallback seguro.
- O bloco pode ser habilitado/desabilitado por feature flag.
- O usuário entende claramente o valor do bloco na interface.

## Checklist técnico

- [ ] Criar arquivos listados na seção de arquivos sugeridos.
- [ ] Tipar entidades principais.
- [ ] Implementar serviço ou utilitário de domínio.
- [ ] Implementar componentes principais.
- [ ] Integrar no menu principal da plataforma.
- [ ] Adicionar testes dos fluxos principais.
- [ ] Validar responsividade mobile.
- [ ] Validar acessibilidade básica.
- [ ] Documentar variáveis de ambiente, se houver.
- [ ] Registrar limitações e próximos passos.

## Como integrar no menu

```tsx
// Exemplo conceitual de rota/tela para o Bloco 16
{currentView === 'bloco-16' && <AcessibilidadeI18nInclusaoHub />}
```

## Resultado esperado

Ao concluir o **Bloco 16 — Acessibilidade, i18n & Inclusão**, a plataforma terá uma camada organizada, documentada e pronta para evolução incremental, com os 20 itens mapeados e separados por prioridade.
