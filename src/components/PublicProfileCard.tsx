import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Award, MapPin, QrCode, UserPlus, Zap } from 'lucide-react';
import { SocialProfile } from '../types';
import { createPublicProfileUrl, formatSocialNumber } from '../utils/socialUtils';
import { followUser } from '../services/socialService';
import { SocialReportButton } from './SocialReportButton';

interface Props {
  profile: SocialProfile;
  showQr?: boolean;
  canInteract?: boolean;
  onAuthRequired?: () => void;
}

export function PublicProfileCard({ profile, showQr = true, canInteract = true, onAuthRequired }: Props) {
  const [status, setStatus] = useState('');
  const publicUrl = createPublicProfileUrl(profile.username);

  const handleFollow = async () => {
    setStatus('');
    if (!canInteract) {
      setStatus('Entre com Supabase Auth para seguir atletas.');
      onAuthRequired?.();
      return;
    }

    try {
      await followUser(profile.id);
      setStatus('Seguindo atleta.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível seguir agora.');
    }
  };

  return (
    <section className="bg-brand-gray rounded-3xl border border-white/10 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-brand-neon/20 flex items-center justify-center text-2xl shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              '💪'
            )}
          </div>

          <div className="min-w-0">
            <h2 className="text-2xl font-black text-white truncate">{profile.display_name}</h2>
            <p className="text-sm text-brand-muted">@{profile.username}</p>
            {profile.city && (
              <p className="text-xs text-white/60 flex items-center gap-1 mt-1">
                <MapPin size={12} /> {profile.city}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleFollow}
          className="bg-brand-neon text-brand-dark rounded-xl px-4 py-2 font-bold flex items-center gap-2 shrink-0"
        >
          <UserPlus size={16} />
          Seguir
        </button>
      </div>

      <div className="mt-3">
        <SocialReportButton
          targetType="profile"
          targetId={profile.id}
          canInteract={canInteract}
          onAuthRequired={onAuthRequired}
        />
      </div>

      {status && <p className="mt-3 text-xs text-brand-muted">{status}</p>}

      {profile.bio && <p className="text-white/80 mt-5 leading-relaxed">{profile.bio}</p>}

      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs text-brand-muted">Treinos</p>
          <strong className="text-xl text-white">{formatSocialNumber(profile.total_workouts)}</strong>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs text-brand-muted">Streak</p>
          <strong className="text-xl text-white">{profile.current_streak}d</strong>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs text-brand-muted">Volume</p>
          <strong className="text-xl text-white">{formatSocialNumber(Number(profile.total_volume))}kg</strong>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Award className="text-brand-neon" size={18} />
          <h3 className="font-bold text-white">Timeline de badges</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {profile.badges?.length ? (
            profile.badges.map(badge => (
              <span key={badge.id} className="rounded-full bg-brand-neon/10 border border-brand-neon/20 px-3 py-1 text-sm text-brand-neon">
                {badge.emoji} {badge.name}
              </span>
            ))
          ) : (
            <span className="text-sm text-brand-muted">Nenhum badge público ainda.</span>
          )}
        </div>
      </div>

      {showQr && (
        <div className="mt-6 flex items-center gap-4 p-4 rounded-2xl bg-white/5">
          <div className="bg-white p-2 rounded-xl shrink-0">
            <QRCodeSVG value={publicUrl} size={96} />
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold flex items-center gap-2">
              <QrCode size={16} />
              QR Code do perfil
            </p>
            <p className="text-sm text-brand-muted break-all">{publicUrl}</p>
          </div>
        </div>
      )}

      {profile.is_coach && (
        <div className="mt-4 rounded-2xl bg-brand-neon/10 border border-brand-neon/20 p-4 text-brand-neon flex items-center gap-2">
          <Zap size={18} />
          Coach verificado na plataforma
        </div>
      )}
    </section>
  );
}
