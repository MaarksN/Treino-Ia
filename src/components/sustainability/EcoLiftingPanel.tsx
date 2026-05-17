import React from 'react';
import { Leaf, Award } from 'lucide-react';
import { calculateEcoLiftingImpact } from '../../services/sustainability/ecoLiftingService';
import { WorkoutSession } from '../../services/database';
import { EmptyState } from '../ui/EmptyState';

interface Props {
  history: WorkoutSession[];
}

export function EcoLiftingPanel({ history }: Props) {
  const stats = calculateEcoLiftingImpact(history);

  return (
    <div className="rounded-[24px] border-2 border-brand-neon bg-brand-dark p-6 shadow-brutal-neon">
      <div className="flex items-center gap-4 border-b-2 border-brand-neon/20 pb-4">
        <div className="rounded-full bg-brand-neon/10 p-3 text-brand-neon">
          <Leaf className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-display text-2xl uppercase text-brand-light">Eco-Lifting</h3>
          <p className="font-mono text-xs text-brand-light/70">Gamificação sustentável baseada no seu compromisso.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        <div className="flex-1 space-y-4">
          <div className="rounded-[16px] border-2 border-brand-light/10 bg-brand-gray p-4 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-brand-neon">Pontos Eco</p>
            <p className="font-display text-5xl uppercase text-brand-light mt-2">{stats.score}</p>
          </div>
          <p className="font-mono text-sm leading-relaxed text-brand-light/80">
            {stats.message}
          </p>
        </div>

        <div className="flex-1">
          <h4 className="mb-3 font-mono text-xs uppercase tracking-widest text-brand-light">Suas Conquistas</h4>
          {stats.badges.length > 0 ? (
            <ul className="space-y-2">
              {stats.badges.map(badge => (
                <li key={badge} className="flex items-center gap-2 rounded-full border border-brand-neon/30 bg-brand-neon/5 px-3 py-2 font-mono text-xs text-brand-neon">
                  <Award className="h-4 w-4" />
                  {badge}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Award className="h-6 w-6" />}
              title="Nenhuma conquista"
              description="Complete sessões consistentes para ganhar badges ecológicos."
            />
          )}
        </div>
      </div>
    </div>
  );
}
