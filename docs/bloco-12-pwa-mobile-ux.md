# 📱 Bloco 12 — PWA & Mobile UX

## Objetivo

Transformar a experiência mobile em app-like: instalável, offline, com navegação inferior, gestos, haptics, timer, fullscreen e transições modernas.

## Camadas do bloco

- PWA e offline
- UX mobile first
- Gestos e feedback háptico
- Execução de treino em tela cheia
- Performance visual e estados de carregamento

## Arquivos sugeridos

```txt
public/manifest.webmanifest
public/sw.js
src/utils/pwa.ts
src/utils/haptics.ts
src/utils/mobileGestures.ts
src/components/mobile/BottomNav.tsx
src/components/mobile/FloatingActionButton.tsx
src/components/mobile/PullToRefresh.tsx
src/components/mobile/SkeletonLoader.tsx
src/components/mobile/OfflineBanner.tsx
src/components/workout/ActiveWorkoutFullscreen.tsx
src/components/workout/RestTimerMobile.tsx
src/components/workout/SwipeableWorkoutDay.tsx
docs/bloco-12-pwa-mobile-ux.md
```

## Tabela dos 20 itens

| # | Item | Prioridade sugerida |
|---:|---|---|
| 1 | Web App Manifest (instalação como app nativo) | MVP / Base |
| 2 | Service Worker com cache offline dos treinos | MVP / Base |
| 3 | Tela splash e ícone personalizado por plataforma | Premium / V2 |
| 4 | Push Notifications: lembrete de treino diário | Premium / V2 |
| 5 | Bottom Navigation Bar para mobile (≤768px) | MVP / Base |
| 6 | Swipe lateral para trocar de dia de treino | Premium / V2 |
| 7 | Pull-to-refresh no feed e no histórico | Premium / V2 |
| 8 | Modo tela cheia durante execução do treino | MVP / Base |
| 9 | Haptic feedback nos check de exercício (vibração) | MVP / Base |
| 10 | Timer de descanso com cronômetro regressivo e vibração | MVP / Base |
| 11 | Tela de bloqueio: exibir exercício atual no widget | Roadmap / Futuro |
| 12 | Modo landscape para ver tabela de exercícios | Roadmap / Futuro |
| 13 | Gestos de swipe para marcar exercício como feito | Premium / V2 |
| 14 | Skeleton loaders em todas as telas de carregamento | MVP / Base |
| 15 | Transições de página com animação fluida (Framer Motion) | Premium / V2 |
| 16 | Modo noturno automático por horário (22h–6h) | Premium / V2 |
| 17 | Scroll infinito no histórico de treinos | Premium / V2 |
| 18 | FAB (floating action button) para ação principal | MVP / Base |
| 19 | Detecção de conexão offline com banner de aviso | MVP / Base |
| 20 | Atalhos de app (3D Touch / long press no ícone) | Premium / V2 |

## Organização por prioridade

**MVP / Base:** 1, 2, 5, 8, 9, 10, 14, 18, 19

**Premium / V2:** 3, 4, 6, 7, 13, 15, 16, 17, 20

**Roadmap / Futuro:** 11, 12

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
// Exemplo conceitual de rota/tela para o Bloco 12
{currentView === 'bloco-12' && <PwaMobileUxHub />}
```

## Resultado esperado

Ao concluir o **Bloco 12 — PWA & Mobile UX**, a plataforma terá uma camada organizada, documentada e pronta para evolução incremental, com os 20 itens mapeados e separados por prioridade.
