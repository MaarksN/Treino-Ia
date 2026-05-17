import React, { useState } from 'react';

type Micronutrient = {
  symbol: string;
  name: string;
  category: 'vitamina' | 'mineral' | 'outro';
  description: string;
};

const MICRONUTRIENTS: Micronutrient[] = [
  { symbol: 'Fe', name: 'Ferro', category: 'mineral', description: 'Transporte de oxigênio e metabolismo energético.' },
  { symbol: 'Ca', name: 'Cálcio', category: 'mineral', description: 'Saúde óssea e contração muscular.' },
  { symbol: 'Mg', name: 'Magnésio', category: 'mineral', description: 'Função muscular, nervosa e produção de energia.' },
  { symbol: 'Zn', name: 'Zinco', category: 'mineral', description: 'Sistema imunológico e cicatrização.' },
  { symbol: 'C', name: 'Vitamina C', category: 'vitamina', description: 'Antioxidante, imunidade e absorção de ferro.' },
  { symbol: 'D', name: 'Vitamina D', category: 'vitamina', description: 'Absorção de cálcio e função imunológica.' },
  { symbol: 'B12', name: 'Vitamina B12', category: 'vitamina', description: 'Formação de células sanguíneas e função neurológica.' },
  { symbol: 'K', name: 'Potássio', category: 'mineral', description: 'Equilíbrio hídrico e contração muscular.' },
];

export const PeriodicTable: React.FC = () => {
  const [selected, setSelected] = useState<Micronutrient | null>(null);

  return (
    <div className="p-4 border rounded shadow-sm bg-white mt-4" data-testid="periodic-table">
      <h3 className="text-lg font-bold mb-4">Tabela Periódica Nutricional (Item 90)</h3>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {MICRONUTRIENTS.map(nutri => (
          <button
            key={nutri.symbol}
            onClick={() => setSelected(nutri)}
            className={`p-3 border rounded text-center transition-colors
              ${nutri.category === 'mineral' ? 'bg-blue-50 hover:bg-blue-100 border-blue-200' : ''}
              ${nutri.category === 'vitamina' ? 'bg-green-50 hover:bg-green-100 border-green-200' : ''}
              ${selected?.symbol === nutri.symbol ? 'ring-2 ring-brand-neon' : ''}
            `}
          >
            <div className="font-bold text-lg">{nutri.symbol}</div>
            <div className="text-xs truncate">{nutri.name}</div>
          </button>
        ))}
      </div>

      {selected ? (
        <div className="p-3 border rounded bg-gray-50">
          <h4 className="font-bold text-md">{selected.name} ({selected.symbol})</h4>
          <p className="text-sm text-gray-500 capitalize">{selected.category}</p>
          <p className="text-sm mt-2">{selected.description}</p>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">Selecione um micronutriente para ver mais detalhes educacionais.</p>
      )}
    </div>
  );
};
