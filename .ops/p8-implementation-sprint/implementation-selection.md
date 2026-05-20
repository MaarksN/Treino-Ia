# P8 — Implementation Selection

| Item candidato | Origem | Bloqueado? | Escolhido? | Motivo | Risco |
|---|---|---|---|---|---|
| CSP final seguro com hardening incremental | P6 backlog (P6-03) + recomendação P8 | Não | Sim | Item desbloqueado sem credenciais reais; alto impacto em segurança web; viável com validação local de build/test | Regressão em embeds/runtime se diretivas ficarem estritas demais |
| Observability provider real (Sentry/PostHog) | P6 backlog (P6-04) | Sim | Não | Exige provider externo/aprovação e potencial credencial de ambiente | Mudança fora de escopo e sem validação real local |
| OAuth smoke real | P6 backlog (P6-06) | Sim | Não | Exige credenciais reais autorizadas e ambiente externo | Fora do escopo desta sprint |
