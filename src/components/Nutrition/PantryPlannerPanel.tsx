import { useState } from 'react';
import { type PantryItemId, getPantryItemLabel, getPantryItems, PANTRY_DISCLAIMER, PANTRY_ITEMS, savePantryItems, suggestMeals } from '../../services/nutrition/pantryPlannerService';
import { InlineNotice } from '../ui/InlineNotice';

export function PantryPlannerPanel() {
  const [pantry, setPantry] = useState<PantryItemId[]>(() => getPantryItems());
  const meals = suggestMeals(pantry);
  const toggle = (id: PantryItemId) => {
    const next = pantry.includes(id) ? pantry.filter(p => p !== id) : [...pantry, id];
    setPantry(savePantryItems(next));
  };
  return (
    <article className="rounded-[28px] border-2 border-brand-light/20 bg-brand-gray p-6" aria-labelledby="pantry-title">
      <h3 id="pantry-title" className="font-display text-3xl uppercase text-brand-light">Despensa inteligente</h3>
      <p className="mt-1 font-mono text-xs text-brand-muted">Marque o que tem em casa e receba sugestões de refeição.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {PANTRY_ITEMS.map(id => (
          <button key={id} type="button" onClick={() => toggle(id)} aria-pressed={pantry.includes(id)}
            className={`rounded-full border-2 px-3 py-1.5 font-mono text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-brand-neon ${pantry.includes(id) ? 'border-brand-neon bg-brand-neon/10 text-brand-neon' : 'border-brand-light/10 text-brand-muted hover:border-brand-light/20'}`}>
            {getPantryItemLabel(id)}
          </button>
        ))}
      </div>
      {pantry.length > 0 && <p className="mt-2 font-mono text-xs text-brand-neon" role="status">{pantry.length} ite{pantry.length !== 1 ? 'ns' : 'm'} na despensa.</p>}
      {meals.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="font-mono text-xs font-bold uppercase text-brand-neon">Refeições possíveis</p>
          {meals.map(meal => (
            <div key={meal.name} className="rounded-xl border border-brand-light/10 bg-brand-dark/30 px-3 py-2">
              <span className="font-mono text-sm font-bold text-brand-light">{meal.name}</span>
              <span className="ml-2 font-mono text-[10px] text-brand-muted">{meal.timing}</span>
              <p className="mt-0.5 font-mono text-[10px] text-brand-muted">{meal.description}</p>
            </div>
          ))}
        </div>
      ) : pantry.length > 0 ? (
        <p className="mt-3 font-mono text-xs text-brand-muted">Nenhuma receita encontrada com os itens selecionados. Adicione mais alimentos.</p>
      ) : null}
      <InlineNotice type="info" title="Sem IoT">{PANTRY_DISCLAIMER}</InlineNotice>
    </article>
  );
}
