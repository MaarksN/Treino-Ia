| Risco | Status | Mitigação nesta fase | Próxima ação |
|---|---|---|---|
| output inválido | Reduzido | parser seguro + guards | expandir schemas fortes |
| prompt injection | Parcial | prompts com saída estrita JSON | hardening contextual e filtro |
| dados sensíveis em prompt | Parcial | sem logging sensível novo | redaction central |
| custo excessivo | Reduzido | budget policy por tarefa | telemetria de custo/token |
| modelo hardcoded | Parcial | model policy + migração crítica | migrar serviços restantes |
| multimodal sem guard | Reduzido | flag allowMultimodal em policy | enforce completo no proxy |
| fallback inseguro | Reduzido | fallback tipado no gateway | fallback por domínio detalhado |
| retry em erro não recuperável | Parcial | erro tipado com retryable | classificador de erro refinado |
