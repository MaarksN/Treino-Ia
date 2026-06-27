import React, { useState, useCallback } from 'react';
import { Users, Swords, Hexagon, Component, EyeOff, Loader2, MapPin } from 'lucide-react';
import { UserProfile } from '../../services/database';
import {
  findFairRival,
  calculateLocalSkillTree,
  applySocialBlurPolicy,
  RivalMatch,
  SkillTreeAttribute,
} from '../../services/advancedSocial/advancedSocialService';

interface AdvancedSocialHubProps {
  profile: UserProfile;
}

export function AdvancedSocialHub({ profile }: AdvancedSocialHubProps) {
  const [showRival, setShowRival] = useState(false);
  const [rival, setRival] = useState<RivalMatch | null>(null);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);

  const skillTree = calculateLocalSkillTree({
    strength: profile.timePerWorkout * 1.5,
    endurance: profile.daysPerWeek * 10,
    mobility: 20,
  });

  const blurredContent = applySocialBlurPolicy('post-123', true, 16);

  const handleFindRival = async () => {
    const newRival = await findFairRival(profile.id, profile.level);
    setRival(newRival);
    setShowRival(true);
  };

  const handleRequestLocation = useCallback(() => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
      },
      (err) => {
        console.error('Geo error:', err);
        alert('Nao foi possivel obter sua localizacao.');
        setLocLoading(false);
      }
    );
  }, []);

  return (
    <section className="mb-8 rounded-[28px] border-4 border-brand-neon bg-brand-gray p-6 shadow-brutal-neon">
      <h2 className="mb-6 flex items-center gap-3 font-display text-4xl uppercase text-brand-light">
        <Users className="h-8 w-8 text-brand-neon" />
        Advanced Social
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Guildas / Geo */}
        <div className="rounded-2xl border-2 border-brand-light/10 bg-brand-dark p-5">
          <h3 className="mb-3 flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-brand-neon">
            <Hexagon className="h-5 w-5" />
            Guildas Locais
          </h3>
          {location ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-brand-neon">
                <MapPin className="h-4 w-4" />
                <span className="font-mono text-[10px] uppercase">Busca Ativa (2km)</span>
              </div>
              <p className="font-mono text-sm text-brand-light">Guilda: <strong>Vila Olimpia Iron</strong></p>
              <p className="text-xs text-brand-muted">12 membros ativos proximos.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-brand-muted">
                O compartilhamento de localização está desativado. Consinta para ver guildas próximas.
              </p>
              <button
                onClick={handleRequestLocation}
                disabled={locLoading}
                className="mt-4 flex items-center gap-2 rounded border-2 border-brand-neon px-4 py-2 font-mono text-xs uppercase text-brand-neon hover:bg-brand-neon hover:text-brand-dark disabled:opacity-50"
              >
                {locLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Ativar Localização'}
              </button>
            </>
          )}
        </div>

        {/* Rivais Justos */}
        <div className="rounded-2xl border-2 border-brand-light/10 bg-brand-dark p-5">
          <h3 className="mb-3 flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-brand-magenta">
            <Swords className="h-5 w-5" />
            Rivais Justos
          </h3>
          {!showRival ? (
            <button
              onClick={handleFindRival}
              className="rounded border-2 border-brand-magenta px-4 py-2 font-mono text-xs uppercase text-brand-magenta hover:bg-brand-magenta hover:text-brand-dark"
            >
              Encontrar Rival
            </button>
          ) : (
            <div className="text-sm text-brand-light">
              <p>
                Seu rival: <strong className="text-brand-magenta">{rival?.rivalName}</strong>
              </p>
              <p className="text-brand-muted">
                Nível: {rival?.rivalLevel} (Score: {(rival?.matchingScore ?? 0) * 100}%)
              </p>
            </div>
          )}
        </div>

        {/* Skill Tree */}
        <div className="rounded-2xl border-2 border-brand-light/10 bg-brand-dark p-5">
          <h3 className="mb-3 flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-brand-light">
            <Component className="h-5 w-5" />
            Skill Tree
          </h3>
          <ul className="space-y-2 text-sm">
            {skillTree.map((skill) => (
              <li
                key={skill.id}
                className="flex justify-between border-b border-brand-light/5 pb-1"
              >
                <span className="text-brand-light/80">{skill.name}</span>
                <span className="font-mono text-brand-neon">Lvl {skill.currentLevel}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Workout Replays / Social Blur */}
        <div className="rounded-2xl border-2 border-brand-light/10 bg-brand-dark p-5">
          <h3 className="mb-3 flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-brand-muted">
            <EyeOff className="h-5 w-5" />
            Conteúdo / Replays
          </h3>
          <div className="space-y-3">
            <div className="rounded border border-brand-light/10 bg-brand-light/5 p-3 text-center">
              <span className="text-xs text-brand-muted">
                Replay Holográfico Indisponível (Mocked)
              </span>
            </div>
            {blurredContent.isBlurred && (
              <div className="rounded border border-brand-magenta/30 bg-brand-magenta/10 p-3 text-center">
                <span className="text-xs text-brand-magenta">
                  Conteúdo sensível desfocado. {blurredContent.reason}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
