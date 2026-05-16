import React, { useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { APP_THEMES, applyTheme, loadThemeId } from '../utils/themeUtils';
import { PremiumFeatureGate } from './PremiumPaywall';

interface Props {
  isPremium?: boolean;
  onThemeChange?: (themeId: string) => void;
}

export function ThemeSelector({ isPremium = false, onThemeChange }: Props) {
  const [active, setActive] = useState(loadThemeId);

  const handleSelect = (themeId: string, isThemePremium: boolean) => {
    if (isThemePremium && !isPremium) return;
    applyTheme(themeId);
    setActive(themeId);
    onThemeChange?.(themeId);
  };

  return (
    <div className="bg-brand-gray border border-white/10 rounded-2xl p-5">
      <h3 className="text-white font-bold text-lg mb-2">Temas</h3>
      <p className="text-brand-muted text-sm mb-4">Personaliza toda a paleta de cores do app.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {APP_THEMES.map(theme => {
          const locked = theme.isPremium && !isPremium;
          const buttonContent = (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleSelect(theme.id, theme.isPremium)}
              className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${active === theme.id
                  ? 'border-brand-neon bg-brand-neon/5'
                  : 'border-white/10 bg-brand-dark hover:border-white/20'
                } ${locked ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div
                className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xl border border-white/10"
                style={{
                  background: theme.vars['--color-brand-dark'],
                  borderColor: `${theme.vars['--color-brand-neon']}66`,
                }}
              >
                {theme.emoji}
              </div>

              <div className="min-w-0 pr-6">
                <p className="text-white font-bold text-sm">{theme.name}</p>
                <p className="text-brand-muted text-xs leading-tight">{theme.description}</p>
              </div>

              {theme.isPremium && (
                <div className="absolute top-2 right-2">
                  <Lock size={12} className="text-brand-muted" />
                </div>
              )}

              {active === theme.id && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-neon flex items-center justify-center text-brand-dark">
                  <Check size={12} strokeWidth={4} />
                </div>
              )}
            </button>
          );

          if (theme.isPremium) {
            return (
              <PremiumFeatureGate
                key={theme.id}
                feature="premium_theme"
                fallback={buttonContent}
              >
                {React.cloneElement(buttonContent as React.ReactElement<any>, {
                  className: (buttonContent as React.ReactElement<any>).props.className.replace('opacity-60 cursor-not-allowed', ''),
                  onClick: () => handleSelect(theme.id, false), // Bypass the internal premium check since gate handles it
                  children: React.Children.map((buttonContent as React.ReactElement<any>).props.children, child => {
                    const c = child as React.ReactElement<any>;
                    if (c?.type === 'div' && c.props.className === 'absolute top-2 right-2') {
                      return (
                        <div className="absolute top-2 right-2">
                          <span className="text-[10px] text-brand-neon font-bold">PRO</span>
                        </div>
                      );
                    }
                    return child;
                  })
                })}
              </PremiumFeatureGate>
            );
          }

          return buttonContent;
        })}
      </div>
    </div>
  );
}
