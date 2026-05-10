import React, { useMemo, useState } from 'react';
import { Crown, Gift, Lock, Sparkles } from 'lucide-react';
import {
  activateElitePass,
  claimSeasonReward,
  loadGamificationState,
} from '../utils/gamificationUtils';

export function SeasonPass() {
  const [state, setState] = useState(loadGamificationState());

  const daysLeft = useMemo(() => {
    return Math.max(
      0,
      Math.ceil((state.season.endsAt - Date.now()) / (24 * 60 * 60 * 1000)),
    );
  }, [state.season.endsAt]);

  const activateElite = () => {
    setState(activateElitePass());
  };

  const claim = (level: number, track: 'free' | 'elite') => {
    setState(claimSeasonReward(level, track));
  };

  return (
    <section className="space-y-5">
      <div className="bg-brand-gray rounded-3xl border border-white/10 p-5 overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-neon/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <p className="text-brand-neon text-xs uppercase tracking-[0.25em] font-bold">
              Season Pass
            </p>

            <h2 className="text-4xl font-black text-white mt-2">
              {state.season.name}
            </h2>

            <p className="text-brand-muted mt-2 max-w-2xl">
              {state.season.theme}. Complete missoes, suba niveis e resgate recompensas sazonais.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Stat label="Nivel" value={state.season.seasonLevel} />
            <Stat label="Season XP" value={state.season.seasonXp} />
            <Stat label="Dias" value={daysLeft} />
          </div>
        </div>

        {!state.season.eliteActive && (
          <button
            type="button"
            onClick={activateElite}
            className="relative mt-5 bg-brand-neon text-brand-dark rounded-xl px-5 py-3 font-black flex items-center gap-2"
          >
            <Crown size={18} />
            Ativar Passe Elite
          </button>
        )}

        {state.season.eliteActive && (
          <div className="relative mt-5 rounded-2xl bg-brand-neon/10 border border-brand-neon/30 p-4 text-brand-neon font-black flex items-center gap-2">
            <Sparkles size={18} />
            Passe Elite ativo
          </div>
        )}
      </div>

      <div className="bg-brand-gray rounded-3xl border border-white/10 p-5">
        <h3 className="text-xl font-black text-white mb-5">
          Trilha de recompensas
        </h3>

        <div className="space-y-3">
          {state.season.rewards.map(reward => {
            const unlocked = reward.level <= state.season.seasonLevel;

            return (
              <article key={reward.level} className="grid md:grid-cols-[90px_1fr_1fr] gap-3 rounded-2xl bg-brand-dark border border-white/10 p-4">
                <div className="flex md:flex-col items-center justify-center rounded-2xl bg-white/5 p-3">
                  <p className="text-xs text-brand-muted">Nivel</p>
                  <p className="text-2xl font-black text-white">{reward.level}</p>
                </div>

                <RewardCard
                  title="Free"
                  label={reward.freeReward?.label ?? 'Sem recompensa'}
                  unlocked={unlocked}
                  claimed={Boolean(reward.claimedFree)}
                  onClaim={() => claim(reward.level, 'free')}
                />

                <RewardCard
                  title="Elite"
                  label={reward.eliteReward?.label ?? 'Sem recompensa'}
                  unlocked={unlocked && state.season.eliteActive}
                  claimed={Boolean(reward.claimedElite)}
                  elite
                  onClaim={() => claim(reward.level, 'elite')}
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center min-w-24">
      <p className="text-xs text-brand-muted uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function RewardCard({
  title,
  label,
  unlocked,
  claimed,
  elite,
  onClaim,
}: {
  title: string;
  label: string;
  unlocked: boolean;
  claimed: boolean;
  elite?: boolean;
  onClaim: () => void;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${
      elite
        ? 'bg-brand-neon/10 border-brand-neon/20'
        : 'bg-white/5 border-white/10'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-brand-muted uppercase tracking-widest">{title}</p>
          <h4 className="font-black text-white mt-1 flex items-center gap-2">
            {elite ? <Crown size={16} className="text-brand-neon" /> : <Gift size={16} className="text-brand-neon" />}
            {label}
          </h4>
        </div>

        {!unlocked && <Lock size={18} className="text-white/40" />}
      </div>

      <button
        type="button"
        disabled={!unlocked || claimed}
        onClick={onClaim}
        className="mt-4 disabled:opacity-40 bg-brand-neon text-brand-dark rounded-xl px-4 py-2 font-black text-sm"
      >
        {claimed ? 'Resgatado' : 'Resgatar'}
      </button>
    </div>
  );
}
