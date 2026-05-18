| Serviço | Antes | Depois | Migrado? | Pendente |
|---|---|---|---|---|
| geminiService | model hardcoded + JSON.parse | policy + safe parser parcial | Parcial | rotas restantes |
| nutritionService | model hardcoded + JSON.parse | policy + safe parser crítico | Parcial | rotas textuais |
| aiPersonalizationService | MODEL local constante | model policy central | Parcial | gateway full |
| gemini-proxy | timeout/retry técnico | sem mudança estrutural | Não | governança por task no proxy |
| scan de refeição | parse direto | safe parser em nutrition flow | Parcial | gateway pleno |
| replanejamento por equipamento | fluxo existente | mapeado para policy | Não | migração dedicada |
