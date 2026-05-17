import { useState } from 'react';
import {
  type AdaptivePathwayId,
  getAllPathways,
  getSelectedPathways,
  saveSelectedPathways,
} from '../../services/accessibility/adaptivePathwaysService';
import { InlineNotice } from '../ui/InlineNotice';

export function AdaptivePathwaysPanel() {
  const [selected, setSelected] = useState<AdaptivePathwayId[]>(() => getSelectedPathways());
  const [expandedId, setExpandedId] = useState<AdaptivePathwayId | null>(null);
  const pathways = getAllPathways();

  const toggleSelection = (id: AdaptivePathwayId) => {
    const next = selected.includes(id)
      ? selected.filter(s => s !== id)
      : [...selected, id];
    const saved = saveSelectedPathways(next);
    setSelected(saved);
  };

  return (
    <article
      className="rounded-[28px] border-2 border-brand-light/20 bg-brand-gray p-6"
      aria-labelledby="adaptive-pathways-title"
    >
      <h3 id="adaptive-pathways-title" className="font-display text-3xl uppercase text-brand-light">
        Trilhas adaptativas
      </h3>
      <p className="mt-1 font-mono text-xs text-brand-muted">
        Selecione trilhas que se aplicam ao seu perfil. As sugestões abaixo são educacionais.
      </p>

      {pathways.length === 0 ? (
        <p className="mt-4 font-mono text-sm text-brand-muted">Nenhuma trilha disponível.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {pathways.map(pathway => {
            const isSelected = selected.includes(pathway.id);
            const isExpanded = expandedId === pathway.id;

            return (
              <div
                key={pathway.id}
                className={`rounded-xl border-2 transition-colors ${
                  isSelected
                    ? 'border-brand-neon bg-brand-neon/5'
                    : 'border-brand-light/10 bg-brand-dark/30'
                }`}
              >
                <div className="flex items-center gap-3 p-3">
                  <button
                    type="button"
                    onClick={() => toggleSelection(pathway.id)}
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-neon ${
                      isSelected
                        ? 'border-brand-neon bg-brand-neon text-brand-dark'
                        : 'border-brand-light/30 text-transparent'
                    }`}
                    aria-label={`${isSelected ? 'Desmarcar' : 'Selecionar'} trilha ${pathway.title}`}
                    aria-pressed={isSelected}
                  >
                    {isSelected && '✓'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : pathway.id)}
                    className="flex-1 text-left"
                    aria-expanded={isExpanded}
                  >
                    <span className="font-mono text-sm font-bold text-brand-light">
                      {pathway.title}
                    </span>
                    <span className="ml-2 font-mono text-xs text-brand-muted">
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-brand-light/10 px-3 pb-3 pt-2">
                    <p className="font-mono text-xs text-brand-light/80">{pathway.description}</p>
                    <ul className="mt-2 space-y-1">
                      {pathway.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 font-mono text-xs text-brand-muted">
                          <span className="mt-0.5 text-brand-neon">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 rounded-lg bg-brand-magenta/10 p-2 font-mono text-[10px] text-brand-magenta">
                      ⚕️ {pathway.disclaimer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selected.length > 0 && (
        <p className="mt-3 font-mono text-xs text-brand-neon" role="status">
          {selected.length} trilha{selected.length !== 1 ? 's' : ''} selecionada{selected.length !== 1 ? 's' : ''}.
        </p>
      )}

      <InlineNotice type="warning" title="Orientação profissional">
        Trilhas adaptativas são sugestões educacionais. Não substituem avaliação e acompanhamento de
        profissionais de saúde e educação física.
      </InlineNotice>
    </article>
  );
}
