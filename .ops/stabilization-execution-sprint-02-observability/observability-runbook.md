# Stabilization Execution Sprint 02 - Observability Runbook

## 1. Como verificar erros 5xx
- Abrir o run/log da plataforma de deploy para o horario do incidente.
- Filtrar por `API unexpected error`, `API HttpError` e pelo `requestId` retornado ao cliente.
- Confirmar rota afetada, status e volume aproximado.
- Nunca copiar headers, cookies, authorization ou payload bruto para o incidente.

## 2. Como verificar falhas OAuth
- Filtrar por rotas `api/health/oauth/start` e `api/health/oauth/callback`.
- Classificar falhas de credencial/env como SEV1/SEV2 se ocorrerem em producao.
- Tratar `code`, `state`, access_token e refresh_token como proibidos.
- Registrar apenas provider, status, horario, requestId e mensagem redigida.

## 3. Como verificar falhas Gemini
- Filtrar por `api/gemini-proxy` e status 502/timeout/retry.
- Nao coletar prompt, body, inlineData, fileData, imagem ou base64.
- Conferir status do provider externo e limites/rate.
- Se recorrente por mais de 10 minutos, classificar como SEV2.

## 4. Como verificar telemetria rejeitada
- Conferir `api/telemetry/errors` para 400, 403, 413, 429 e 500.
- 403 indica origem nao permitida; 429 indica rate limit anonimo; 413 indica payload grande.
- Confirmar se redaction removeu PII antes de qualquer compartilhamento.

## 5. Como validar redaction
- Rodar testes de observability redaction e sink.
- Verificar que authorization, token, code/state OAuth, email, cpf, phone, base64/image/photo, prompt, cookie/session/secret aparecem como `[REDACTED]` ou marcador equivalente.
- Confirmar que `requestId` e `correlationId` continuam preservados.

## 6. Como classificar severidade
- SEV1: indisponibilidade ampla, env essencial ausente, OAuth/billing impossibilitando fluxo critico.
- SEV2: aumento sustentado de 5xx, Gemini indisponivel, frontend errors em fluxo principal.
- SEV3: falhas pontuais, telemetry rejected, PWA/cache sem impacto amplo.
- SEV4: ruido operacional sem impacto de usuario.

## 7. Como escalar incidente
- Criar registro com horario, ambiente, release/commit, requestId/correlationId e impacto.
- Acionar owner do dominio: backend, auth/OAuth, AI integration, billing ou frontend.
- Se houver suspeita de vazamento de dado, parar coleta manual e escalar seguranca antes de anexar logs.

## 8. Como fechar incidente
- Registrar causa raiz, mitigacao aplicada, evidencia de recuperacao e riscos residuais.
- Confirmar que nenhum segredo/PII foi anexado ao incidente.
- Abrir follow-up para provider real, dashboard, alertas ou correlationId se a triagem dependeu de passos manuais.
