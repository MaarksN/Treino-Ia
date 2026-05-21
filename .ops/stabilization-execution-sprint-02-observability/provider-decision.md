# Stabilization Execution Sprint 02 - Provider Decision

| Provider | Aprovado? | Dependencia necessaria? | Dados coletados | Risco LGPD/seguranca | Decisao |
|---|---|---|---|---|---|
| Sentry | Nao | Sim, SDK/config e secrets | Erros, stack traces, release, rota/contexto | Medio/alto se stack ou contexto contiver PII/segredo | Nao integrar sem aprovacao explicita e revisao de redaction/source maps. |
| PostHog | Nao | Sim, SDK/config e consentimento | Eventos de produto, sessao, funis | Alto para analytics comportamental e dados de saude/treino | Nao integrar nesta sprint. |
| Datadog | Nao | Sim, agente/SDK/config e secrets | Logs, metricas, traces | Alto por volume de dados e retencao | Nao integrar sem padrao de plataforma aprovado. |
| BetterStack/Logtail | Nao | Sim, token/log drain | Logs e metadados de deploy | Medio; logs podem conter PII se redaction falhar | Nao integrar sem aprovacao e token em env seguro. |
| Vercel Logs/Analytics | Nao | Talvez, depende do produto Vercel habilitado | Web vitals/request logs/deploy metadata | Medio; requer revisao de retencao/acesso | Nao habilitar sem aprovacao da plataforma. |
| Manual/Internal adapter | Sim | Nao | Eventos redigidos em memoria/testes; logs atuais do runtime | Baixo para vendor risk; alertas reais seguem ausentes | Escolhido para esta sprint. Nao envia dados externos. |

## Decision
Trilha B escolhida: provider externo ainda nao aprovado.

No external SDK, no new dependency, no event export, and no secrets were added. The approved operational base for this sprint is a safe Manual/Internal adapter with mandatory redaction before any sink stores an event.
