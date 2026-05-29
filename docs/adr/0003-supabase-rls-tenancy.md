# ADR 0003: Supabase RLS por usuario

## Status

Aceito

## Contexto

O Treino IA armazena treino, historico, auditoria de IA, dados de recuperacao, billing e gamificacao por usuario. A fronteira multi-tenant B2C deve impedir leitura cruzada mesmo quando o cliente usa chaves publicas do Supabase.

## Decisao

Usar Supabase Auth como identidade primaria e PostgreSQL Row Level Security com policies baseadas em `auth.uid() = user_id` para tabelas de usuario. Server functions podem usar service role apenas para operacoes autenticadas e auditaveis que exigem backend, como billing, compliance e workers.

## Consequencias

- Toda migration que cria tabela com dados de usuario deve habilitar RLS e incluir policy de owner antes de ser promovida.
- RPCs precisam validar `p_user_id` ou derivar usuario do contexto autenticado.
- Testes de schema/RLS em `tests/supabaseRlsCriticalTables.test.ts` e `tests/schemaDrift.test.ts` sao parte do gate de seguranca.
