import type { ReactNode } from 'react';

interface AdaptiveSelectionCardProps {
  title: string;
  selectionNoun: string;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelection: () => void;
  onToggleExpanded: () => void;
  children?: ReactNode;
}

export function AdaptiveSelectionCard({
  title,
  selectionNoun,
  isSelected,
  isExpanded,
  onToggleSelection,
  onToggleExpanded,
  children,
}: AdaptiveSelectionCardProps) {
  return (
    <div
      className={`rounded-xl border-2 transition-colors ${
        isSelected ? 'border-brand-neon bg-brand-neon/5' : 'border-brand-light/10 bg-brand-dark/30'
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={onToggleSelection}
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-neon ${
            isSelected
              ? 'border-brand-neon bg-brand-neon text-brand-dark'
              : 'border-brand-light/30 text-transparent'
          }`}
          aria-label={`${isSelected ? 'Desmarcar' : 'Selecionar'} ${selectionNoun} ${title}`}
          aria-pressed={isSelected}
        >
          {isSelected && '✓'}
        </button>

        <button
          type="button"
          onClick={onToggleExpanded}
          className="flex-1 text-left"
          aria-expanded={isExpanded}
        >
          <span className="font-mono text-sm font-bold text-brand-light">{title}</span>
          <span className="ml-2 font-mono text-xs text-brand-muted">{isExpanded ? '▲' : '▼'}</span>
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-brand-light/10 px-3 pb-3 pt-2">{children}</div>
      )}
    </div>
  );
}

interface AdaptiveBulletListProps {
  items: string[];
  marker?: string;
  markerClassName?: string;
}

export function AdaptiveBulletList({
  items,
  marker = '•',
  markerClassName = 'text-brand-neon',
}: AdaptiveBulletListProps) {
  return (
    <ul className="mt-1 space-y-1">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2 font-mono text-xs text-brand-muted">
          <span className={`mt-0.5 ${markerClassName}`}>{marker}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
