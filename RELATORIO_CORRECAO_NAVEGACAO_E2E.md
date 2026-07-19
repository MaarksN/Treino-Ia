# Relatório de Correção - Navegação E2E `/conta`

## 1. Causa Raiz Identificada

O teste E2E estava falhando na validação da rota `/conta` porque a navegação (via deep link ou botão) disparava um scroll animado (`scrollIntoView({ behavior: 'smooth' })`).

Como a seção `#dashboard-account` fica no final da tela e, na maioria dos monitores curtos, a janela não tem espaço de "scrollável" suficiente para fazer o topo dessa seção alcançar `<= 140px` (linha de gatilho do observador), a validação de `getBoundingClientRect().top <= 140` falhava. Em consequência, o `reduce` responsável por atualizar o `activeSection` no evento de scroll voltava erroneamente para a seção "Histórico", sobrescrevendo o estado correto ("Conta") logo após a navegação ter sido iniciada.
Outro agravante eram strings não traduzidas ou mapeadas de forma diferente em `dashboardNavigation.ts` vs `workout-cycle.spec.ts` (como "Inicio" x "Início", "Historico" x "Histórico", e um botão de Nutrição antigo).

## 2. Arquivos Alterados

- `src/pages/Dashboard.tsx`
- `src/utils/dashboardNavigation.ts`
- `tests/e2e/workout-cycle.spec.ts`

## 3. Alterações Realizadas

1. **Mecanismo de Scroll Deterministico (`src/pages/Dashboard.tsx`)**:
   Implementado um bypass explícito no topo do `handleScroll` que verifica se o usuário (ou a automação) rolou a página até o limite absoluto do fim (`window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50`).
   Se esse limite for atingido, o estado `activeSection` agora é travado deterministicamente na última seção disponível (`mobileSections[mobileSections.length - 1]`), bypassando a checagem falha de 140px para a última seção.
2. **Correção de Nomes de Seções**:
   As _labels_ da navegação na barra inferior foram renomeadas de 'Inicio' para 'Início' e 'Historico' para 'Histórico' no mapeamento (`dashboardNavigation.ts`) e atualizadas paralelamente nas verificações de texto nos testes E2E para evitar divergências.
3. **Limpeza do Seletor Obsoleto**:
   O `page.getByRole("button", { name: /Nutri/i }).first()` que falhava devido a um componente removido foi limpado do teste E2E, que agora valida a visibilidade através da barra correta sem _flakiness_.

## 4. Justificativa Técnica

Em SPAs complexos com "Scroll Spys" (componentes que destacam a navegação no menu baseado no scroll), a detecção via `getBoundingClientRect` falha fundamentalmente em elementos baixos renderizados no final do documento que nunca conseguem tocar a borda superior.
A verificação por `scrollHeight` resolve diretamente essa falha matemática do navegador sem forçar remoção/adição de observers repetitivamente ou depender de timeouts inseguros (`wait`).
As inconsistências de mapeamento (sem acentos) causavam quebra no seletor _Role_ do Playwright que dependia do rótulo real acessível da tela ("Conta", "Início"), unificando as fontes da verdade de string.

## 5. Impacto em Outras Rotas

As mudanças no listener de scroll afetam todo o módulo da página `Dashboard`. No entanto, como o fallback só ativa no extremo fim absoluto da página (`-50px` buffer), nenhuma outra seção intermediária como 'Plano' ou 'Início' é afetada negativamente, mantendo a experiência idêntica.

## 6. Riscos Identificados

- Em dispositivos móveis onde barras de endereço colapsam nativamente (modificando o `window.innerHeight` ativamente no scroll-down), a margem de `50px` funciona bem, mas _bounces_ drásticos em web-views iOS podem precisar de refinamentos via `ResizeObserver` futuramente. O risco atual é mitigado e baixo.

## 7. Resultado Final da Suíte de Testes

Toda a suíte local (Unitários + Playwright E2E) foi re-executada via `npm run validate` e `npm run test:e2e`.

- **E2E**: 23/23 testes passaram.
- **Unitários**: 777/777 passaram.
- Zero introdução de timeouts arbitrários/waits.
