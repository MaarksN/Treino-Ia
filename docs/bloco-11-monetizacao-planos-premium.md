# 🔴 Bloco 11 — Monetização & Planos Premium

## Objetivo

Criar a base comercial da plataforma com tiers, paywall, checkout, trial, cupons, assinatura, retenção, faturas, referral e proxy seguro para IA.

## Camadas do bloco

- Pricing e planos
- Paywall e checkout
- Entitlements por tier
- Billing e retenção
- Stripe webhooks e segurança da API key

## Arquivos sugeridos

```txt
src/config/plans.ts
src/types/billing.ts
src/utils/entitlements.ts
src/utils/coupons.ts
src/components/pricing/PricingTable.tsx
src/components/pricing/FeatureMatrix.tsx
src/components/billing/PaywallModal.tsx
src/components/billing/UpgradePrompt.tsx
src/components/billing/BillingDashboard.tsx
src/components/billing/CancelRetention.tsx
src/components/billing/InvoiceHistory.tsx
api/stripe/create-checkout-session.ts
api/stripe/webhook.ts
api/gemini-proxy.ts
docs/bloco-11-monetizacao-planos-premium.md
```

## Tabela dos 20 itens

| # | Item | Prioridade sugerida |
|---:|---|---|
| 1 | Estrutura de planos Free / Pro / Coach / Elite | MVP / Base |
| 2 | Paywall com Stripe (checkout session) | MVP / Base |
| 3 | Trial gratuito de 7 dias com contagem regressiva | MVP / Base |
| 4 | Tela de upgrade contextual (upsell no momento certo) | Premium / V2 |
| 5 | Dashboard de assinatura (status, renovação, cancelamento) | MVP / Base |
| 6 | Cupons e códigos promocionais | Premium / V2 |
| 7 | Comparativo de planos (feature matrix visual) | MVP / Base |
| 8 | Limite de planos de treino no Free (2 planos) | Premium / V2 |
| 9 | Marca d'água no PDF exportado no Free | Premium / V2 |
| 10 | Desbloqueio de funcionalidades por tier | MVP / Base |
| 11 | Histórico de faturas e recibos | Premium / V2 |
| 12 | Modo Coach: cobrar alunos pelo app | Roadmap / Futuro |
| 13 | Referral program (indique e ganhe 1 mês grátis) | Roadmap / Futuro |
| 14 | Notificação de renovação (3 dias antes) | Premium / V2 |
| 15 | Webhook Stripe para eventos de pagamento | MVP / Base |
| 16 | Onboarding pós-upgrade (tour das features premium) | Premium / V2 |
| 17 | Página de cancelamento com oferta de retenção | Premium / V2 |
| 18 | Bundle anual com desconto de 40% | Premium / V2 |
| 19 | Badge exclusivo de assinante Pro/Elite no perfil | Premium / V2 |
| 20 | API key segura via Vercel Edge Function (proxy Gemini) | MVP / Base |

## Organização por prioridade

**MVP / Base:** 1, 2, 3, 5, 7, 10, 15, 20

**Premium / V2:** 4, 6, 8, 9, 11, 14, 16, 17, 18, 19

**Roadmap / Futuro:** 12, 13

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
// Exemplo conceitual de rota/tela para o Bloco 11
{currentView === 'bloco-11' && <MonetizacaoPlanosPremiumHub />}
```

## Resultado esperado

Ao concluir o **Bloco 11 — Monetização & Planos Premium**, a plataforma terá uma camada organizada, documentada e pronta para evolução incremental, com os 20 itens mapeados e separados por prioridade.
