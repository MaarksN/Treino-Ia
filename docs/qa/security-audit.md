# Auditoria de Seguranca

Status: PARTIAL

## Segredos

- Busca em codigo atual por `password|secret|api_key|private_key|jwt_secret` com literais sensiveis: sem achados.
- Busca rapida no historico Git por padroes semelhantes: sem achados.
- `navigation-security.spec.ts` validou que page source nao contem strings obvias de secrets.
- `.env.example` contem placeholders, nao segredos reais.

## Controles encontrados

- Bearer auth obrigatorio em APIs sensiveis via `requireSupabaseUser`.
- CORS com allowlists em `api/_lib/http.ts`.
- CSP e headers em `vercel.json`.
- Stripe webhook com assinatura.
- Rate limiting em Gemini e compliance via `checkRateLimit`; dependencia de Upstash quando configurado.
- Payload limits em endpoints criticos.
- Redacao de PII em helpers e testes (`api/_lib/redact.ts`, `piiRedaction.ts`, observability redaction).

## Achados e riscos

- `vercel.json` tem CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, mas nao inclui `Strict-Transport-Security` localmente; HSTS depende de plataforma/edge.
- `npm run preflight:sprint3` falhou por envs de seguranca ausentes.
- Health OAuth usa modo `plaintext_blocked` por default na doc, mas nao foi validado com chave de criptografia real.
- Sem teste real de IDOR/BOLA em staging.
- Sem teste real de rate limit distribuido.
- Sem DAST ou scanner OWASP dinamico.
- Lighthouse security audits falharam por `NO_FCP`, sem resultado aproveitavel.

## OWASP resumo

| Item | Status | Evidencia |
|---|---|---|
| Broken Access Control | BLOCKED | RLS estatica existe; IDOR real nao testado |
| Cryptographic Failures | PARTIAL | Sem secrets hardcoded; OAuth encryption real nao validada |
| Injection | PARTIAL | Supabase client/queries tipadas; sem fuzz real |
| Insecure Design | PARTIAL | docs/ADRs existem; staging nao validado |
| Security Misconfiguration | PARTIAL | headers existem; preflight env falhou |
| Vulnerable Components | PASS local | npm audit 0 |
| Auth Failures | PARTIAL | unit tests 401; auth real bloqueado |
| Integrity Failures | PARTIAL | CI existe; branch protection nao verificada |
| Logging Failures | PARTIAL | correlation id/redaction existem; Sentry real bloqueado |
| SSRF/Path Traversal | NOT TESTED | nao houve DAST |

## Decisao

PARTIAL. Sem segredo exposto confirmado e sem vulnerabilidade critica npm, mas seguranca de producao nao esta validada sem staging, secrets, auth real, tenant test e headers reais.
