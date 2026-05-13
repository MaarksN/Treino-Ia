
import React from 'react';
import { Target } from 'lucide-react';
import { GamificationMission } from '../services/gamificationService';

interface Props {
  missions: GamificationMission[];
}

export function ChallengeCenter({ missions = [] }: Props) {
  const activeMissions = missions.filter(m => m.status === 'active' || m.status === 'completed');

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-brand-neon" />
          <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light">Missões</h3>
        </div>
      </div>

      <div className="space-y-3">
        {activeMissions.length === 0 && (
          <p className="text-sm text-brand-muted">Nenhuma missão disponível no momento.</p>
        )}

        {activeMissions.map(mission => {
          const pct = Math.min((mission.progress / mission.target) * 100, 100);
          const isCompleted = mission.progress >= mission.target;

          return (
            <div key={mission.id} className={`p-4 border-2 transition-colors ${isCompleted ? 'border-brand-neon/50 bg-brand-neon/5' : 'border-brand-light/10 bg-brand-dark'}`}>
              <div className="flex items-start justify-between mb-2 gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-2xl">{mission.type === 'boss' ? '👹' : '🎯'}</span>
                  <div className="min-w-0">
                    <p className="text-brand-light font-semibold text-sm">{mission.title}</p>
                    <p className="text-brand-muted text-xs">{mission.description}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-brand-neon font-bold text-sm tabular-nums">{mission.progress}/{mission.target}</p>
                  <p className="text-brand-muted text-[10px] uppercase">{mission.metric}</p>
                </div>
              </div>

              <div className="h-2 bg-white/10 overflow-hidden mb-2">
                <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: isCompleted ? '#a3e635' : '#60a5fa' }} />
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-brand-neon/10 text-brand-neon border border-brand-neon/20 text-[10px] font-bold uppercase rounded-sm">+{mission.xpReward} XP</span>
                  <span className="px-2 py-0.5 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 text-[10px] font-bold uppercase rounded-sm">+{mission.coinReward} Coins</span>
                </div>
                {isCompleted && <p className="text-brand-neon text-xs font-bold">Concluído!</p>}
              </div>

              {mission.expiresAt && (
                <p className="text-brand-light/30 text-[10px] mt-2">Expira em: {new Date(mission.expiresAt).toLocaleDateString('pt-BR')}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
