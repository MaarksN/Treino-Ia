import React from 'react';
import { Flame, Trophy, Zap } from 'lucide-react';
import { StreakData } from '../types';
import { getDaysSinceLastWorkout } from '../utils/streakUtils';

interface Props {
  streak: StreakData;
}

function getLevelInfo(totalWorkouts: number) {
  const thresholds = [0, 5, 15, 30, 60, 100, 150, 200, 300, 500, 750, 1000];
  const names = ['Iniciante', 'Aprendiz', 'Atleta', 'Dedicado', 'Avançado', 'Elite', 'Expert', 'Master', 'Lendário', 'Imortal', 'Transcendente', 'Olímpico'];

  let level = 0;
  for (let index = 0; index < thresholds.length; index++) {
    if (totalWorkouts >= thresholds[index]) level = index;
    else break;
  }

  return {
    level: level + 1,
    name: names[level],
    xpCurrent: totalWorkouts - thresholds[level],
    xpToNext: level < thresholds.length - 1 ? thresholds[level + 1] - thresholds[level] : 999,
  };
}

export function StreakTracker({ streak }: Props) {
  const daysSince = getDaysSinceLastWorkout(streak);
  const atRisk = daysSince >= 2;
  const levelInfo = getLevelInfo(streak.totalWorkouts);
  const xpPct = (levelInfo.xpCurrent / levelInfo.xpToNext) * 100;

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light">Progresso e streak</h3>
        {atRisk && <span className="px-3 py-1 bg-red-500/10 border-2 border-red-500/30 text-red-400 text-xs font-bold uppercase">Streak em risco</span>}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className={`flex flex-col items-center p-4 border-2 ${atRisk ? 'border-red-500/30 bg-red-500/5' : 'border-brand-neon/30 bg-brand-neon/5'}`}>
          <Flame size={28} className={atRisk ? 'text-red-400' : 'text-brand-neon'} />
          <p className={`text-3xl font-black tabular-nums mt-1 ${atRisk ? 'text-red-400' : 'text-brand-neon'}`}>{streak.currentStreak}</p>
          <p className="text-xs text-brand-muted mt-1 text-center">Streak atual</p>
        </div>

        <div className="flex flex-col items-center p-4 border-2 border-brand-light/10 bg-brand-dark">
          <Trophy size={28} className="text-yellow-400" />
          <p className="text-3xl font-black text-yellow-400 tabular-nums mt-1">{streak.longestStreak}</p>
          <p className="text-xs text-brand-muted mt-1 text-center">Recorde</p>
        </div>

        <div className="flex flex-col items-center p-4 border-2 border-brand-light/10 bg-brand-dark">
          <Zap size={28} className="text-blue-400" />
          <p className="text-3xl font-black text-blue-400 tabular-nums mt-1">{streak.totalWorkouts}</p>
          <p className="text-xs text-brand-muted mt-1 text-center">Total</p>
        </div>
      </div>

      <div className="p-4 bg-brand-dark border-2 border-brand-light/10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-brand-muted text-xs uppercase tracking-widest">Nível {levelInfo.level}</p>
            <p className="text-brand-light font-bold text-lg">{levelInfo.name}</p>
          </div>
          <div className="w-12 h-12 border-2 border-brand-neon flex items-center justify-center">
            <span className="text-brand-neon font-black text-lg">{levelInfo.level}</span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-brand-muted mb-1">
          <span>{levelInfo.xpCurrent} XP</span>
          <span>{levelInfo.xpToNext} XP para o próximo</span>
        </div>
        <div className="h-2.5 bg-white/10 overflow-hidden">
          <div className="h-full bg-brand-neon transition-all duration-700" style={{ width: `${Math.min(xpPct, 100)}%` }} />
        </div>
      </div>

      {streak.lastWorkoutDate && (
        <p className="text-xs text-brand-muted mt-3 text-center">
          Último treino: <strong className="text-brand-light">{streak.lastWorkoutDate}</strong>
          {daysSince > 0 && Number.isFinite(daysSince) && ` (${daysSince} ${daysSince === 1 ? 'dia' : 'dias'} atrás)`}
        </p>
      )}
    </div>
  );
}
