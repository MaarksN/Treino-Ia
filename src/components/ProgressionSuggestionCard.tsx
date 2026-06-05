import React from 'react';
import type { ProgressionSuggestion, ProgressionAction } from '../rules/progressionRules';

export type ProgressionSuggestionCardProps = {
  suggestion: ProgressionSuggestion;
  onAccept: () => void;
  onDismiss: () => void;
};

const ACTION_CONFIG: Record<
  ProgressionAction,
  {
    icon: string;
    label: string;
    accentClass: string;
    borderClass: string;
    bgClass: string;
  }
> = {
  increase: {
    icon: '↑',
    label: 'Aumentar carga',
    accentClass: 'text-brand-neon',
    borderClass: 'border-brand-neon/30',
    bgClass: 'bg-brand-neon/10',
  },
  maintain: {
    icon: '=',
    label: 'Manter carga',
    accentClass: 'text-white',
    borderClass: 'border-white/20',
    bgClass: 'bg-white/5',
  },
  decrease: {
    icon: '↓',
    label: 'Reduzir carga',
    accentClass: 'text-amber-400',
    borderClass: 'border-amber-400/30',
    bgClass: 'bg-amber-400/10',
  },
  deload: {
    icon: '↓↓',
    label: 'Deload',
    accentClass: 'text-amber-400',
    borderClass: 'border-amber-400/30',
    bgClass: 'bg-amber-400/10',
  },
  insufficient_data: {
    icon: '?',
    label: 'Dados insuficientes',
    accentClass: 'text-brand-muted',
    borderClass: 'border-white/10',
    bgClass: 'bg-white/5',
  },
};

const CONFIDENCE_LABELS: Record<string, string> = {
  low: 'Confiança baixa',
  medium: 'Confiança média',
  high: 'Confiança alta',
};

function shouldShowCard(suggestion: ProgressionSuggestion): boolean {
  if (suggestion.action === 'insufficient_data') return false;
  if (suggestion.suggestedLoad == null) return false;
  if (
    suggestion.action === 'maintain' &&
    suggestion.previousLoad === suggestion.suggestedLoad &&
    suggestion.confidence === 'low'
  ) {
    return false;
  }
  return true;
}

export function ProgressionSuggestionCard({
  suggestion,
  onAccept,
  onDismiss,
}: ProgressionSuggestionCardProps) {
  if (!shouldShowCard(suggestion)) return null;

  const config = ACTION_CONFIG[suggestion.action];
  const delta = suggestion.delta;
  const deltaText = delta != null && delta !== 0 ? `${delta > 0 ? '+' : ''}${delta}kg` : null;

  return (
    <div
      data-testid="progression-suggestion-card"
      className={`mb-6 p-4 ${config.bgClass} border-2 ${config.borderClass} transition-all duration-300`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xl font-black ${config.accentClass}`} aria-hidden="true">
          {config.icon}
        </span>
        <span className="text-xs text-brand-muted uppercase tracking-widest font-bold">
          Sugestão inteligente
        </span>
        {suggestion.confidence && (
          <span className="ml-auto text-[10px] text-brand-muted/70 uppercase tracking-wider">
            {CONFIDENCE_LABELS[suggestion.confidence] || suggestion.confidence}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-3 mb-2">
        {suggestion.previousLoad != null && (
          <span className="text-sm text-brand-muted line-through">{suggestion.previousLoad}kg</span>
        )}
        {suggestion.suggestedLoad != null && (
          <span className={`text-2xl font-black ${config.accentClass}`}>
            {suggestion.suggestedLoad}kg
          </span>
        )}
        {deltaText && (
          <span className={`text-sm font-bold ${config.accentClass}`}>({deltaText})</span>
        )}
      </div>

      <p className="text-xs text-brand-light/70 mb-4 leading-relaxed">{suggestion.reason}</p>

      <div className="flex gap-2">
        <button
          data-testid="progression-accept-btn"
          onClick={onAccept}
          className="flex-1 py-2.5 px-4 bg-brand-neon text-brand-dark text-xs font-black uppercase tracking-widest hover:bg-brand-neon-hover transition-colors"
        >
          Aceitar
        </button>
        <button
          data-testid="progression-dismiss-btn"
          onClick={onDismiss}
          className="flex-1 py-2.5 px-4 bg-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/15 transition-colors"
        >
          Manter Atual
        </button>
      </div>
    </div>
  );
}
