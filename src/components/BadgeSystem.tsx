
import React, { useState } from 'react';
import { CosmeticItem } from '../services/gamificationService';

interface Props {
  cosmetics: CosmeticItem[];
  onDismiss?: () => void;
  newlyUnlocked?: any[];
}

export function BadgeSystem({ cosmetics = [], newlyUnlocked = [], onDismiss }: Props) {
  const [filter, setFilter] = useState<CosmeticItem['type'] | 'all'>('all');

  const badges = cosmetics.filter(c => c.type === 'badge');
  const titles = cosmetics.filter(c => c.type === 'title');
  const displayItems = [...badges, ...titles];

  const filtered = filter === 'all' ? displayItems : displayItems.filter(item => item.type === filter);
  const unlockedCount = displayItems.filter(item => item.unlocked).length;

  const categories: Array<{ id: CosmeticItem['type'] | 'all'; label: string }> = [
    { id: 'all', label: 'Todos' },
    { id: 'badge', label: 'Emblemas' },
    { id: 'title', label: 'Títulos' },
  ];

  return (
    <>
      {newlyUnlocked.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {newlyUnlocked.map(item => (
            <div key={item.id} className="flex items-center gap-3 bg-brand-gray border-2 border-brand-neon/50 p-4 shadow-2xl">
              <span className="text-4xl">{item.emoji}</span>
              <div className="min-w-0">
                <p className="text-xs text-brand-neon font-bold uppercase tracking-widest">Conquista desbloqueada</p>
                <p className="text-brand-light font-bold">{item.name}</p>
                <p className="text-brand-muted text-xs">{item.description}</p>
              </div>
              <button onClick={onDismiss} type="button" className="text-brand-muted hover:text-brand-light ml-2">x</button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light">Cosméticos</h3>
          <p className="text-brand-muted text-sm">{unlockedCount}/{displayItems.length}</p>
        </div>

        {displayItems.length > 0 && (
          <div className="mb-4 h-2 bg-white/10 overflow-hidden">
            <div className="h-full bg-brand-neon transition-all duration-700" style={{ width: `${(unlockedCount / displayItems.length) * 100}%` }} />
          </div>
        )}

        <div className="flex gap-2 flex-wrap mb-4">
          {categories.map(category => (
            <button
              key={category.id}
              type="button"
              onClick={() => setFilter(category.id as any)}
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
          {filtered.map(item => (
            <div key={item.id} className={`flex flex-col items-center p-3 border-2 text-center transition-all ${item.unlocked ? 'border-brand-neon/30 bg-brand-neon/5' : 'border-brand-light/5 bg-brand-dark opacity-45 grayscale'}`}>
              <span className="text-3xl mb-1">{item.emoji}</span>
              <p className="text-xs font-bold text-brand-light leading-tight">{item.name}</p>
              <p className="text-[10px] text-brand-muted mt-0.5 leading-tight">{item.description}</p>
              {item.equipped && (
                <p className="text-[10px] text-brand-neon font-bold mt-1 uppercase tracking-widest">Equipado</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
