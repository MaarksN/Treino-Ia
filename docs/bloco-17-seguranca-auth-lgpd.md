# 🔒 Bloco 17 — Segurança, Auth & LGPD

## Objetivo

Implementar autenticação segura, proteção da API Gemini, rate limiting, LGPD/GDPR, cookies granulares, exportação/exclusão de dados, auditoria, criptografia, CSP, CSRF e manutenção.

## Camadas do bloco

- Auth e sessão
- Proteção de IA/API
- Privacidade e LGPD
- Auditoria e segurança web
- Backups e operação

## Arquivos sugeridos

```txt
src/types/security.ts
src/services/authService.ts
src/services/sessionService.ts
src/services/privacyService.ts
src/services/auditLogService.ts
src/utils/inputSanitizer.ts
src/utils/csrf.ts
src/utils/rateLimit.ts
src/components/auth/LoginForm.tsx
src/components/auth/TwoFactorSetup.tsx
src/components/privacy/CookieConsentBanner.tsx
src/components/privacy/DataExportPanel.tsx
src/components/privacy/DeleteAccountPanel.tsx
src/components/security/ActiveSessions.tsx
api/gemini-proxy.ts
api/security/rate-limit.ts
docs/legal/privacy-policy.md
docs/security/responsible-disclosure.md
docs/bloco-17-seguranca-auth-lgpd.md
```

## Tabela dos 20 itens

| # | Item | Prioridade sugerida |
|---:|---|---|
| 1 | Autenticação Supabase Auth (email + senha) | MVP / Base |
| 2 | Login social: Google OAuth2 | Premium / V2 |
| 3 | Login social: Apple Sign-In | Premium / V2 |
| 4 | 2FA via TOTP (Google Authenticator) | Premium / V2 |
| 5 | JWT com refresh token seguro (httpOnly cookie) | Premium / V2 |
| 6 | Proxy backend para API key Gemini | MVP / Base |
| 7 | Rate limiting nas chamadas à IA | MVP / Base |
| 8 | Política de privacidade completa (LGPD/GDPR) | MVP / Base |
| 9 | Banner de consentimento de cookies granular | MVP / Base |
| 10 | Direito ao esquecimento: exclusão de conta + dados | MVP / Base |
| 11 | Exportação de dados pessoais (LGPD Art. 18) | MVP / Base |
| 12 | Log de auditoria de ações do usuário | MVP / Base |
| 13 | Sessões ativas: ver e revogar dispositivos | Premium / V2 |
| 14 | Criptografia de dados sensíveis em repouso (AES-256) | Premium / V2 |
| 15 | Sanitização de inputs contra XSS/injection | MVP / Base |
| 16 | CSP (Content Security Policy) headers | MVP / Base |
| 17 | Proteção CSRF em todas as mutações | MVP / Base |
| 18 | Responsible disclosure (relatório de vulnerabilidades) | Premium / V2 |
| 19 | Backup automático diário no Supabase | Premium / V2 |
| 20 | Modo de manutenção com página de status | Premium / V2 |

## Organização por prioridade

**MVP / Base:** 1, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17

**Premium / V2:** 2, 3, 4, 5, 13, 14, 18, 19, 20

**Roadmap / Futuro:** Nenhum

## Plano de execução recomendado

### Etapa 1 — Fundação

- Criar os tipos principais do bloco.
- Criar os utilitários/serviços de domínio.
- Criar os componentes de UI sem integração externa obrigatória.
- Persistir inicialmente em `localStorage` ou mock controlado quando o backend ainda não existir.

### Etapa 2 — Integração real

- Conectar os componentes aos serviços reais.
- Adicionar validação de entrada e tratamento de erro.
- Criar logs de auditoria para ações relevantes.
- Adicionar estados de loading, empty state e error state.

### Etapa 3 — Produção

- Adicionar testes unitários para utils/serviços.
- Adicionar testes E2E para fluxos principais.
- Adicionar feature flags para liberar o bloco gradualmente.
- Medir uso, erro, conversão e retenção.

## Critérios de aceite

- Todos os 20 itens do bloco estão representados em UI, serviço, tipo ou documentação.
- O app não quebra quando recursos externos ainda não estão configurados.
- As features críticas possuem fallback seguro.
- O bloco pode ser habilitado/desabilitado por feature flag.
- O usuário entende claramente o valor do bloco na interface.

## Checklist técnico

- [ ] Criar arquivos listados na seção de arquivos sugeridos.
- [ ] Tipar entidades principais.
- [ ] Implementar serviço ou utilitário de domínio.
- [ ] Implementar componentes principais.
- [ ] Integrar no menu principal da plataforma.
- [ ] Adicionar testes dos fluxos principais.
- [ ] Validar responsividade mobile.
- [ ] Validar acessibilidade básica.
- [ ] Documentar variáveis de ambiente, se houver.
- [ ] Registrar limitações e próximos passos.

## Como integrar no menu

```tsx
// Exemplo conceitual de rota/tela para o Bloco 17
{currentView === 'bloco-17' && <SegurancaAuthLgpdHub />}
```

## Resultado esperado

Ao concluir o **Bloco 17 — Segurança, Auth & LGPD**, a plataforma terá uma camada organizada, documentada e pronta para evolução incremental, com os 20 itens mapeados e separados por prioridade.
