import { useState } from 'react';
import {
  applyThemeVariant,
  getCurrentThemeInfo,
  getSelectedVariant,
  getThemePreviewOptions,
  PREMIUM_THEME_DISCLAIMER,
  type ThemeVariant,
} from '../../services/premium/themeCustomizationService';
import { InlineNotice } from '../ui/InlineNotice';

const variantEmojis: Record<ThemeVariant, string> = {
  neon: '🤖',
  high_contrast: '🌓',
  minimal: '⬜',
  performance_dark: '🌑',
};

export function ThemeCustomizationPanel() {
  const options = getThemePreviewOptions();
  const [selected, setSelected] = useState<ThemeVariant | null>(() => getSelectedVariant());
  const [feedback, setFeedback] = useState('');
  const currentTheme = getCurrentThemeInfo();

  const handleApply = (variant: ThemeVariant) => {
    const result = applyThemeVariant(variant);
    setSelected(variant);
    setFeedback(result.reason);
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <article
      className="rounded-[28px] border-2 border-brand-light/20 bg-brand-gray p-6"
      aria-labelledby="theme-customization-title"
    >
      <h3 id="theme-customization-title" className="font-display text-3xl uppercase text-brand-light">
        Temas premium
      </h3>
      <p className="mt-1 font-mono text-xs text-brand-muted">
        Preview local de variações visuais. Tema atual: <span className="text-brand-neon">{currentTheme.name}</span>.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {options.map(option => {
          const isActive = selected === option.variant;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleApply(option.variant)}
              className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-brand-neon ${
                isActive
                  ? 'border-brand-neon bg-brand-neon/5'
                  : 'border-brand-light/10 bg-brand-dark/30 hover:border-brand-light/20'
              }`}
            >
              <span className="text-2xl">{variantEmojis[option.variant]}</span>
              <div className="min-w-0">
                <span className="block font-mono text-sm font-bold text-brand-light">
                  {option.name}
                  {option.isPremium && (
                    <span className="ml-2 text-[10px] text-brand-magenta">PREVIEW</span>
                  )}
                </span>
                <span className="block font-mono text-[10px] text-brand-muted">{option.description}</span>
              </div>
              {isActive && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-brand-neon text-xs font-bold text-brand-dark">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {feedback && (
        <p className="mt-3 font-mono text-xs text-brand-neon" role="status" aria-live="polite">
          {feedback}
        </p>
      )}

      <InlineNotice type="info" title="Preview local">
        {PREMIUM_THEME_DISCLAIMER}
      </InlineNotice>
    </article>
  );
}
