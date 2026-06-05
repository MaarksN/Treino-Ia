import { useState } from 'react';
import {
  type AdaptivePathwayId,
  getAllPathways,
  getSelectedPathways,
  saveSelectedPathways,
} from '../../services/accessibility/adaptivePathwaysService';
import { InlineNotice } from '../ui/InlineNotice';
import { AccessibilityPanelShell } from './AccessibilityPanelShell';
import { AdaptiveBulletList, AdaptiveSelectionCard } from './AdaptiveSelectionCard';

export function AdaptivePathwaysPanel() {
  const [selected, setSelected] = useState<AdaptivePathwayId[]>(() => getSelectedPathways());
  const [expandedId, setExpandedId] = useState<AdaptivePathwayId | null>(null);
  const pathways = getAllPathways();

  const toggleSelection = (id: AdaptivePathwayId) => {
    const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
    const saved = saveSelectedPathways(next);
    setSelected(saved);
  };

  return (
    <AccessibilityPanelShell
      titleId="adaptive-pathways-title"
      title="Trilhas adaptativas"
      description="Selecione trilhas que se aplicam ao seu perfil. As sugestões abaixo são educacionais."
    >
      {pathways.length === 0 ? (
        <p className="mt-4 font-mono text-sm text-brand-muted">Nenhuma trilha disponível.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {pathways.map((pathway) => {
            const isSelected = selected.includes(pathway.id);
            const isExpanded = expandedId === pathway.id;

            return (
              <AdaptiveSelectionCard
                key={pathway.id}
                title={pathway.title}
                selectionNoun="trilha"
                isSelected={isSelected}
                isExpanded={isExpanded}
                onToggleSelection={() => toggleSelection(pathway.id)}
                onToggleExpanded={() => setExpandedId(isExpanded ? null : pathway.id)}
              >
                <p className="font-mono text-xs text-brand-light/80">{pathway.description}</p>
                <div className="mt-2">
                  <AdaptiveBulletList items={pathway.tips} />
                </div>
                <p className="mt-2 rounded-lg bg-brand-magenta/10 p-2 font-mono text-[10px] text-brand-magenta">
                  ⚕️ {pathway.disclaimer}
                </p>
              </AdaptiveSelectionCard>
            );
          })}
        </div>
      )}

      {selected.length > 0 && (
        <p className="mt-3 font-mono text-xs text-brand-neon" role="status">
          {selected.length} trilha{selected.length !== 1 ? 's' : ''} selecionada
          {selected.length !== 1 ? 's' : ''}.
        </p>
      )}

      <InlineNotice type="warning" title="Orientação profissional">
        Trilhas adaptativas são sugestões educacionais. Não substituem avaliação e acompanhamento de
        profissionais de saúde e educação física.
      </InlineNotice>
    </AccessibilityPanelShell>
  );
}
