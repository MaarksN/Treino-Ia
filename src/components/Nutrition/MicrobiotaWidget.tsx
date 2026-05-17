import React from 'react';
import { estimateMicrobiotaHealth } from '../../services/nutrition/microbiotaEstimator';

interface MicrobiotaWidgetProps {
  dailyFiberGrams: number;
  calories: number;
}

export const MicrobiotaWidget: React.FC<MicrobiotaWidgetProps> = ({ dailyFiberGrams, calories }) => {
  const insight = estimateMicrobiotaHealth(dailyFiberGrams, calories);

  return (
    <div className="p-4 border rounded shadow-sm bg-white mt-4" data-testid="microbiota-widget">
      <h3 className="text-lg font-bold mb-2">Microbiota e Fibras (Educacional)</h3>
      <p className="text-sm text-gray-700">{insight.message}</p>
      {insight.status !== 'unknown' && (
        <div className="mt-2 text-xs text-gray-500">
          <p>Ingestão atual: {dailyFiberGrams}g</p>
          <p>Recomendado: {Math.round(insight.recommendedFibersGrams)}g (14g a cada 1000kcal)</p>
        </div>
      )}
      <div className="mt-2 text-xs italic text-gray-400">
        Nota: Estas são estimativas educacionais e não substituem diagnóstico médico.
      </div>
    </div>
  );
};
