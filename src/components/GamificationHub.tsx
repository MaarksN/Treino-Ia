import React, { useEffect, useState } from 'react';
import { Flame, Gift, Shield, Sparkles, Trophy } from 'lucide-react';
import { recordLogin } from '../utils/gamificationUtils';
import { AvatarForge } from './AvatarForge';
import { DailyMissions } from './DailyMissions';
import { SeasonPass } from './SeasonPass';
import { XPPanel } from './XPPanel';

type Tab = 'xp' | 'missions' | 'season' | 'avatar';

export function GamificationHub() {
  const [tab, setTab] = useState<Tab>('xp');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    recordLogin();
    setRefreshKey(key => key + 1);
  }, []);

  const tabs = [
    { id: 'xp', label: 'XP & Level', icon: Trophy },
    { id: 'missions', label: 'Missoes', icon: Flame },
    { id: 'season', label: 'Season Pass', icon: Gift },
    { id: 'avatar', label: 'Avatar & Cla', icon: Shield },
  ] as const;

  return (
    <div className="min-h-screen bg-brand-dark text-white p-6">
      <header className="max-w-7xl mx-auto mb-8">
        <p className="text-brand-neon text-xs uppercase tracking-[0.25em] font-bold">
          Bloco 10
        </p>

        <h1 className="text-4xl font-black mt-2">
          Gamificacao Profunda
        </h1>

        <p className="text-brand-muted mt-2 max-w-3xl">
          XP, level, missoes, season pass, recompensas, avatar evolutivo,
          loja cosmetica, ranking sazonal, boss challenge, cla e passe elite.
        </p>
      </header>

      <nav className="max-w-7xl mx-auto flex flex-wrap gap-2 mb-8">
        {tabs.map(item => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-xl px-4 py-3 font-bold flex items-center gap-2 ${
                tab === item.id
                  ? 'bg-brand-neon text-brand-dark'
                  : 'bg-white/10 text-white'
              }`}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <main key={refreshKey} className="max-w-7xl mx-auto">
        {tab === 'xp' && <XPPanel />}
        {tab === 'missions' && <DailyMissions />}
        {tab === 'season' && <SeasonPass />}
        {tab === 'avatar' && <AvatarForge />}
      </main>

      <div className="max-w-7xl mx-auto mt-8 rounded-3xl border border-brand-neon/20 bg-brand-neon/10 p-5">
        <p className="text-brand-neon font-black flex items-center gap-2">
          <Sparkles size={18} />
          Como conectar com o treino real
        </p>

        <p className="text-sm text-white/70 mt-2">
          Treinos concluidos, check-ins e RPE ja alimentam XP, missoes, temporada e boss challenge.
          Para novas acoes, use addXp(), updateMissionProgress() e addCoins() com os dados reais.
        </p>
      </div>
    </div>
  );
}
