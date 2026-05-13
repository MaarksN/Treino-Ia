# Supabase Cloud para Treino IA

Este app usa Supabase quando `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estao configuradas e o usuario esta autenticado. Sem isso, ele continua em modo local para desenvolvimento.

## 1. Criar o projeto

1. Crie um projeto no Supabase Cloud.
2. Copie a Project URL para `VITE_SUPABASE_URL`.
3. Copie a anon public key para `VITE_SUPABASE_ANON_KEY`.
4. Configure essas variaveis no `.env` local e tambem no provedor de deploy.

## 2. Rodar o schema

Use a migration ja existente:

```txt
supabase/migrations/20260511052000_legacy_training_profile_plan_history.sql
```

Ela cria:

- `training_user_profiles`: anamnese/perfil do atleta
- `training_workout_plans`: plano semanal atual em JSON
- `training_workout_history_records`: sessoes finalizadas e historico
- RLS para cada usuario acessar apenas os proprios dados

## 3. Autenticacao

Ative Email/Password em Supabase Auth. No app, use o painel "Persistencia" para criar conta ou entrar. Ao entrar, dados locais existentes sao migrados para a nuvem quando possivel.

## 4. Fluxo de dados

```txt
Anamnese
-> training_user_profiles
-> Motor de regras gera plano
-> training_workout_plans
-> Modo treino ativo salva sessao
-> training_workout_history_records
-> Motor ajusta a proxima recomendacao
```
