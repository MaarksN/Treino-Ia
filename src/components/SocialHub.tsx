import React, { useEffect, useState } from 'react';
import { BookOpen, Dumbbell, Rss, ShieldCheck, Trophy, Users } from 'lucide-react';
import { PublicWorkoutTemplate, SocialProfile } from '../types';
import {
  getMyProfile,
  listPublicWorkoutTemplates,
  publishWorkoutTemplate,
  upsertMyProfile,
} from '../services/socialService';
import { SocialFeed } from './SocialFeed';
import { GroupHub } from './GroupHub';
import { CoachConsole } from './CoachConsole';
import { PublicProfileCard } from './PublicProfileCard';
import { PremiumFeatureGate } from './PremiumPaywall';

type Tab = 'feed' | 'groups' | 'library' | 'coach' | 'profile';

export function SocialHub() {
  const [tab, setTab] = useState<Tab>('feed');
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [templates, setTemplates] = useState<PublicWorkoutTemplate[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('');

  const loadProfile = async () => {
    try {
      const current = await getMyProfile();
      setProfile(current);
      setStatus('');
      if (current) {
        setDisplayName(current.display_name);
        setUsername(current.username);
      }
    } catch (error) {
      setProfile(null);
      setStatus(error instanceof Error ? error.message : 'Supabase ainda não autenticado.');
    }
  };

  const loadTemplates = async () => {
    try {
      setTemplates(await listPublicWorkoutTemplates());
    } catch {
      setTemplates([]);
    }
  };

  useEffect(() => {
    loadProfile();
    loadTemplates();
  }, []);

  const createProfile = async () => {
    if (!displayName.trim()) return;

    try {
      const created = await upsertMyProfile({
        displayName: displayName.trim(),
        username: username.trim() || displayName.trim(),
        bio: 'Atleta do Treino Brutal',
        goal: 'evolução contínua',
      });
      setProfile(created);
      setStatus('Perfil social criado.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível criar perfil social.');
    }
  };

  const publishTemplate = async () => {
    try {
      await publishWorkoutTemplate({
        title: 'Treino Full Body Premium',
        description: 'Template público para força, hipertrofia e consistência.',
        goal: 'hipertrofia',
        level: 'intermediário',
        workout: {
          days: [
            {
              name: 'Full Body A',
              exercises: ['Agachamento', 'Supino', 'Remada', 'Desenvolvimento', 'Prancha'],
            },
          ],
        },
      });

      await loadTemplates();
      setStatus('Template publicado.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível publicar o template.');
    }
  };

  const tabs = [
    { id: 'feed', label: 'Feed', icon: Rss },
    { id: 'groups', label: 'Grupos', icon: Users },
    { id: 'library', label: 'Biblioteca', icon: BookOpen },
    { id: 'coach', label: 'Coach', icon: ShieldCheck },
    { id: 'profile', label: 'Perfil', icon: Trophy },
  ] as const;

  return (
    <div className="min-h-screen bg-brand-dark text-white p-4 md:p-6">
      <header className="max-w-6xl mx-auto mb-8">
        <p className="text-brand-neon font-bold uppercase tracking-[0.25em] text-xs">
          Bloco 7
        </p>
        <h1 className="text-4xl font-black mt-2">Comunidade & Social Real</h1>
        <p className="text-brand-muted mt-2">
          Feed, grupos, rankings, desafios, coach humano, biblioteca pública e perfil compartilhável.
        </p>
        {status && (
          <p className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-300">
            {status}
          </p>
        )}
      </header>

      <nav className="max-w-6xl mx-auto flex flex-wrap gap-2 mb-8">
        {tabs.map(item => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-xl px-4 py-3 font-bold flex items-center gap-2 ${
                tab === item.id ? 'bg-brand-neon text-brand-dark' : 'bg-white/10 text-white'
              }`}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <main className="max-w-6xl mx-auto">
        {tab === 'feed' && <SocialFeed />}
        {tab === 'groups' && (
          <PremiumFeatureGate feature="premium_community">
            <GroupHub currentProfile={profile} />
          </PremiumFeatureGate>
        )}
        {tab === 'coach' && <CoachConsole />}
        {tab === 'profile' && profile && <PublicProfileCard profile={profile} />}
        {tab === 'profile' && !profile && (
          <div className="bg-brand-gray rounded-3xl border border-white/10 p-6">
            <h2 className="text-2xl font-black text-white">Criar perfil social</h2>
            <p className="text-brand-muted mt-2">
              Entre no Supabase/Auth e crie seu perfil público para liberar follows, grupos e posts.
            </p>
            <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3 mt-5">
              <input
                value={displayName}
                onChange={event => setDisplayName(event.target.value)}
                placeholder="Nome público"
                className="bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
              />
              <input
                value={username}
                onChange={event => setUsername(event.target.value)}
                placeholder="username"
                className="bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
              />
              <button type="button" onClick={createProfile} className="bg-brand-neon text-brand-dark rounded-xl px-4 py-3 font-black">
                Criar
              </button>
            </div>
          </div>
        )}

        {tab === 'library' && (
          <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
            <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <Dumbbell className="text-brand-neon" />
                  Biblioteca Pública de Treinos
                </h2>
                <p className="text-brand-muted">
                  Treinos publicados por atletas e coaches.
                </p>
              </div>

              <button type="button" onClick={publishTemplate} className="bg-brand-neon text-brand-dark rounded-xl px-4 py-3 font-black">
                Publicar template demo
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {templates.map(template => (
                <article key={template.id} className="rounded-3xl bg-white/5 border border-white/10 p-5">
                  <p className="text-xs text-brand-neon uppercase tracking-widest">
                    {template.goal ?? 'geral'} · {template.level ?? 'todos'}
                  </p>
                  <h3 className="text-xl font-black text-white mt-2">{template.title}</h3>
                  <p className="text-sm text-brand-muted mt-2">{template.description}</p>
                  <p className="text-xs text-white/50 mt-4">
                    Por @{template.author?.username ?? 'coach'}
                  </p>
                </article>
              ))}
              {templates.length === 0 && <p className="text-brand-muted">Nenhum template público carregado.</p>}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
