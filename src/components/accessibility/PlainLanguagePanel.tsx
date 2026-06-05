import { useState } from 'react';
import {
  getGlossary,
  isPlainLanguageEnabled,
  togglePlainLanguage,
} from '../../services/accessibility/plainLanguageService';
import { AccessibilityPanelShell } from './AccessibilityPanelShell';
import { AccessibilitySwitch } from './AccessibilitySwitch';

export function PlainLanguagePanel() {
  const [enabled, setEnabled] = useState(() => isPlainLanguageEnabled());
  const [searchTerm, setSearchTerm] = useState('');
  const glossary = getGlossary();

  const handleToggle = () => {
    const next = togglePlainLanguage();
    setEnabled(next);
  };

  const filtered = searchTerm.trim()
    ? glossary.filter(
        (entry) =>
          entry.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.plain.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : glossary;

  return (
    <AccessibilityPanelShell
      titleId="plain-language-title"
      title="Linguagem simples"
      description="Ative para ver explicações mais fáceis dos termos técnicos de treino."
      footer="O glossário simplifica termos técnicos de treino. Conteúdo médico não é alterado para evitar interpretações imprecisas. Preferências são salvas localmente."
    >
      <AccessibilitySwitch
        checked={enabled}
        onToggle={handleToggle}
        ariaLabel={`Linguagem simples: ${enabled ? 'ativada' : 'desativada'}`}
        enabledLabel="📖 Linguagem simples ativada"
        disabledLabel="📚 Linguagem técnica"
      />

      <div className="mt-4">
        <label
          htmlFor="glossary-search"
          className="block font-mono text-xs uppercase text-brand-muted"
        >
          Buscar termo
        </label>
        <input
          id="glossary-search"
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Ex: RPE, deload, platô..."
          className="mt-1 w-full rounded-xl border border-brand-light/10 bg-brand-dark px-3 py-2 font-mono text-sm text-brand-light outline-none focus:border-brand-neon"
        />
      </div>

      <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="font-mono text-xs text-brand-muted">Nenhum termo encontrado.</p>
        ) : (
          filtered.map((entry) => (
            <div
              key={entry.term}
              className="rounded-xl border border-brand-light/10 bg-brand-dark/30 px-3 py-2"
            >
              <span className="font-mono text-sm font-bold text-brand-neon">{entry.term}</span>
              <p className="mt-1 font-mono text-xs text-brand-light/80">
                {enabled ? entry.plain : entry.technical}
              </p>
            </div>
          ))
        )}
      </div>
    </AccessibilityPanelShell>
  );
}
