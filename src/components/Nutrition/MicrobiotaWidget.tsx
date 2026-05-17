import React from 'react';
import { estimateMicrobiotaHealth } from '../../services/nutrition/microbiotaEstimator';
import { InlineNotice } from '../ui/InlineNotice';
import { ActivitySquare } from 'lucide-react';

interface MicrobiotaWidgetProps {
  dailyFiberGrams: number;
  calories: number;
}

export const MicrobiotaWidget: React.FC<MicrobiotaWidgetProps> = ({ dailyFiberGrams, calories }) => {
  const insight = estimateMicrobiotaHealth(dailyFiberGrams, calories);

  return (
    <div className="rounded-[24px] border-2 border-brand-light/10 bg-brand-dark p-5" data-testid="microbiota-widget">
      <div className="flex items-center gap-3 mb-4">
        <ActivitySquare className="h-5 w-5 text-brand-neon" />
        <h3 className="font-display text-2xl uppercase text-brand-light">Microbiota e Fibras</h3>
      </div>

      <p className="font-mono text-sm leading-6 text-brand-light/85 mb-4">{insight.message}</p>

      {insight.status !== 'unknown' && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-4 border border-brand-light/10 bg-brand-gray p-4 rounded-[16px]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">Ingestão atual</p>
            <p className="font-display text-2xl text-brand-light">{Math.round(dailyFiberGrams)}g</p>
          </div>
          <div className="hidden sm:block h-10 w-px bg-brand-light/10"></div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">Recomendado</p>
            <p className="font-display text-2xl text-brand-neon">{Math.round(insight.recommendedFibersGrams)}g <span className="font-mono text-[10px] text-brand-muted">/dia</span></p>
          </div>
        </div>
      )}

      <InlineNotice type="info" title="Educacional">
        Estas estimativas são baseadas na meta de 14g a cada 1000kcal e não substituem diagnóstico médico nutricional.
      </InlineNotice>
    </div>
  );
};
