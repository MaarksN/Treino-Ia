export type Micronutrient = {
  symbol: string;
  name: string;
  category: 'vitamina' | 'mineral' | 'outro';
  description: string;
};

export const PERIODIC_TABLE_EMPTY_MESSAGE = 'Selecione um micronutriente para ver mais detalhes educacionais.';

export const MICRONUTRIENTS: Micronutrient[] = [
  { symbol: 'Fe', name: 'Ferro', category: 'mineral', description: 'Transporte de oxigênio e metabolismo energético.' },
  { symbol: 'Ca', name: 'Cálcio', category: 'mineral', description: 'Saúde óssea e contração muscular.' },
  { symbol: 'Mg', name: 'Magnésio', category: 'mineral', description: 'Função muscular, nervosa e produção de energia.' },
  { symbol: 'Zn', name: 'Zinco', category: 'mineral', description: 'Sistema imunológico e cicatrização.' },
  { symbol: 'C', name: 'Vitamina C', category: 'vitamina', description: 'Antioxidante, imunidade e absorção de ferro.' },
  { symbol: 'D', name: 'Vitamina D', category: 'vitamina', description: 'Absorção de cálcio e função imunológica.' },
  { symbol: 'B12', name: 'Vitamina B12', category: 'vitamina', description: 'Formação de células sanguíneas e função neurológica.' },
  { symbol: 'K', name: 'Potássio', category: 'mineral', description: 'Equilíbrio hídrico e contração muscular.' },
];

export function findMicronutrient(symbol: string): Micronutrient | undefined {
  return MICRONUTRIENTS.find(nutrient => nutrient.symbol === symbol);
}
