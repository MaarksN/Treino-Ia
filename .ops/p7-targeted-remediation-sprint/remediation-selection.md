| Item | Origem P6 | Status | Escolhido? | Motivo | Fora do escopo |
|---|---|---|---|---|---|
| CSP tightening seguro e documental | csp-tightening-plan.md | Desbloqueado (auditoria e ajuste documental) | Sim | Alto impacto de segurança, sem necessidade de credenciais externas e sem alterar arquitetura. | Hardening agressivo em produção sem smoke browser dedicado. |
| Observability/logging checklist + validação local | observability-checklist.md | Desbloqueado (checklist + validação local) | Sim | Mitiga risco operacional com rastreabilidade e redaction sem provider externo. | Integração real com Sentry/PostHog/alert manager externo. |
| Rollback rehearsal runbook + ensaio documental | rollback-rehearsal-runbook.md | Parcialmente desbloqueado | Não | Importante, mas fora da janela curta após priorização de segurança e logs. | Ensaio em ambiente controlado com janela operacional. |
| PWA cache/offline smoke local | stabilization-backlog.md | Bloqueado por execução browser controlada | Não | Necessita smoke browser com controle de rede para validação robusta. | Execução real de smoke offline no navegador. |
| Playwright plan sem instalação | blocked-items.md / quick-wins.md | Bloqueado por dependência/infra não aprovada | Não | Já documentado em P6; P7 focou remediações preferenciais A/B. | Implementação E2E completa sem aprovação de dependência. |
| Coverage plan sem instalação | blocked-items.md | Bloqueado por provider/dependência | Não | Mantido como risco remanescente para fase posterior. | Cobertura consolidada com provider não aprovado. |
