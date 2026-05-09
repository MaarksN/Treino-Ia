import React, { useState } from 'react';
import { Globe2, Heart, MessageCircle, Flame, Dumbbell } from 'lucide-react';

const FAKE_POSTS = [
  {
    id: 1,
    user: { name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=sarah', country: '🇧🇷' },
    time: '2 mins atrás',
    action: 'destruiu',
    workoutName: 'Perna Psicopata',
    stats: '15.000 kg levantados',
    likes: 12,
  },
  {
    id: 2,
    user: { name: 'Koji', avatar: 'https://i.pravatar.cc/150?u=koji', country: '🇯🇵' },
    time: '45 mins atrás',
    action: 'completou',
    workoutName: 'Upper Body Finisher',
    stats: 'Novo PR no Supino (110kg)',
    likes: 34,
  },
  {
    id: 3,
    user: { name: 'Elena', avatar: 'https://i.pravatar.cc/150?u=elena', country: '🇪🇸' },
    time: '1 hora atrás',
    action: 'sobreviveu a',
    workoutName: 'Cardio Mortal 3000',
    stats: '600 kcal queimadas',
    likes: 8,
  },
];

export function GlobalFeed() {
  const [likes, setLikes] = useState<Record<number, boolean>>({});

  const toggleLike = (id: number) => {
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 mt-8">
      <div className="flex items-center mb-8 border-b-4 border-brand-neon pb-4">
        <Globe2 className="w-10 h-10 text-brand-neon mr-4" />
        <div>
          <h1 className="font-display font-black text-6xl tracking-tighter uppercase text-brand-light text-shadow-neon">Arena Global</h1>
          <p className="text-brand-magenta font-mono font-bold">Atletas ao redor do mundo esculpindo resultados reais.</p>
        </div>
      </div>

      <div className="space-y-6">
        {FAKE_POSTS.map(post => {
          const isLiked = likes[post.id];
          return (
            <div key={post.id} className="bg-brand-gray border-2 border-brand-light/20 p-6 shadow-[4px_4px_0px_rgba(255,255,255,0.1)] hover:border-brand-neon transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img src={post.user.avatar} alt={post.user.name} className="w-12 h-12 border-2 border-brand-neon object-cover" />
                  <div>
                    <h3 className="font-bold text-brand-light font-mono uppercase tracking-widest text-sm flex items-center">
                      {post.user.name} <span className="ml-2">{post.user.country}</span>
                    </h3>
                    <p className="text-xs text-brand-muted">{post.time}</p>
                  </div>
                </div>
                <div className="hidden md:flex text-brand-neon bg-brand-neon/10 px-3 py-1 font-bold text-xs uppercase">
                  <Flame className="w-4 h-4 mr-1" /> On Fire
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-brand-light text-lg">
                  <span className="text-brand-muted">{post.action}</span>{' '}
                  <span className="font-display text-2xl font-black text-brand-neon tracking-wider">{post.workoutName}</span>
                </p>
                <div className="mt-2 inline-flex items-center bg-brand-dark px-3 py-1.5 border border-brand-magenta/30 text-brand-magenta font-mono text-xs font-bold uppercase">
                  <Dumbbell className="w-3 h-3 mr-2" /> {post.stats}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-brand-light/10">
                <button 
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center text-sm font-bold uppercase transition-colors ${isLiked ? 'text-brand-magenta' : 'text-brand-muted hover:text-brand-light'}`}
                >
                  <Heart fill={isLiked ? "currentColor" : "none"} className="w-5 h-5 mr-2" />
                  {post.likes + (isLiked ? 1 : 0)}
                </button>
                <button className="flex items-center text-sm font-bold uppercase text-brand-muted hover:text-brand-light transition-colors">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Comentar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
