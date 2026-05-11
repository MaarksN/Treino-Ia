import React, { useState } from 'react';
import { Dumbbell, Target, Wind, Zap } from 'lucide-react';

interface Props {
  onSelect: (type: 'express' | 'bodyweight' | 'equipment' | 'goal', value?: string) => void;
}

const GOALS = ['Hipertrofia', 'Força', 'Emagrecimento', 'Condicionamento'];
const EXPRESS_DURATIONS = ['7 minutos', '12 minutos', '20 minutos'];
const EQUIPMENT = ['Halteres', 'Barra', 'Máquinas', 'Elásticos', 'Academia cheia'];

export function QuickWorkoutCard({ onSelect }: Props) {
  const [equipment, setEquipment] = useState(EQUIPMENT[0]);

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
      <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light mb-4">Escolha um modo de treino</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <button type="button" onClick={() => onSelect('express', '12 minutos')} className="flex items-center gap-3 p-4 bg-brand-neon/10 border-2 border-brand-neon/30 hover:border-brand-neon transition-all text-left">
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

        <button type="button" onClick={() => onSelect('equipment', equipment)} className="flex items-center gap-3 p-4 bg-brand-light/5 border-2 border-brand-light/10 hover:border-brand-light/30 transition-all text-left">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-brand-muted mb-2 font-mono uppercase">Sessões expressas:</p>
          <div className="flex flex-wrap gap-2">
            {EXPRESS_DURATIONS.map(duration => (
              <button
                key={duration}
                type="button"
                onClick={() => onSelect('express', duration)}
                className="px-3 py-1.5 text-xs border-2 border-brand-neon/30 text-brand-neon hover:bg-brand-neon hover:text-brand-dark transition-all"
              >
                {duration}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-brand-muted mb-2 font-mono uppercase block" htmlFor="quick-equipment">
            Equipamento disponível:
          </label>
          <div className="flex gap-2">
            <select
              id="quick-equipment"
              value={equipment}
              onChange={event => setEquipment(event.target.value)}
              className="flex-1 min-w-0 bg-brand-dark border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon"
            >
              {EQUIPMENT.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
            <button
              type="button"
              onClick={() => onSelect('equipment', equipment)}
              className="px-3 py-2 bg-brand-light/10 border-2 border-brand-light/10 text-xs font-bold uppercase text-brand-light hover:border-brand-neon hover:text-brand-neon"
            >
              Gerar
            </button>
          </div>
        </div>
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
