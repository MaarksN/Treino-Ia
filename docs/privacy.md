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
