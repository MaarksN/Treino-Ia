# Privacidade e LGPD (resumo técnico)

## Princípios

- Minimização de dados.
- Finalidade explícita por domínio.
- Direito de exportação e exclusão quando configurado.
- Auditoria para ações sensíveis.

## Segurança

- Segredos apenas em backend.
- Tráfego HTTPS.
- RLS em dados sensíveis.
- Sanitização de input e rate limit server-side.

## Não permitido

- Expor dados sensíveis no frontend.
- Simular premium/gamificação com estado local.
- Misturar mock com produção.

## Beta privado

- Metricas de produto devem registrar eventos de funil sem payload sensivel.
- Eventos de erro devem ser redigidos antes de persistir ou enviar.
- Feedback qualitativo deve evitar fotos, exames, documentos e dados de saude desnecessarios.
- Blocos com mocks, previews ou integracoes nao validadas permanecem fora do usuario comum.
