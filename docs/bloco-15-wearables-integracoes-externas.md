# ⌚ Bloco 15 — Wearables & Integrações Externas

## Objetivo

Conectar a plataforma a ecossistemas externos: Apple Health, Google Fit, Garmin, Polar, Fitbit, BLE, Strava, Calendar, Zapier/n8n, Notion, WhatsApp e Supabase sync.

## Camadas do bloco

- Health data
- Wearables e BLE
- Importação/exportação
- APIs e webhooks
- Cloud sync

## Arquivos sugeridos

```txt
src/types/integrations.ts
src/services/appleHealthService.ts
src/services/googleFitService.ts
src/services/garminImportService.ts
src/services/fitbitOAuthService.ts
src/services/bleHeartRateService.ts
src/services/stravaExportService.ts
src/services/calendarSyncService.ts
src/services/webhookService.ts
src/services/notionExportService.ts
src/services/whatsappService.ts
src/components/integrations/IntegrationsHub.tsx
src/components/integrations/WearableConnectionCard.tsx
src/components/integrations/HeartRateZones.tsx
docs/bloco-15-wearables-integracoes-externas.md
```

## Tabela dos 20 itens

| # | Item | Prioridade sugerida |
|---:|---|---|
| 1 | Integração Apple Health (passos, sono, FC, calorias) | Premium / V2 |
| 2 | Integração Google Fit / Health Connect (Android) | Premium / V2 |
| 3 | Importação de dados Garmin via CSV/GPX | MVP / Base |
| 4 | Importação de dados Polar Flow | Roadmap / Futuro |
| 5 | Conexão Fitbit API (OAuth2) | Premium / V2 |
| 6 | Leitura de FC em tempo real (BLE HR monitor) | MVP / Base |
| 7 | Zona de FC durante treino (5 zonas) | MVP / Base |
| 8 | Calorias gastas: wearable vs estimativa IA | Premium / V2 |
| 9 | Export de treino para Strava | Premium / V2 |
| 10 | Sincronização com Google Calendar (agendamento de treino) | MVP / Base |
| 11 | Webhook para n8n / Zapier | MVP / Base |
| 12 | API pública REST (documentada com Swagger) | Premium / V2 |
| 13 | Importar treinos do Hevy, Strong, Treinador (CSV) | MVP / Base |
| 14 | Exportar histórico completo em JSON/CSV | MVP / Base |
| 15 | Widget iOS do treino do dia (via PWA) | Roadmap / Futuro |
| 16 | Widget Android (home screen shortcut) | Roadmap / Futuro |
| 17 | Integração com Notion (exportar plano como página) | Premium / V2 |
| 18 | Conexão WhatsApp Business (envio de plano por mensagem) | Premium / V2 |
| 19 | QR Code do plano para personal trainer | MVP / Base |
| 20 | Migração localStorage → Supabase (cloud sync) | MVP / Base |

## Organização por prioridade

**MVP / Base:** 3, 6, 7, 10, 11, 13, 14, 19, 20

**Premium / V2:** 1, 2, 5, 8, 9, 12, 17, 18

**Roadmap / Futuro:** 4, 15, 16

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
// Exemplo conceitual de rota/tela para o Bloco 15
{currentView === 'bloco-15' && <WearablesIntegracoesExternasHub />}
```

## Resultado esperado

Ao concluir o **Bloco 15 — Wearables & Integrações Externas**, a plataforma terá uma camada organizada, documentada e pronta para evolução incremental, com os 20 itens mapeados e separados por prioridade.
