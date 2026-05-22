| Componente | Teste | Resultado | Evidência | Observação |
|---|---|---|---|---|
| RegistrationForm | renders initial form fields correctly | ✅ PASS | `npx vitest run ...` | Renderiza UI e placeholders |
| RegistrationForm | updates input values when typing | ✅ PASS | `npx vitest run ...` | fireEvent.change inputs |
| RegistrationForm | calls onRegister and saves to localStorage on submit | ✅ PASS | `npx vitest run ...` | mock function callback e validação no localStorage |
| WeeklyReportCard | renders initial state correctly | ✅ PASS | `npx vitest run ...` | Renderiza botão inativo inicial |
| WeeklyReportCard | calls generateWeeklyReport and displays the result | ✅ PASS | `npx vitest run ...` | Mockou geminiService, simulação de success state |
| WeeklyReportCard | handles errors from generateWeeklyReport gracefully | ✅ PASS | `npx vitest run ...` | Mockou rejection do geminiService, error state |
| ThemeSelector | renders available themes | ✅ PASS | `npx vitest run ...` | Mockou themeUtils com dummy themes |
| ThemeSelector | shows locked state for premium themes when user is not premium | ✅ PASS | `npx vitest run ...` | Manipulou isPremium prop, validou aria-disabled |
| ThemeSelector | calls applyTheme and onThemeChange when a theme is selected | ✅ PASS | `npx vitest run ...` | validou chamadas utilitárias encadeadas |
| ThemeSelector | shows blocked message if applyTheme fails | ✅ PASS | `npx vitest run ...` | Validação de failure do applyTheme (assumindo restrição no utils) |
