import React, { useState } from 'react';
import {
  MICRONUTRIENTS,
  PERIODIC_TABLE_EMPTY_MESSAGE,
  type Micronutrient,
} from './PeriodicTable.data';
import { FlaskConical } from 'lucide-react';

export const PeriodicTable: React.FC = () => {
  const [selected, setSelected] = useState<Micronutrient | null>(null);

  return (
    <div className="rounded-[24px] border-2 border-brand-light/10 bg-brand-dark p-5 mt-6" data-testid="periodic-table">
      <div className="flex items-center gap-3 mb-6">
        <FlaskConical className="h-5 w-5 text-brand-neon" />
        <h3 className="font-display text-2xl uppercase text-brand-light">Tabela Periódica Nutricional</h3>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 mb-6">
        {MICRONUTRIENTS.map(nutri => (
          <button
            key={nutri.symbol}
            onClick={() => setSelected(nutri)}
            className={`aspect-square p-2 border-2 rounded-[16px] text-center transition-all duration-200
              ${nutri.category === 'mineral' ? 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-400' : ''}
              ${nutri.category === 'vitamina' ? 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-400' : ''}
              ${selected?.symbol === nutri.symbol ? 'ring-2 ring-brand-neon ring-offset-2 ring-offset-brand-dark scale-105 shadow-lg' : 'hover:scale-105'}
            `}
          >
            <div className="font-display text-2xl mb-1">{nutri.symbol}</div>
            <div className="font-mono text-[9px] uppercase tracking-widest truncate opacity-80">{nutri.name}</div>
          </button>
        ))}
      </div>

      {selected ? (
        <div className="border border-brand-light/10 bg-brand-gray p-5 rounded-[20px] animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-display text-3xl uppercase text-brand-light">{selected.name} ({selected.symbol})</h4>
            <span className={`px-2 py-1 rounded-full font-mono text-[10px] uppercase tracking-widest border ${
              selected.category === 'mineral' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 'border-green-500/30 text-green-400 bg-green-500/10'
            }`}>
              {selected.category}
            </span>
          </div>
          <p className="font-mono text-sm leading-6 text-brand-light/80 mt-3">{selected.description}</p>
        </div>
      ) : (
        <div className="border border-brand-light/5 bg-brand-dark/50 border-dashed p-6 text-center rounded-[20px]">
          <p className="font-mono text-sm text-brand-muted">{PERIODIC_TABLE_EMPTY_MESSAGE}</p>
        </div>
      )}
    </div>
  );
};
