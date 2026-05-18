| Categoria | Exemplo | Sensibilidade | Armazenamento atual | Decisão P1 | Próxima ação |
|---|---|---|---|---|---|
| métricas corporais | peso/%gordura/cintura | sensitive_health | localStorage | allow_with_ttl | migrar para backend com consentimento + retenção |
| fotos/base64 | photoBase64 | sensitive_image | localStorage | deny_backend_required | mover para backend seguro/object storage |
| sintomas/dor | pain checkin/symptoms | sensitive_health | localStorage | allow_with_ttl | persistência segura com RLS |
| sono | sleep entries | sensitive_health | localStorage | allow_with_ttl | backend + retention policy |
| alimentação | meals/macros | sensitive_health | localStorage | allow_with_ttl | backend com consentimento |
| tokens OAuth | access_token/refresh_token | credential | banco integração oauth | deny em local + guard modo backend | KMS/encryption real |
| telemetria | erros app/api | personal/unknown | localStorage + API | redact_before_store | pipeline observabilidade com política PII central |
| dados de treino | histórico/checkins | personal | localStorage/supabase | allow_with_ttl | convergir para source-of-truth server |
| preferências de UI | tema/acessibilidade | low | localStorage | allow | manter local com revisão periódica |
