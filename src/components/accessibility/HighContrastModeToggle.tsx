import { useEffect, useState } from 'react';
import {
  isHighContrastEnabled,
  restoreHighContrastFromStorage,
  toggleHighContrast,
} from '../../services/accessibility/highContrastModeService';
import { AccessibilityPanelShell } from './AccessibilityPanelShell';
import { AccessibilitySwitch } from './AccessibilitySwitch';

export function HighContrastModeToggle() {
  const [enabled, setEnabled] = useState(() => {
    restoreHighContrastFromStorage();
    return isHighContrastEnabled();
  });

  useEffect(() => {
    restoreHighContrastFromStorage();
  }, []);

  const handleToggle = () => {
    const next = toggleHighContrast();
    setEnabled(next);
  };

  return (
    <AccessibilityPanelShell
      titleId="high-contrast-title"
      title="Alto contraste"
      description="Ative o modo de alto contraste para melhorar a visibilidade de textos e elementos."
      footer="O alto contraste altera as cores do tema para fundo preto com texto branco e amarelo. Preferências são salvas localmente no seu navegador."
    >
      <AccessibilitySwitch
        checked={enabled}
        onToggle={handleToggle}
        ariaLabel={`Modo alto contraste: ${enabled ? 'ativado' : 'desativado'}`}
        enabledLabel="🌓 Alto contraste ativado"
        disabledLabel="🌑 Contraste padrão"
      />

      {enabled && (
        <div
          className="mt-4 rounded-xl border border-brand-neon/30 bg-brand-neon/10 p-3"
          role="status"
        >
          <p className="font-mono text-xs text-brand-neon">
            Modo alto contraste ativo. As cores foram ajustadas para máxima legibilidade. Desative a
            qualquer momento usando o botão acima.
          </p>
        </div>
      )}
    </AccessibilityPanelShell>
  );
}
