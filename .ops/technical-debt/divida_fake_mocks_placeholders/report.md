# Auditoria de Divida Tecnica - Codigo Fake, Mocks e Placeholders

## 1. Resumo executivo

- **Veredito:** FAIL
- **Severidade dominante:** ALTA
- **Fato confirmado:** o codigo sinaliza varios modos `mock_dev_only`, o que e positivo por honestidade tecnica.
- **Risco principal:** algumas funcionalidades sao apresentadas como blocos operacionais, mas ainda dependem de localStorage, tabelas ausentes, respostas mock em desenvolvimento ou demos hardcoded.

## 2. Escopo analisado

- `src/services/healthService.ts`
- `src/services/retentionService.ts`
- `src/services/webhookService.ts`
- `src/services/sessionService.ts`
- `api/gamification/state.ts`
- `src/services/educationAiService.ts`
- `src/components/platform/AdvancedPlatformHub.tsx`
- `docs/api/README.md`, `docs/api/openapi.yaml`

## 3. Comandos executados

- `rg -n "TODO|FIXME|mock|placeholder|fake|simulated|in-memory|localStorage|productImplemented|return \\[\\]|return \\{\\}"`.
- `rg -n "ensureSafeDataMode|mock_dev_only|not_configured|local_fallback|demo" src api tests docs README.md`.
- leituras direcionadas dos arquivos do escopo.

## 4. Achados por severidade

### ALTA

**FAKE-01 - Saude/nutricao/retencao tem superficies maiores que o schema versionado**

- Evidencia: `src/services/healthService.ts:18-32` define chaves `mock_dev_only` locais.
- Evidencia: `src/services/healthService.ts:218-274`, `:504-812` tenta usar tabelas nao encontradas nas migrations.
- Evidencia: `src/services/retentionService.ts:196-293` tenta inicializar e ler tabelas de retencao/white-label tambem ausentes nas migrations.
- Impacto: usuario autenticado pode encontrar erro real; usuario nao autenticado ve experiencia local/mock.
- Recomendacao: transformar features sem schema em preview claro ou criar migrations completas.

**FAKE-02 - Webhooks de produto sao simulados no frontend**

- Evidencia: `src/services/webhookService.ts:10-19` grava entregas em `localStorage`.
- Evidencia: `src/components/platform/AdvancedPlatformHub.tsx:609-615` chama `recordWebhookDelivery` com `https://example.com/n8n/treino`.
- Impacto: integrações parecem existir, mas nao disparam backend, retries ou auditoria real.
- Recomendacao: mover webhooks para backend e manter demo separada.

**FAKE-03 - Sessoes ativas sao hardcoded**

- Evidencia: `src/services/sessionService.ts:3-19` retorna `Navegador atual` e `PWA Mobile` demo.
- Impacto: usuario pode acreditar que ha gestao/revogacao real de sessoes.
- Recomendacao: integrar com Supabase/Auth logs ou remover da UI de seguranca real.

**FAKE-04 - Gamificacao completa so existe como mock em dev; em producao retorna lacunas**

- Evidencia: `api/gamification/state.ts:37-49` em producao retorna `missions: []`, `cosmetics: []`, `season: null`, `clan: null`.
- Evidencia: `api/gamification/state.ts:51-100` retorna mocks em nao-producao com `dataMode: 'mock_dev_only'`.
- Impacto: produto promete season/clan/cosmetics, mas backend real ainda e parcial.
- Recomendacao: reduzir claims ou implementar tabelas/queries reais antes de producao.

### MEDIA

**FAKE-05 - "IA" educacional e fallback deterministico simples**

- Evidencia: `src/services/educationAiService.ts:1-14` monta textos estaticos por interpolacao.
- Evidencia: `src/components/platform/AdvancedPlatformHub.tsx:594` rotula como "Mobilidade IA fallback".
- Impacto: expectativa de IA pode ser maior que a funcionalidade real.
- Recomendacao: rotular como protocolo deterministico ou integrar ao AI gateway.

**FAKE-06 - CSRF/rate limit locais sao demos**

- Evidencia: `src/utils/csrf.ts:1-15`, `src/utils/rateLimit.ts:1-19`.
- Impacto: protecoes demonstrativas podem ser confundidas com controles de producao.
- Recomendacao: renomear copy de UI e mover protecoes reais para backend.

**FAKE-07 - Documentacao ainda descreve endpoints como mock/real e fallback generico**

- Evidencia: `docs/api/README.md:6` diz `checkout mock/real`.
- Evidencia: `docs/api/README.md:10` diz que todos operam em fallback quando secrets ausentes.
- Impacto: dificulta distinguir produto pronto, parcial e not_configured.
- Recomendacao: classificar endpoint por real/parcial/demo/not_configured.

## 5. Evidencias positivas

- `ensureSafeDataMode` bloqueia `mock_dev_only` em producao.
- Alguns guards declaram explicitamente "no fake" em integracoes externas.
- Billing real usa Stripe server-side quando configurado.

## 6. Riscos para SaaS real

- Demo confundida com funcionalidade vendavel.
- Onboarding comercial acima da capacidade real do backend.
- Dados locais sensiveis sem persistencia cloud quando usuario espera sincronizacao.

## 7. Recomendacoes priorizadas

1. Criar inventario "real/parcial/mock/ausente" por feature.
2. Remover claims de producao para webhooks, sessoes ativas e gamificacao parcial.
3. Completar migrations de saude/nutricao/retencao.
4. Separar componentes demo de componentes de produto.

## 8. Quick wins

- Trocar "Simular entrega" por painel "Demo local" e esconder de producao.
- Remover sessao `mobile-demo` da UI de seguranca real.
- Adicionar teste que falha se `mock_dev_only` entrar em build production.

## 9. Itens que exigem decisao humana

- Quais features podem ser vendidas agora.
- Quais demos devem permanecer visiveis em staging.
- Nivel de transparencia no produto para `not_configured`.

## 10. Veredito final

**FAIL.** O codigo e honesto em varios nomes, mas a experiencia do produto ainda mistura real, parcial e demo em superficies importantes.
