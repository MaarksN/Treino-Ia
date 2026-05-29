# ADR 0004: Correlation ID nas APIs

## Status

Aceito

## Contexto

Erros em fluxos como IA, billing, sync offline e compliance atravessam frontend, Vercel Functions e Supabase. Sem um identificador compartilhado, a triagem depende de horario aproximado e mensagens soltas.

## Decisao

Todas as respostas das APIs devem expor `X-Correlation-ID`. O frontend envia esse header por `apiFetch`, e `api/_lib/http.ts` preserva IDs validos recebidos ou cria um novo quando ausente.

## Consequencias

- Suporte pode pedir o correlation id visivel em respostas/API logs para rastrear incidentes.
- Logs server-side devem registrar `correlationId` em vez de gerar IDs desconectados.
- Novos fetches para `/api/*` devem usar `apiFetch` ou `withCorrelationHeaders`.
