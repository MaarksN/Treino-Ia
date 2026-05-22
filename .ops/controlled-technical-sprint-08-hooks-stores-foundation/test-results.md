| Alvo | Teste | Resultado | Evidência | Observação |
|---|---|---|---|---|
| useAppStore | has expected initial state | ✅ PASS | `npx vitest run ...` | Verifica todas as chaves iniciais |
| useAppStore | updates simple state values correctly | ✅ PASS | `npx vitest run ...` | Verifica setters booleanos e de strings |
| useAppStore | updates objects and arrays correctly | ✅ PASS | `npx vitest run ...` | Verifica setters de arrays e objetos complexos |
| viewStore | has expected initial state | ✅ PASS | `npx vitest run ...` | Verifica estado não-inicializado |
| viewStore | initializes view correctly if not previously initialized | ✅ PASS | `npx vitest run ...` | Verifica ação state.initializeView |
| viewStore | ignores initializeView if already initialized | ✅ PASS | `npx vitest run ...` | Confirma restrição de reinicialização |
| viewStore | forces a view change via setView regardless of initialization state | ✅ PASS | `npx vitest run ...` | Verifica override de inicialização |
