import { useState } from 'react';
import {
  getGlossary,
  isPlainLanguageEnabled,
  togglePlainLanguage,
} from '../../services/accessibility/plainLanguageService';

export function PlainLanguagePanel() {
  const [enabled, setEnabled] = useState(() => isPlainLanguageEnabled());
  const [searchTerm, setSearchTerm] = useState('');
  const glossary = getGlossary();

  const handleToggle = () => {
    const next = togglePlainLanguage();
    setEnabled(next);
  };

  const filtered = searchTerm.trim()
    ? glossary.filter(entry =>
        entry.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.plain.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : glossary;

  return (
    <article
      className="rounded-[28px] border-2 border-brand-light/20 bg-brand-gray p-6"
      aria-labelledby="plain-language-title"
    >
      <h3 id="plain-language-title" className="font-display text-3xl uppercase text-brand-light">
        Linguagem simples
      </h3>
      <p className="mt-1 font-mono text-xs text-brand-muted">
        Ative para ver explicações mais fáceis dos termos técnicos de treino.
      </p>

      <div className="mt-4 flex items-center gap-4">
        <button
          type="button"
          onClick={handleToggle}
          role="switch"
          aria-checked={enabled}
          aria-label={`Linguagem simples: ${enabled ? 'ativada' : 'desativada'}`}
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
          {enabled ? '📖 Linguagem simples ativada' : '📚 Linguagem técnica'}
        </span>
      </div>

      <div className="mt-4">
        <label htmlFor="glossary-search" className="block font-mono text-xs uppercase text-brand-muted">
          Buscar termo
        </label>
        <input
          id="glossary-search"
          type="search"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Ex: RPE, deload, platô..."
          className="mt-1 w-full rounded-xl border border-brand-light/10 bg-brand-dark px-3 py-2 font-mono text-sm text-brand-light outline-none focus:border-brand-neon"
        />
      </div>

      <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="font-mono text-xs text-brand-muted">Nenhum termo encontrado.</p>
        ) : (
          filtered.map(entry => (
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

      <p className="mt-3 font-mono text-[10px] text-brand-muted">
        O glossário simplifica termos técnicos de treino. Conteúdo médico não é alterado para
        evitar interpretações imprecisas. Preferências são salvas localmente.
      </p>
    </article>
  );
}
