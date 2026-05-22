# Test Harness Decision — Controlled Technical Sprint 05

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 05 — React Component Test Harness Foundation

---

## Auditoria de dependências existentes

| Dependência | Versão | Já instalada? | Usada em testes? |
|---|---|---|---|
| `@testing-library/react` | ^16.3.2 | ✅ Sim | ❌ Não — nenhum `render()` em teste |
| `@testing-library/jest-dom` | ^6.9.1 | ✅ Sim | ❌ Não — nenhum import |
| `@testing-library/user-event` | — | ❌ Não instalada | ❌ Não | 
| `jsdom` | ^29.1.1 | ✅ Sim | ✅ Sim — `environment: 'jsdom'` em vitest.config |
| `vitest` | ^4.1.7 | ✅ Sim | ✅ Sim |

---

## Decisão: reutilizar dependências existentes

**Nenhuma nova dependência instalada.** Todas as libs necessárias para testes de componentes React já estavam no `package.json`:

- `@testing-library/react` — `render()`, `screen`, `fireEvent`
- `@testing-library/jest-dom` — `toBeInTheDocument()`, `toHaveTextContent()`, etc.
- `jsdom` — ambiente DOM para Vitest

Para interações mais complexas (typing, tab, focus), `@testing-library/user-event` pode ser adicionada numa sprint futura. Para esta fundação, `fireEvent` é suficiente.

---

## Mudanças no harness

### 1. Criado `src/test/setup.ts`

```ts
import '@testing-library/jest-dom/vitest';
```

**Motivo:** Importa os matchers do jest-dom (`.toBeInTheDocument()`, `.toHaveTextContent()`, etc.) automaticamente em todos os arquivos de teste via setupFiles, sem necessidade de import individual em cada teste.

### 2. Atualizado `vitest.config.ts`

```diff
  test: {
    environment: 'jsdom',
    globals: true,
+   setupFiles: ['./src/test/setup.ts'],
    include: [...],
```

**Motivo:** Registra o setup file para execução antes de cada arquivo de teste. Sem isso, os matchers do jest-dom não estariam disponíveis globalmente.

---

## Padrão de teste de componente estabelecido

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders expected text', () => {
    render(<MyComponent />);
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('calls callback on interaction', () => {
    const handler = vi.fn();
    render(<MyComponent onClick={handler} />);
    fireEvent.click(screen.getByRole('button', { name: /.../ }));
    expect(handler).toHaveBeenCalledWith('...');
  });
});
```

**Regras do padrão:**
1. Import `render`, `screen`, `fireEvent` de `@testing-library/react`
2. Use `screen.getByText()`, `screen.getByRole()` — seletores acessíveis
3. Use `vi.fn()` para callbacks
4. Assert com `.toBeInTheDocument()`, `.toHaveBeenCalledWith()`, etc.
5. Não usar `container.querySelector()` para texto/roles — preferir seletores acessíveis
6. Cada teste deve ter asserts reais — proibido `expect(true).toBe(true)`
