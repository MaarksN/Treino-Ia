import { useState } from 'react';
import {
  type AdaptiveProtocolId,
  getAllProtocols,
  getSelectedProtocols,
  PCD_DISCLAIMER,
  saveSelectedProtocols,
} from '../../services/accessibility/adaptiveProtocolsService';
import { InlineNotice } from '../ui/InlineNotice';

export function AdaptiveProtocolsPanel() {
  const [selected, setSelected] = useState<AdaptiveProtocolId[]>(() => getSelectedProtocols());
  const [expandedId, setExpandedId] = useState<AdaptiveProtocolId | null>(null);
  const protocols = getAllProtocols();

  const toggleSelection = (id: AdaptiveProtocolId) => {
    const next = selected.includes(id)
      ? selected.filter(s => s !== id)
      : [...selected, id];
    const saved = saveSelectedProtocols(next);
    setSelected(saved);
  };

  return (
    <article
      className="rounded-[28px] border-2 border-brand-light/20 bg-brand-gray p-6"
      aria-labelledby="adaptive-protocols-title"
    >
      <h3 id="adaptive-protocols-title" className="font-display text-3xl uppercase text-brand-light">
        Protocolos adaptativos
      </h3>
      <p className="mt-1 font-mono text-xs text-brand-muted">
        Sugestões de treino para pessoas com deficiência ou limitações funcionais.
      </p>

      <div className="mt-4 grid gap-3">
        {protocols.map(protocol => {
          const isSelected = selected.includes(protocol.id);
          const isExpanded = expandedId === protocol.id;

          return (
            <div
              key={protocol.id}
              className={`rounded-xl border-2 transition-colors ${
                isSelected
                  ? 'border-brand-neon bg-brand-neon/5'
                  : 'border-brand-light/10 bg-brand-dark/30'
              }`}
            >
              <div className="flex items-center gap-3 p-3">
                <button
                  type="button"
                  onClick={() => toggleSelection(protocol.id)}
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-neon ${
                    isSelected
                      ? 'border-brand-neon bg-brand-neon text-brand-dark'
                      : 'border-brand-light/30 text-transparent'
                  }`}
                  aria-label={`${isSelected ? 'Desmarcar' : 'Selecionar'} protocolo ${protocol.title}`}
                  aria-pressed={isSelected}
                >
                  {isSelected && '✓'}
                </button>

                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : protocol.id)}
                  className="flex-1 text-left"
                  aria-expanded={isExpanded}
                >
                  <span className="font-mono text-sm font-bold text-brand-light">
                    {protocol.title}
                  </span>
                  <span className="ml-2 font-mono text-xs text-brand-muted">
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </button>
              </div>

              {isExpanded && (
                <div className="border-t border-brand-light/10 px-3 pb-3 pt-2">
                  <p className="font-mono text-xs text-brand-light/80">{protocol.description}</p>

                  <div className="mt-2">
                    <p className="font-mono text-[10px] font-bold uppercase text-brand-neon">Recomendações</p>
                    <ul className="mt-1 space-y-1">
                      {protocol.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 font-mono text-xs text-brand-muted">
                          <span className="mt-0.5 text-brand-neon">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-2">
                    <p className="font-mono text-[10px] font-bold uppercase text-brand-magenta">Cuidados</p>
                    <ul className="mt-1 space-y-1">
                      {protocol.contraindications.map((ci, i) => (
                        <li key={i} className="flex items-start gap-2 font-mono text-xs text-brand-muted">
                          <span className="mt-0.5 text-brand-magenta">⚠</span>
                          <span>{ci}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="mt-2 rounded-lg bg-brand-magenta/10 p-2 font-mono text-[10px] text-brand-magenta">
                    ⚕️ {protocol.disclaimer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p className="mt-3 font-mono text-xs text-brand-neon" role="status">
          {selected.length} protocolo{selected.length !== 1 ? 's' : ''} selecionado{selected.length !== 1 ? 's' : ''}.
        </p>
      )}

      <InlineNotice type="warning" title="Orientação profissional obrigatória">
        {PCD_DISCLAIMER}
      </InlineNotice>
    </article>
  );
}
