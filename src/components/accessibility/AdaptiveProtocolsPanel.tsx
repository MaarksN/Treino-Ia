import { useState } from 'react';
import {
  type AdaptiveProtocolId,
  getAllProtocols,
  getSelectedProtocols,
  PCD_DISCLAIMER,
  saveSelectedProtocols,
} from '../../services/accessibility/adaptiveProtocolsService';
import { InlineNotice } from '../ui/InlineNotice';
import { AccessibilityPanelShell } from './AccessibilityPanelShell';
import { AdaptiveBulletList, AdaptiveSelectionCard } from './AdaptiveSelectionCard';

export function AdaptiveProtocolsPanel() {
  const [selected, setSelected] = useState<AdaptiveProtocolId[]>(() => getSelectedProtocols());
  const [expandedId, setExpandedId] = useState<AdaptiveProtocolId | null>(null);
  const protocols = getAllProtocols();

  const toggleSelection = (id: AdaptiveProtocolId) => {
    const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
    const saved = saveSelectedProtocols(next);
    setSelected(saved);
  };

  return (
    <AccessibilityPanelShell
      titleId="adaptive-protocols-title"
      title="Protocolos adaptativos"
      description="Sugestões de treino para pessoas com deficiência ou limitações funcionais."
    >
      <div className="mt-4 grid gap-3">
        {protocols.map((protocol) => {
          const isSelected = selected.includes(protocol.id);
          const isExpanded = expandedId === protocol.id;

          return (
            <AdaptiveSelectionCard
              key={protocol.id}
              title={protocol.title}
              selectionNoun="protocolo"
              isSelected={isSelected}
              isExpanded={isExpanded}
              onToggleSelection={() => toggleSelection(protocol.id)}
              onToggleExpanded={() => setExpandedId(isExpanded ? null : protocol.id)}
            >
              <p className="font-mono text-xs text-brand-light/80">{protocol.description}</p>

              <div className="mt-2">
                <p className="font-mono text-[10px] font-bold uppercase text-brand-neon">
                  Recomendações
                </p>
                <AdaptiveBulletList items={protocol.recommendations} />
              </div>

              <div className="mt-2">
                <p className="font-mono text-[10px] font-bold uppercase text-brand-magenta">
                  Cuidados
                </p>
                <AdaptiveBulletList
                  items={protocol.contraindications}
                  marker="⚠"
                  markerClassName="text-brand-magenta"
                />
              </div>

              <p className="mt-2 rounded-lg bg-brand-magenta/10 p-2 font-mono text-[10px] text-brand-magenta">
                ⚕️ {protocol.disclaimer}
              </p>
            </AdaptiveSelectionCard>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p className="mt-3 font-mono text-xs text-brand-neon" role="status">
          {selected.length} protocolo{selected.length !== 1 ? 's' : ''} selecionado
          {selected.length !== 1 ? 's' : ''}.
        </p>
      )}

      <InlineNotice type="warning" title="Orientação profissional obrigatória">
        {PCD_DISCLAIMER}
      </InlineNotice>
    </AccessibilityPanelShell>
  );
}
