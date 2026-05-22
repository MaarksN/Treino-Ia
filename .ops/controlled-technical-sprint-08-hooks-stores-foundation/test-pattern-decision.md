# Padrão de Teste Adotado: Zustand Store Direto

Para a fundação de testes globais na Sprint 08, optou-se por testar os stores Zustand diretamente e de forma isolada do ciclo de vida React.

## Como funciona
1. **Instanciação/Acesso Direto**: Em vez de invocar o store dentro de um contexto de componente React via `@testing-library/react`, manipulamos a store diretamente importando a instância gerada pelo `create`.
2. **Setup do Estado (Isolation)**: Para evitar vazamento de estado (state bleeding) entre testes de uma mesma suíte de store global mutável, o estado inicial original é capturado antes dos testes.
3. **Reset**: No `beforeEach`, o estado da store é limpo via `useAppStore.setState(initialState, true)`. 
4. **Asserts Limpos**: O comportamento da store é validado examinando seus atributos após chamar os "actions" (funções setters integradas ao próprio estado no caso deste projeto).

## Motivo da Escolha
- **Não requer wrappers complexos**: Diferente de testar hooks acoplados a providers, a validação de stores Zustand diretas expõe a lógica pura de state management com overhead mínimo.
- **Isolamento de side-effects**: Ao invocar `setState` e ler `getState()`, dependências do DOM React não interferem.
- **Segurança**: Elimina warnings de "unmounted component updates".

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './useAppStore';

const initialState = useAppStore.getState();

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState(initialState, true);
  });

  it('updates profile correctly', () => {
    // Action
    useAppStore.getState().setProfile({ id: '1', ... });
    
    // Assert
    expect(useAppStore.getState().profile?.id).toBe('1');
  });
});
```
