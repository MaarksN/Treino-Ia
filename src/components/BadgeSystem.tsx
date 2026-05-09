import React, { useState } from 'react';
import { Badge } from '../types';
import { loadBadges } from '../utils/badgeUtils';

interface Props {
  newlyUnlocked?: Badge[];
  onDismiss?: () => void;
}

export function BadgeSystem({ newlyUnlocked = [], onDismiss }: Props) {
  const [filter, setFilter] = useState<Badge['category'] | 'all'>('all');
  const badges = loadBadges();
  const filtered = filter === 'all' ? badges : badges.filter(badge => badge.category === filter);
  const unlockedCount = badges.filter(badge => badge.unlocked).length;
  const categories: Array<{ id: Badge['category'] | 'all'; label: string }> = [
    { id: 'all', label: 'Todos' },
    { id: 'consistency', label: 'Consistência' },
    { id: 'volume', label: 'Volume' },
    { id: 'pr', label: 'PRs' },
    { id: 'nutrition', label: 'Nutrição' },
    { id: 'recovery', label: 'Recovery' },
    { id: 'special', label: 'Especiais' },
  ];

  return (
    <>
      {newlyUnlocked.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {newlyUnlocked.map(badge => (
            <div key={badge.id} className="flex items-center gap-3 bg-brand-gray border-2 border-brand-neon/50 p-4 shadow-2xl">
              <span className="text-4xl">{badge.emoji}</span>
              <div className="min-w-0">
                <p className="text-xs text-brand-neon font-bold uppercase tracking-widest">Conquista desbloqueada</p>
                <p className="text-brand-light font-bold">{badge.name}</p>
                <p className="text-brand-muted text-xs">{badge.description}</p>
              </div>
              <button onClick={onDismiss} type="button" className="text-brand-muted hover:text-brand-light ml-2">x</button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light">Conquistas</h3>
          <p className="text-brand-muted text-sm">{unlockedCount}/{badges.length}</p>
        </div>

        <div className="mb-4 h-2 bg-white/10 overflow-hidden">
          <div className="h-full bg-brand-neon transition-all duration-700" style={{ width: `${(unlockedCount / badges.length) * 100}%` }} />
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          {categories.map(category => (
            <button
              key={category.id}
              type="button"
              onClick={() => setFilter(category.id)}
              className={`px-3 py-2 text-xs font-bold border-2 uppercase tracking-widest transition-colors ${
                filter === category.id
                  ? 'bg-brand-neon text-brand-dark border-brand-neon'
                  : 'bg-brand-dark text-brand-muted border-brand-light/10 hover:text-brand-light'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map(badge => (
            <div key={badge.id} className={`flex flex-col items-center p-3 border-2 text-center transition-all ${badge.unlocked ? 'border-brand-neon/30 bg-brand-neon/5' : 'border-brand-light/5 bg-brand-dark opacity-45 grayscale'}`}>
              <span className="text-3xl mb-1">{badge.emoji}</span>
              <p className="text-xs font-bold text-brand-light leading-tight">{badge.name}</p>
              <p className="text-[10px] text-brand-muted mt-0.5 leading-tight">{badge.description}</p>
              {badge.unlocked && badge.unlockedAt && (
                <p className="text-[10px] text-brand-neon mt-1">{new Date(badge.unlockedAt).toLocaleDateString('pt-BR')}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
