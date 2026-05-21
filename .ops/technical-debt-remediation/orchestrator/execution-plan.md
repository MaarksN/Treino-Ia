# Execution Plan

**Ordem Confirmada:**
A ordem de execução respeita o MANIFEST.txt e o README, dividida nas seguintes prioridades:

### P0 — Bloqueadores
1. `01_P0_GAMIFICATION_RPC_HARDENING.txt`
2. `02_P0_SCHEMA_SOURCE_OF_TRUTH.txt`
3. `03_P0_SCHEMA_INVENTORY_MISSING_MIGRATIONS.txt`
4. `04_P0_TENANCY_DECISION_AND_FOUNDATION.txt`

### P1 — Segurança/Auth/RLS
5. `05_P1_SOCIAL_RLS_POLICIES.txt`
6. `06_P1_SECURITY_HTTP_DEFAULTS_CORS_BODY_LIMITS.txt`
7. `07_P1_STRIPE_REDIRECT_AND_PAYLOAD_MINIMIZATION.txt`
8. `08_P1_GAMIFICATION_SERVER_AUTHORITATIVE_EVENTS.txt`
9. `09_P1_COACH_STUDENT_CONSENT_FLOW.txt`

### P2 — Fakes críticos e auditoria
10. `10_P2_SERVER_SIDE_AUDIT_LOG.txt`
11. `11_P2_BACKEND_WEBHOOKS_REAL_DELIVERY.txt`
12. `12_P2_REAL_SESSIONS_OR_DISABLE_SECURITY_UI.txt`
13. `13_P2_HEALTH_NUTRITION_RETENTION_SCHEMA_OR_FEATURE_FLAGS.txt`
14. `14_P2_PRODUCT_MOCK_BETA_REAL_LABELING.txt`

### P3 — Testes/CI/Contratos
15. `15_P3_RLS_RPC_CONTRACT_TESTS.txt`
16. `16_P3_PLAYWRIGHT_E2E_CI_GATE.txt`
17. `17_P3_OPENAPI_CONTRACT_ALIGNMENT.txt`
18. `18_P3_COVERAGE_BASELINE_CRITICAL_MODULES.txt`

### P4 — Confiabilidade/Observabilidade
19. `19_P4_HEALTH_OAUTH_SYNC_PROVIDER_STATE.txt`
20. `20_P4_JOBS_WORKER_DLQ_IDEMPOTENCY.txt`
21. `21_P4_RETENTION_WEBHOOK_SECURITY_RELIABILITY.txt`
22. `22_P4_DISTRIBUTED_RATE_LIMITS.txt`
23. `23_P4_OBSERVABILITY_PROVIDER_CORRELATION.txt`
24. `24_P4_AI_GATEWAY_AUDIT_COST_GOVERNANCE.txt`

### P5 — Arquitetura/Governança
25. `25_P5_FRONTEND_DATA_ACCESS_REFACTOR.txt`
26. `26_P5_TECHNICAL_GOVERNANCE_GUARDRAILS.txt`
27. `27_P5_OPERATION_SUPPORT_CONSOLE_FOUNDATION.txt`

### Final
28. `28_FINAL_GO_NO_GO_PRODUCTION_READINESS.txt`

**Quantidade de prompts encontrados:**
28 prompts.

**Quais prompts existem:**
Todos os 28 enumerados acima estão presentes no diretório extraído.

**Quais prompts faltam:**
Nenhum.

**Estratégia de commit por sprint:**
Para cada sprint/prompt, os comandos de lint, build, e test serão rodados (conforme aplicável). Apenas os arquivos do escopo da sprint serão "commitados" com a mensagem sugerida no respectivo prompt. Após o commit, o master status será atualizado.

**Regras de Parada:**
- Uma sprint retornar `FAIL` ou `BLOCKED WITH EVIDENCE`.
- Falta de arquivos no escopo ou impossibilidade de contornar dependências críticas.
- Existência de risco de migração destrutiva.
- Estado não limpo impossível de isolar no Git.