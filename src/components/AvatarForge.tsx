import React, { useState } from 'react';
import { Badge, Coins, Shield, ShoppingBag, Sparkles, Users } from 'lucide-react';
import {
  buyCosmetic,
  equipCosmetic,
  getAvatarEmoji,
  getRarityClass,
  loadGamificationState,
} from '../utils/gamificationUtils';

export function AvatarForge() {
  const [state, setState] = useState(loadGamificationState());
  const [message, setMessage] = useState('');

  const buy = (id: string) => {
    const result = buyCosmetic(id);
    setMessage(result.message);
    setState(result.state);
  };

  const equip = (id: string) => {
    setState(equipCosmetic(id));
    setMessage('Item equipado.');
  };

  return (
    <section className="space-y-5">
      <div className="grid lg:grid-cols-[360px_1fr] gap-5">
        <aside className="bg-brand-gray rounded-3xl border border-white/10 p-5">
          <p className="text-brand-neon text-xs uppercase tracking-[0.25em] font-bold">
            Avatar RPG
          </p>

          <div className="mt-5 rounded-3xl bg-brand-dark border border-white/10 p-6 text-center">
            <div className={`mx-auto w-32 h-32 rounded-[2rem] border flex items-center justify-center text-6xl ${
              state.avatar.equippedFrame ? 'border-brand-neon bg-brand-neon/10' : 'border-white/10 bg-white/5'
            }`}>
              {getAvatarEmoji(state.avatar.archetype)}
            </div>

            <h2 className="text-2xl font-black text-white mt-5">
              {state.avatar.archetype.toUpperCase()}
            </h2>

            <p className="text-brand-muted mt-1">
              Level {state.level} · {state.activeTitle}
            </p>

            {state.avatar.equippedEffect && (
              <div className="mt-4 rounded-2xl bg-brand-neon/10 border border-brand-neon/30 p-3 text-brand-neon font-black flex items-center justify-center gap-2">
                <Sparkles size={16} />
                Emblema animado ativo
              </div>
            )}
          </div>

          <div className="mt-5 bg-white/5 rounded-2xl border border-white/10 p-4">
            <p className="text-xs text-brand-muted uppercase tracking-widest flex items-center gap-2">
              <Coins size={14} />
              Moedas
            </p>
            <p className="text-3xl font-black text-white">{state.coins}</p>
          </div>

          {state.clan && (
            <div className="mt-5 bg-white/5 rounded-2xl border border-white/10 p-4">
              <p className="text-xs text-brand-muted uppercase tracking-widest flex items-center gap-2">
                <Users size={14} />
                Cla
              </p>
              <h3 className="text-xl font-black text-white">
                [{state.clan.tag}] {state.clan.name}
              </h3>
              <p className="text-sm text-brand-muted mt-1">
                {state.clan.memberCount} membro · {state.clan.weeklyXp} XP semanal
              </p>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-brand-muted">Dano no boss</span>
                  <span className="text-brand-neon">{state.clan.bossDamage}/10000</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-neon"
                    style={{ width: `${Math.min(100, state.clan.bossDamage / 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </aside>

        <main className="bg-brand-gray rounded-3xl border border-white/10 p-5">
          <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-5">
            <ShoppingBag className="text-brand-neon" />
            Loja cosmetica
          </h2>

          {message && (
            <div className="mb-4 rounded-2xl bg-brand-neon/10 border border-brand-neon/20 p-3 text-brand-neon font-bold">
              {message}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-3">
            {state.cosmetics.map(item => (
              <article key={item.id} className="rounded-2xl bg-brand-dark border border-white/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
                      {item.emoji}
                    </div>

                    <div>
                      <h3 className="font-black text-white">{item.name}</h3>
                      <p className="text-sm text-brand-muted">{item.description}</p>
                    </div>
                  </div>

                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getRarityClass(item.rarity)}`}>
                    {item.rarity}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-white/70 flex items-center gap-1">
                    <Coins size={14} className="text-brand-neon" />
                    {item.price}
                  </p>

                  {item.unlocked ? (
                    <button
                      type="button"
                      onClick={() => equip(item.id)}
                      className="bg-white/10 text-white rounded-xl px-4 py-2 font-bold flex items-center gap-2"
                    >
                      <Badge size={14} />
                      {item.equipped ? 'Equipado' : 'Equipar'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => buy(item.id)}
                      className="bg-brand-neon text-brand-dark rounded-xl px-4 py-2 font-black flex items-center gap-2"
                    >
                      <Shield size={14} />
                      Comprar
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </section>
  );
}
