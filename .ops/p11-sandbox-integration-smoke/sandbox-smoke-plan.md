# P11 Sandbox Smoke Plan

| Área | Smoke | Ambiente | Pré-requisito | Resultado esperado | Pode executar agora? |
|---|---|---|---|---|---|
| OAuth start/callback | POST start + validação state/callback | local (code audit), sandbox OAuth (bloqueado) | Credenciais OAuth sandbox por provider e Supabase válido | redirect seguro, state validado, sem vazamento de token/code | Parcial (auditável) |
| OAuth redirectTo inválido | input malicioso em redirectTo | local code audit + testes utilitários | Guard de allowlist ativo | bloqueio/fallback para base URL segura | Sim |
| Billing sandbox/guard | checkout/portal/webhook em modo teste | local code audit (sem chave sandbox) | STRIPE_SECRET_KEY test + price ids test | sem cobrança real, erro seguro sem segredo | Parcial (auditável) |
| PWA offline/cache | SW e política de cache | local + navegador (não executado browser) | SW e cachePolicy presentes | /api e Authorization sem cache; fallback offline seguro | Parcial (auditável) |
| Telemetry/redaction | flush e ingestão de erros | local tests + code audit | utilitários de redaction e endpoint telemetry | Authorization/tokens/PII redigidos; 500 genérico; requestId presente | Sim |
| Gemini/AI fallback | proxy + fallback determinístico | local tests + code audit | env IA opcional; contratos de validação | timeout/retry/fallback sem mascarar sucesso; erro seguro | Sim (audit/code + testes existentes) |
| CSP headers/browser | headers de produção + embeds permitidos | local build + code audit | vercel.json aplicado | app builda; frame-src restrito; object/base/form corretos | Parcial (sem smoke browser completo) |
| Rollback rehearsal | procedimento não destrutivo | git local | commit atual e anterior estáveis | comando claro de rollback + critérios de abort | Sim |
| Health/readiness | endpoints operacionais mínimos | local code audit | rotas health existentes | status e mensagens seguras | Parcial (sem /api/ready dedicado) |
