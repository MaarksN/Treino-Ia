# 📚 Bloco 18 — Conteúdo Educacional & Biblioteca

## Objetivo

Construir uma biblioteca educacional robusta: exercícios, filtros, ficha técnica, execução, erros comuns, cursos, artigos, glossário, quiz, calculadoras, aquecimento, alongamentos e referências científicas.

## Camadas do bloco

- Biblioteca de exercícios
- Educação e cursos
- Ferramentas e calculadoras
- Protocolos práticos
- Ciência e referências

## Arquivos sugeridos

```txt
src/types/education.ts
src/data/exerciseLibrary.ts
src/data/fitnessGlossary.ts
src/data/scientificReferences.ts
src/utils/calculators.ts
src/services/educationAiService.ts
src/components/education/ExerciseLibrary.tsx
src/components/education/ExerciseDetail.tsx
src/components/education/CourseCatalog.tsx
src/components/education/ArticleLibrary.tsx
src/components/education/FitnessGlossary.tsx
src/components/education/WeeklyQuiz.tsx
src/components/education/CalculatorHub.tsx
src/components/education/StretchingLibrary.tsx
src/components/education/EducationHub.tsx
docs/bloco-18-conteudo-educacional-biblioteca.md
```

## Tabela dos 20 itens

| # | Item | Prioridade sugerida |
|---:|---|---|
| 1 | Biblioteca de +500 exercícios com GIF demonstrativo | MVP / Base |
| 2 | Filtro por grupo muscular, equipamento e dificuldade | MVP / Base |
| 3 | Ficha técnica: músculos primários e secundários | MVP / Base |
| 4 | Dicas de execução geradas por IA por nível | MVP / Base |
| 5 | Erros comuns e como corrigir (texto + imagem) | MVP / Base |
| 6 | Substitutos de exercício sem equipamento | MVP / Base |
| 7 | Cursos em vídeo: Iniciante, Intermediário, Avançado | Premium / V2 |
| 8 | Artigos educativos: hipertrofia, força, nutrição, sono | Premium / V2 |
| 9 | Glossário de termos do fitness | MVP / Base |
| 10 | Quiz semanal com XP de recompensa | Premium / V2 |
| 11 | Playlist de treino integrada (Spotify/YouTube embed) | Premium / V2 |
| 12 | Calculadoras: 1RM, IMC, %gordura, VO2max estimado | MVP / Base |
| 13 | Protocolo de aquecimento por grupo muscular do dia | MVP / Base |
| 14 | Protocolo de volta à calma pós-treino | MVP / Base |
| 15 | Biblioteca de alongamentos com timer | MVP / Base |
| 16 | Programa de 12 semanas pré-montado (3 objetivos) | Premium / V2 |
| 17 | Certificados de conclusão de programa | Premium / V2 |
| 18 | Podcast / áudio-guia de treino (coach por voz) | Premium / V2 |
| 19 | Seção "Mitos do fitness" com base científica | Premium / V2 |
| 20 | Referências científicas com DOI para cada protocolo | Premium / V2 |

## Organização por prioridade

**MVP / Base:** 1, 2, 3, 4, 5, 6, 9, 12, 13, 14, 15

**Premium / V2:** 7, 8, 10, 11, 16, 17, 18, 19, 20

**Roadmap / Futuro:** Nenhum

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
// Exemplo conceitual de rota/tela para o Bloco 18
{currentView === 'bloco-18' && <ConteudoEducacionalBibliotecaHub />}
```

## Resultado esperado

Ao concluir o **Bloco 18 — Conteúdo Educacional & Biblioteca**, a plataforma terá uma camada organizada, documentada e pronta para evolução incremental, com os 20 itens mapeados e separados por prioridade.
