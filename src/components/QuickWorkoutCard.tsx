import React from 'react';
import { Dumbbell, Target, Wind, Zap } from 'lucide-react';

interface Props {
  onSelect: (type: 'express' | 'bodyweight' | 'equipment' | 'goal', value?: string) => void;
}

const GOALS = ['Hipertrofia', 'Força', 'Emagrecimento', 'Condicionamento'];

export function QuickWorkoutCard({ onSelect }: Props) {
  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
      <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light mb-4">Escolha um modo de treino</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <button type="button" onClick={() => onSelect('express')} className="flex items-center gap-3 p-4 bg-brand-neon/10 border-2 border-brand-neon/30 hover:border-brand-neon transition-all text-left">
          <Zap className="text-brand-neon shrink-0" size={22} />
          <div>
            <p className="text-brand-light font-bold text-sm">Expresso</p>
            <p className="text-brand-muted text-xs">7-20 minutos</p>
          </div>
        </button>

        <button type="button" onClick={() => onSelect('bodyweight')} className="flex items-center gap-3 p-4 bg-brand-light/5 border-2 border-brand-light/10 hover:border-brand-light/30 transition-all text-left">
          <Wind className="text-brand-light shrink-0" size={22} />
          <div>
            <p className="text-brand-light font-bold text-sm">Sem equipamento</p>
            <p className="text-brand-muted text-xs">Peso corporal</p>
          </div>
        </button>

        <button type="button" onClick={() => onSelect('equipment')} className="flex items-center gap-3 p-4 bg-brand-light/5 border-2 border-brand-light/10 hover:border-brand-light/30 transition-all text-left">
          <Dumbbell className="text-brand-light shrink-0" size={22} />
          <div>
            <p className="text-brand-light font-bold text-sm">Por equipamento</p>
            <p className="text-brand-muted text-xs">Filtra disponível</p>
          </div>
        </button>

        <button type="button" onClick={() => onSelect('goal')} className="flex items-center gap-3 p-4 bg-brand-light/5 border-2 border-brand-light/10 hover:border-brand-light/30 transition-all text-left">
          <Target className="text-brand-light shrink-0" size={22} />
          <div>
            <p className="text-brand-light font-bold text-sm">Por objetivo</p>
            <p className="text-brand-muted text-xs">Selecione o foco</p>
          </div>
        </button>
      </div>

      <div>
        <p className="text-xs text-brand-muted mb-2 font-mono uppercase">Objetivos rápidos:</p>
        <div className="flex flex-wrap gap-2">
          {GOALS.map(goal => (
            <button
              key={goal}
              type="button"
              onClick={() => onSelect('goal', goal)}
              className="px-3 py-1.5 text-xs border-2 border-brand-light/10 text-brand-muted hover:border-brand-neon hover:text-brand-neon transition-all"
            >
              {goal}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
