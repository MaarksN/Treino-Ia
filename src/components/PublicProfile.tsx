import React, { useState } from 'react';
import { Dumbbell, Flame, Share2, Trophy, UserRound } from 'lucide-react';
import { PublicProfile as PublicProfileData } from '../types';

interface Props {
  profile: PublicProfileData;
  onToggleVisibility?: (isPublic: boolean) => void;
}

export function PublicProfile({ profile, onToggleVisibility }: Props) {
  const [status, setStatus] = useState('');
  const shareUrl = `${window.location.origin}/perfil/${encodeURIComponent(profile.username.replace(/^@/, ''))}`;

  const handleShare = async () => {
    const text = `${profile.username} no Treino App\n${profile.goal}\n${profile.totalWorkouts} treinos | streak ${profile.currentStreak} dias`;

    try {
      if (navigator.share) {
        await navigator.share({ title: `${profile.username} no Treino App`, text, url: shareUrl });
      } else {
        await navigator.clipboard?.writeText(`${text}\n${shareUrl}`);
        setStatus('Link copiado.');
      }
    } catch {
      setStatus('Compartilhamento cancelado.');
    }
  };

  return (
    <div className="bg-brand-gray border border-white/10 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-brand-neon/20 border border-brand-neon/40 flex items-center justify-center">
            <UserRound size={22} className="text-brand-neon" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-black text-lg truncate">{profile.username || '@atleta'}</p>
            <p className="text-brand-muted text-xs">{profile.isPublic ? 'Perfil público' : 'Perfil privado'}</p>
          </div>
        </div>
        {onToggleVisibility && (
          <button
            type="button"
            onClick={() => onToggleVisibility(!profile.isPublic)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
              profile.isPublic
                ? 'border-brand-neon/40 text-brand-neon bg-brand-neon/10'
                : 'border-white/10 text-brand-muted bg-white/5'
            }`}
          >
            {profile.isPublic ? 'Público' : 'Privado'}
          </button>
        )}
      </div>

      {profile.bio && <p className="text-white/80 text-sm mb-4">{profile.bio}</p>}

      <div className="p-4 rounded-xl bg-brand-dark border border-white/10 mb-4">
        <p className="text-xs uppercase tracking-widest text-brand-muted mb-1">Objetivo</p>
        <p className="text-white font-semibold">{profile.goal}</p>
        {profile.favoriteSplit && (
          <p className="text-brand-neon text-xs mt-2 flex items-center gap-1">
            <Dumbbell size={13} /> Split favorito: {profile.favoriteSplit}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-4 rounded-xl bg-brand-dark border border-white/10">
          <Trophy size={18} className="text-yellow-400 mb-2" />
          <p className="text-white font-black text-2xl">{profile.totalWorkouts}</p>
          <p className="text-brand-muted text-xs">Treinos</p>
        </div>
        <div className="p-4 rounded-xl bg-brand-dark border border-white/10">
          <Flame size={18} className="text-orange-400 mb-2" />
          <p className="text-white font-black text-2xl">{profile.currentStreak}</p>
          <p className="text-brand-muted text-xs">Dias de streak</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs uppercase tracking-widest text-brand-muted mb-2">Badges</p>
        {profile.badges.length ? (
          <div className="flex flex-wrap gap-2">
            {profile.badges.map(badge => (
              <span key={badge} className="px-2 py-1 rounded-full text-xs bg-brand-neon/10 text-brand-neon border border-brand-neon/30">
                {badge}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-brand-muted text-sm">Nenhum badge desbloqueado ainda.</p>
        )}
      </div>

      {profile.isPublic && (
        <button
          type="button"
          onClick={handleShare}
          className="w-full py-3 rounded-xl bg-brand-neon text-brand-dark font-bold flex items-center justify-center gap-2"
        >
          <Share2 size={16} /> Compartilhar perfil
        </button>
      )}

      {status && <p className="text-brand-muted text-xs mt-3 text-center">{status}</p>}
    </div>
  );
}
