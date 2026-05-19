# P4 Secrets Checklist

| Secret | Finalidade | Onde configurar | Rotação necessária? | Status |
|---|---|---|---|---|
| Supabase service role | Operações server-side privilegiadas | Vercel/infra secrets manager | Sim (trimestral ou incidente) | Pendente |
| Gemini API key | Habilitar integração com provider de IA | Vercel/infra secrets manager | Sim (trimestral ou incidente) | Pendente |
| OAuth client secret | Troca segura de código por token OAuth | Vercel/infra secrets manager | Sim (por provider e incidente) | Pendente |
| OAuth token encryption key | Criptografia de tokens OAuth em repouso | Vercel/infra secrets manager | Sim (plano controlado) | Pendente |
| Stripe secret key | Operações server-side de billing | Vercel/infra secrets manager | Sim (conforme política Stripe) | Pendente |
| Webhook secret | Validação de origem de webhooks | Vercel/infra secrets manager | Sim (em rotação/reissue) | Pendente |
| Vercel env vars (produção) | Parametrização segura por ambiente | Painel Vercel + secret manager | Sim (auditoria periódica) | Pendente |

> Proibido commitar segredos reais; apenas nomes e metadados operacionais.
