| Risco | Status | Mitigação nesta fase | Próxima ação |
|---|---|---|---|
| OAuth encryption real/KMS | Parcial | Guard de modo + warning explícito, sem claim falso de criptografia | Integrar KMS e envelope encryption |
| backend RLS para dados sensíveis | Aberto | Política local de sensibilidade e limpeza/export local | Projetar RLS e segregação de dados sensíveis |
| distributed rate limit | Aberto | Rate limit anônimo local em memória mantido | Migrar para rate limit distribuído (KV/Redis) |
| full LGPD workflow | Aberto | Copy explícita: limpeza/export apenas local | Implementar backend de exportação/remoção completa |
| transactional gamification | Aberto | Fora de escopo P1 | Endereçar em P1 Transactional Consistency |
| CSP final | Aberto | Mantido P0 sem regressão | Endurecer CSP + nonce/hash strategy |
| E2E security flows | Aberto | Cobertura unitária dos guards/redaction | Adicionar fluxos E2E segurança OAuth/privacidade |
