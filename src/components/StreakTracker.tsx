
import React from 'react';
import { Flame, Trophy, Zap } from 'lucide-react';
import { ServerGamificationProfile } from '../services/gamificationService';
import { StreakData } from '../types';

interface Props {
  streak: StreakData;
  profile?: ServerGamificationProfile;
}

function getDaysSinceDate(dateString: string | null): number {
  if (!dateString) return Infinity;
  const last = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - last.getTime()) / 86400000);
}

export function StreakTracker({ streak, profile }: Props) {
  const loginStreak = profile?.login_streak ?? streak.currentStreak;
  const level = profile?.level ?? 1;
  const title = profile?.active_title ?? 'Iniciante';
  const xp = profile?.xp ?? streak.totalWorkouts * 10;

  const xpCurrent = xp % 300;
  const xpToNext = 300;
  const xpPct = (xpCurrent / xpToNext) * 100;

  const daysSince = getDaysSinceDate(profile?.last_login_at ?? streak.lastWorkoutDate);
  const atRisk = daysSince >= 2;

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light">Progresso e streak</h3>
        {atRisk && <span className="px-3 py-1 bg-red-500/10 border-2 border-red-500/30 text-red-400 text-xs font-bold uppercase">Streak em risco</span>}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className={`flex flex-col items-center p-4 border-2 ${atRisk ? 'border-red-500/30 bg-red-500/5' : 'border-brand-neon/30 bg-brand-neon/5'}`}>
          <Flame size={28} className={atRisk ? 'text-red-400' : 'text-brand-neon'} />
          <p className={`text-3xl font-black tabular-nums mt-1 ${atRisk ? 'text-red-400' : 'text-brand-neon'}`}>{loginStreak}</p>
          <p className="text-xs text-brand-muted mt-1 text-center">Dias seguidos</p>
        </div>

        <div className="flex flex-col items-center p-4 border-2 border-brand-light/10 bg-brand-dark">
          <Trophy size={28} className="text-yellow-400" />
          <p className="text-3xl font-black text-yellow-400 tabular-nums mt-1">{streak.longestStreak}</p>
          <p className="text-xs text-brand-muted mt-1 text-center">Recorde treinos</p>
        </div>

        <div className="flex flex-col items-center p-4 border-2 border-brand-light/10 bg-brand-dark">
          <Zap size={28} className="text-blue-400" />
          <p className="text-3xl font-black text-blue-400 tabular-nums mt-1">{streak.totalWorkouts}</p>
          <p className="text-xs text-brand-muted mt-1 text-center">Treinos totais</p>
        </div>
      </div>

      <div className="p-4 bg-brand-dark border-2 border-brand-light/10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-brand-muted text-xs uppercase tracking-widest">Nível {level}</p>
            <p className="text-brand-light font-bold text-lg">{title}</p>
          </div>
          <div className="w-12 h-12 border-2 border-brand-neon flex items-center justify-center">
            <span className="text-brand-neon font-black text-lg">{level}</span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-brand-muted mb-1">
          <span>{xpCurrent} XP</span>
          <span>{xpToNext} XP para o próximo</span>
        </div>
        <div className="h-2.5 bg-white/10 overflow-hidden">
          <div className="h-full bg-brand-neon transition-all duration-700" style={{ width: `${Math.min(xpPct, 100)}%` }} />
        </div>
      </div>

      {(profile?.last_login_at || streak.lastWorkoutDate) && (
        <p className="text-xs text-brand-muted mt-3 text-center">
          Última atividade: <strong className="text-brand-light">
            {profile?.last_login_at ? new Date(profile.last_login_at).toLocaleDateString('pt-BR') : streak.lastWorkoutDate}
          </strong>
          {daysSince > 0 && Number.isFinite(daysSince) && ` (${daysSince} ${daysSince === 1 ? 'dia' : 'dias'} atrás)`}
        </p>
      )}
    </div>
  );
}
