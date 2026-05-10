import React, { useMemo, useState } from 'react';
import {
  Box,
  CalendarDays,
  CheckCircle2,
  Clock,
  Crosshair,
  Gift,
  Swords,
  Zap,
} from 'lucide-react';
import { GamificationMission, MissionType } from '../types';
import {
  claimMission,
  loadGamificationState,
  openSymbolicLootBox,
  triggerFlashMission,
  triggerWeekendEvent,
} from '../utils/gamificationUtils';

export function DailyMissions() {
  const [state, setState] = useState(loadGamificationState());
  const [lootMessage, setLootMessage] = useState('');

  const grouped = useMemo(() => {
    return state.missions.reduce<Record<MissionType, GamificationMission[]>>(
      (acc, mission) => {
        acc[mission.type].push(mission);
        return acc;
      },
      {
        daily: [],
        weekly: [],
        flash: [],
        boss: [],
        weekend: [],
      },
    );
  }, [state.missions]);

  const claim = (missionId: string) => {
    setState(claimMission(missionId));
  };

  const openLoot = () => {
    const result = openSymbolicLootBox();

    if ('name' in result.reward) {
      setLootMessage(`Voce ganhou: ${result.reward.emoji} ${result.reward.name}`);
    } else {
      setLootMessage(`Voce ganhou ${result.reward.coins} moedas e ${result.reward.xp} XP.`);
    }

    setState(result.state);
  };

  const addFlash = () => {
    setState(triggerFlashMission());
  };

  const addWeekend = () => {
    setState(triggerWeekendEvent());
  };

  return (
    <section className="space-y-5">
      <div className="bg-brand-gray rounded-3xl border border-white/10 p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-brand-neon text-xs uppercase tracking-[0.25em] font-bold">
              Missoes
            </p>
            <h2 className="text-3xl font-black text-white mt-2">
              Engajamento diario e semanal
            </h2>
            <p className="text-brand-muted mt-1">
              Complete missoes, ganhe XP, moedas e recompensas simbolicas.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={addFlash} className="bg-white/10 text-white rounded-xl px-4 py-3 font-bold flex items-center gap-2">
              <Zap size={16} className="text-brand-neon" />
              Missao relampago
            </button>

            <button type="button" onClick={addWeekend} className="bg-white/10 text-white rounded-xl px-4 py-3 font-bold flex items-center gap-2">
              <CalendarDays size={16} className="text-brand-neon" />
              Evento fim de semana
            </button>

            <button type="button" onClick={openLoot} className="bg-brand-neon text-brand-dark rounded-xl px-4 py-3 font-black flex items-center gap-2">
              <Box size={16} />
              Loot box
            </button>
          </div>
        </div>

        {lootMessage && (
          <div className="mt-4 rounded-2xl bg-brand-neon/10 border border-brand-neon/20 p-4 text-brand-neon font-bold">
            {lootMessage}
          </div>
        )}
      </div>

      <MissionSection
        title="Missoes diarias"
        icon={<Clock />}
        missions={grouped.daily}
        onClaim={claim}
      />

      <MissionSection
        title="Missoes semanais"
        icon={<Crosshair />}
        missions={grouped.weekly}
        onClaim={claim}
      />

      <MissionSection
        title="Missoes relampago"
        icon={<Zap />}
        missions={grouped.flash}
        onClaim={claim}
      />

      <MissionSection
        title="Boss challenge mensal"
        icon={<Swords />}
        missions={grouped.boss}
        onClaim={claim}
      />

      <MissionSection
        title="Evento de fim de semana"
        icon={<Gift />}
        missions={grouped.weekend}
        onClaim={claim}
      />
    </section>
  );
}

function MissionSection({
  title,
  icon,
  missions,
  onClaim,
}: {
  title: string;
  icon: React.ReactNode;
  missions: GamificationMission[];
  onClaim: (missionId: string) => void;
}) {
  if (!missions.length) return null;

  return (
    <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
      <h3 className="text-xl font-black text-white flex items-center gap-2 mb-4">
        <span className="text-brand-neon">{icon}</span>
        {title}
      </h3>

      <div className="grid md:grid-cols-2 gap-3">
        {missions.map(mission => {
          const percent = Math.min(100, Math.round((mission.progress / mission.target) * 100));

          return (
            <article key={mission.id} className="rounded-2xl bg-brand-dark border border-white/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-black text-white">{mission.title}</h4>
                  <p className="text-sm text-brand-muted mt-1">{mission.description}</p>
                </div>

                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  mission.status === 'completed'
                    ? 'bg-brand-neon text-brand-dark'
                    : mission.status === 'claimed'
                      ? 'bg-white/10 text-white/60'
                      : 'bg-white/10 text-white'
                }`}>
                  {mission.status}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-brand-muted">Progresso</span>
                  <span className="text-brand-neon font-bold">
                    {mission.progress}/{mission.target}
                  </span>
                </div>

                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-neon" style={{ width: `${percent}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 mt-4">
                <p className="text-xs text-white/60">
                  +{mission.xpReward} XP · +{mission.coinReward ?? 0} moedas
                </p>

                <button
                  type="button"
                  disabled={mission.status !== 'completed'}
                  onClick={() => onClaim(mission.id)}
                  className="disabled:opacity-40 bg-brand-neon text-brand-dark rounded-xl px-3 py-2 font-black text-sm flex items-center gap-1"
                >
                  <CheckCircle2 size={14} />
                  Resgatar
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
