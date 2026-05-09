import React, { useState } from 'react';
import { Plus, Target, X } from 'lucide-react';
import { Challenge } from '../types';
import { getOrCreateMonthlyChallenges, getOrCreateWeeklyChallenges, loadChallenges, saveChallenges } from '../utils/challengeUtils';

export function ChallengeCenter() {
  const [showCustom, setShowCustom] = useState(false);
  const [newChallenge, setNewChallenge] = useState<Partial<Challenge>>({ type: 'weekly' });
  const [version, setVersion] = useState(0);
  const storedChallenges = loadChallenges();
  const generated = [...getOrCreateWeeklyChallenges(), ...getOrCreateMonthlyChallenges()];
  const activeChallenges = [...new Map([...generated, ...storedChallenges].map(challenge => [challenge.id, challenge])).values()];
  const today = new Date().toISOString().slice(0, 10);

  const addCustomChallenge = () => {
    if (!newChallenge.name || !newChallenge.target) return;

    const now = new Date();
    const days = newChallenge.type === 'monthly' ? 30 : 7;
    const challenge: Challenge = {
      id: crypto.randomUUID(),
      name: newChallenge.name,
      description: newChallenge.description || '',
      emoji: newChallenge.emoji || '🎯',
      type: newChallenge.type || 'custom',
      target: newChallenge.target,
      current: 0,
      unit: newChallenge.unit || 'unidades',
      startDate: now.toISOString().slice(0, 10),
      endDate: new Date(now.getTime() + days * 86400000).toISOString().slice(0, 10),
      completed: false,
      reward: newChallenge.reward,
    };

    saveChallenges([...storedChallenges, challenge]);
    setShowCustom(false);
    setNewChallenge({ type: 'weekly' });
    setVersion(value => value + 1);
  };

  void version;

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-brand-neon" />
          <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light">Desafios</h3>
        </div>
        <button onClick={() => setShowCustom(value => !value)} type="button" className="inline-flex items-center gap-1 text-xs text-brand-neon border-2 border-brand-neon/30 px-3 py-2 hover:bg-brand-neon/10 transition-colors uppercase font-bold">
          <Plus size={12} /> Criar
        </button>
      </div>

      {showCustom && (
        <div className="mb-4 p-4 bg-brand-dark border-2 border-brand-light/10 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-brand-light uppercase">Novo desafio</p>
            <button onClick={() => setShowCustom(false)} type="button"><X size={16} className="text-brand-muted" /></button>
          </div>
          <input placeholder="Nome" value={newChallenge.name || ''} onChange={event => setNewChallenge(value => ({ ...value, name: event.target.value }))} className="w-full bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon" />
          <input placeholder="Descrição" value={newChallenge.description || ''} onChange={event => setNewChallenge(value => ({ ...value, description: event.target.value }))} className="w-full bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Emoji" value={newChallenge.emoji || ''} onChange={event => setNewChallenge(value => ({ ...value, emoji: event.target.value }))} className="bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon" />
            <input type="number" placeholder="Meta" value={newChallenge.target || ''} onChange={event => setNewChallenge(value => ({ ...value, target: Number(event.target.value) }))} className="bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon" />
          </div>
          <input placeholder="Unidade" value={newChallenge.unit || ''} onChange={event => setNewChallenge(value => ({ ...value, unit: event.target.value }))} className="w-full bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon" />
          <button onClick={addCustomChallenge} type="button" className="w-full bg-brand-neon text-brand-dark font-black py-3 border-brutal uppercase tracking-widest">Criar desafio</button>
        </div>
      )}

      <div className="space-y-3">
        {activeChallenges.filter(challenge => challenge.endDate >= today).map(challenge => {
          const pct = Math.min((challenge.current / challenge.target) * 100, 100);
          return (
            <div key={challenge.id} className={`p-4 border-2 transition-colors ${challenge.completed ? 'border-brand-neon/50 bg-brand-neon/5' : 'border-brand-light/10 bg-brand-dark'}`}>
              <div className="flex items-start justify-between mb-2 gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-2xl">{challenge.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-brand-light font-semibold text-sm">{challenge.name}</p>
                    <p className="text-brand-muted text-xs">{challenge.description}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-brand-neon font-bold text-sm tabular-nums">{challenge.current}/{challenge.target}</p>
                  <p className="text-brand-muted text-xs">{challenge.unit}</p>
                </div>
              </div>
              <div className="h-2 bg-white/10 overflow-hidden">
                <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: challenge.completed ? '#a3e635' : '#60a5fa' }} />
              </div>
              {challenge.completed && <p className="text-brand-neon text-xs font-bold mt-2">Concluído! {challenge.reward}</p>}
              <p className="text-brand-light/30 text-[10px] mt-1">até {challenge.endDate}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
