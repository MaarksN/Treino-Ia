import { useEffect, useState } from 'react';
import {
  isHighContrastEnabled,
  restoreHighContrastFromStorage,
  toggleHighContrast,
} from '../../services/accessibility/highContrastModeService';

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
    <article
      className="rounded-[28px] border-2 border-brand-light/20 bg-brand-gray p-6"
      aria-labelledby="high-contrast-title"
    >
      <h3 id="high-contrast-title" className="font-display text-3xl uppercase text-brand-light">
        Alto contraste
      </h3>
      <p className="mt-1 font-mono text-xs text-brand-muted">
        Ative o modo de alto contraste para melhorar a visibilidade de textos e elementos.
      </p>

      <div className="mt-4 flex items-center gap-4">
        <button
          type="button"
          onClick={handleToggle}
          role="switch"
          aria-checked={enabled}
          aria-label={`Modo alto contraste: ${enabled ? 'ativado' : 'desativado'}`}
          className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-neon focus:ring-offset-2 focus:ring-offset-brand-dark ${
            enabled
              ? 'border-brand-neon bg-brand-neon'
              : 'border-brand-light/30 bg-brand-dark'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-brand-light shadow-lg transition-transform duration-200 ${
              enabled ? 'translate-x-6' : 'translate-x-0.5'
            } mt-[2px]`}
          />
        </button>
        <span className="font-mono text-sm text-brand-light">
          {enabled ? '🌓 Alto contraste ativado' : '🌑 Contraste padrão'}
        </span>
      </div>

      {enabled && (
        <div className="mt-4 rounded-xl border border-brand-neon/30 bg-brand-neon/10 p-3" role="status">
          <p className="font-mono text-xs text-brand-neon">
            Modo alto contraste ativo. As cores foram ajustadas para máxima legibilidade.
            Desative a qualquer momento usando o botão acima.
          </p>
        </div>
      )}

      <p className="mt-3 font-mono text-[10px] text-brand-muted">
        O alto contraste altera as cores do tema para fundo preto com texto branco e amarelo.
        Preferências são salvas localmente no seu navegador.
      </p>
    </article>
  );
}
