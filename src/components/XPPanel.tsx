import React, { useMemo, useState } from 'react';
import {
  Award,
  CalendarCheck,
  Flame,
  Medal,
  RefreshCcw,
  Trophy,
  Zap,
} from 'lucide-react';
import {
  createSeasonalLeaderboard,
  dailyCheckin,
  equipTitle,
  loadGamificationState,
  recordLogin,
  simulateRpeLogged,
  simulateWorkoutCompleted,
  xpIntoCurrentLevel,
} from '../utils/gamificationUtils';

export function XPPanel() {
  const [state, setState] = useState(loadGamificationState());

  const progress = useMemo(() => xpIntoCurrentLevel(state.xp), [state.xp]);
  const leaderboard = useMemo(() => createSeasonalLeaderboard(state), [state]);

  const handleLogin = () => {
    setState(recordLogin());
  };

  const handleCheckin = () => {
    setState(dailyCheckin());
  };

  const handleWorkout = () => {
    setState(simulateWorkoutCompleted());
  };

  const handleRpe = () => {
    setState(simulateRpeLogged(4));
  };

  const handleEquipTitle = (title: string) => {
    setState(equipTitle(title));
  };

  return (
    <section className="space-y-5">
      <div className="bg-brand-gray rounded-3xl border border-white/10 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <p className="text-brand-neon text-xs uppercase tracking-[0.25em] font-bold">
              XP e Level
            </p>

            <h2 className="text-4xl font-black text-white mt-2">
              Level {state.level}
            </h2>

            <p className="text-brand-muted mt-1">
              {state.activeTitle ?? 'Atleta'} · {state.xp} XP total · {state.coins} moedas
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button type="button" onClick={handleLogin} className="bg-white/10 rounded-2xl px-4 py-3 text-white font-bold flex items-center gap-2">
              <Flame size={16} className="text-brand-neon" />
              Login
            </button>

            <button type="button" onClick={handleCheckin} className="bg-white/10 rounded-2xl px-4 py-3 text-white font-bold flex items-center gap-2">
              <CalendarCheck size={16} className="text-brand-neon" />
              Check-in
            </button>

            <button type="button" onClick={handleWorkout} className="bg-brand-neon rounded-2xl px-4 py-3 text-brand-dark font-black flex items-center gap-2">
              <Zap size={16} />
              Treino
            </button>

            <button type="button" onClick={handleRpe} className="bg-white/10 rounded-2xl px-4 py-3 text-white font-bold flex items-center gap-2">
              <RefreshCcw size={16} className="text-brand-neon" />
              RPE
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-brand-muted">Progresso do level</span>
            <span className="text-brand-neon font-bold">
              {progress.current}/{progress.required} XP
            </span>
          </div>

          <div className="h-4 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-neon"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-3 mt-5">
          <StatCard icon={<Flame />} label="Login streak" value={`${state.loginStreak}d`} />
          <StatCard icon={<Trophy />} label="Season XP" value={state.season.seasonXp} />
          <StatCard icon={<Medal />} label="Season level" value={state.season.seasonLevel} />
          <StatCard icon={<Award />} label="Loot boxes" value={state.lootBoxesOpened} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-brand-gray rounded-3xl border border-white/10 p-5">
          <h3 className="text-xl font-black text-white mb-4">
            Titulos desbloqueaveis
          </h3>

          <div className="space-y-2">
            {state.titlesUnlocked.map(title => (
              <button
                key={title}
                type="button"
                onClick={() => handleEquipTitle(title)}
                className={`w-full text-left rounded-2xl border p-4 ${
                  state.activeTitle === title
                    ? 'bg-brand-neon/10 border-brand-neon/30 text-brand-neon'
                    : 'bg-white/5 border-white/10 text-white'
                }`}
              >
                {title}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-brand-gray rounded-3xl border border-white/10 p-5">
          <h3 className="text-xl font-black text-white mb-4">
            Ranking sazonal
          </h3>

          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div key={entry.userId} className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-neon/10 text-brand-neon flex items-center justify-center font-black shrink-0">
                    #{index + 1}
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{entry.displayName}</p>
                    <p className="text-xs text-brand-muted">
                      Lv {entry.level} · {entry.streak}d streak · {entry.clanTag ?? 'sem cla'}
                    </p>
                  </div>
                </div>

                <strong className="text-brand-neon whitespace-nowrap">{entry.seasonXp} XP</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="text-brand-neon mb-2">{icon}</div>
      <p className="text-xs text-brand-muted uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-white mt-1">{value}</p>
    </div>
  );
}
