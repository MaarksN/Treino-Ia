# P4 Rollback Checklist

## Como reverter deploy
- Reverter para o último build/tag estável no provedor de deploy.
- Confirmar versão revertida no painel de release.

## Como reverter env vars
- Restaurar snapshot/versionamento anterior das variáveis críticas.
- Revalidar `APP_URL`, chaves OAuth, Stripe e Supabase após rollback.

## Como desabilitar feature/config problemática
- Desativar flags/configurações operacionais associadas ao incidente.
- Bloquear temporariamente integrações externas impactadas (OAuth, billing, IA) se necessário.

## Como validar rollback
- Verificar healthchecks `/api/health/*`.
- Executar smoke crítico: login → dashboard → treino → persistência básica.
- Confirmar ausência de novos erros críticos em logs/alertas.

## Quem aprova rollback
- Release Manager de plantão + responsável técnico backend/frontend.

## Tempo máximo aceitável para rollback
- Até 30 minutos entre decisão e estabilização inicial.
