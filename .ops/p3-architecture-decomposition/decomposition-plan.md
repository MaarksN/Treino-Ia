| Arquivo | Linhas | Responsabilidades atuais | Extrações seguras | Risco | Decisão |
|---|---:|---|---|---|---|
| src/components/platform/AdvancedPlatformHub.tsx | 1115 | Hub único com navegação, métricas, painéis operacionais e utilitários locais | Extrair tipos/constantes/painéis puros por etapas mantendo wrapper | Médio (regressão visual) | Planejado, sem mudança estrutural agressiva nesta fase |
| src/components/WorkoutDashboard.tsx | 993 | Container de treino + UI + helpers locais | Extrair helpers puros para módulo dedicado (`workout-dashboard`) | Baixo | Executado |
| src/services/database.ts | 384 | Façade de persistência + tipos de domínio + fallback local/cloud | Extrair tipos para `database.types.ts` e manter façade | Baixo | Executado |
| src/services/trainingReadModels.ts | 72 | Mappers de leitura/escrita para JSONB e validação básica | Depender de tipos puros sem importar `database.ts` | Baixo | Executado |
