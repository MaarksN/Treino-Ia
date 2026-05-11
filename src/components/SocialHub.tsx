import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Dumbbell, LogOut, Rss, Search, ShieldCheck, Trophy, Users } from 'lucide-react';
import { PublicWorkoutTemplate, SocialProfile, WorkoutPlan } from '../types';
import {
  getMyProfile,
  listPublicProfiles,
  listPublicWorkoutTemplates,
  publishWorkoutTemplate,
  upsertMyProfile,
} from '../services/socialService';
import { getCurrentAuthUser, onAuthStateChange, signOut, SupabaseAuthUser } from '../services/authService';
import { SocialFeed } from './SocialFeed';
import { GroupHub } from './GroupHub';
import { CoachConsole } from './CoachConsole';
import { PublicProfileCard } from './PublicProfileCard';
import { PremiumFeatureGate } from './PremiumPaywall';

type Tab = 'feed' | 'groups' | 'library' | 'coach' | 'profile' | 'athletes';

function buildWorkoutTemplatePayload(workoutText: string, currentPlan?: WorkoutPlan | null) {
  if (!workoutText.trim() && currentPlan) {
    return {
      source: 'current_plan',
      dataMode: 'supabase',
      plan: currentPlan,
    };
  }

  return {
    source: 'public_library_form',
    dataMode: 'supabase',
    blocks: workoutText
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map((line, index) => ({
        order: index + 1,
        description: line,
      })),
  };
}

interface Props {
  currentPlan?: WorkoutPlan | null;
}

export function SocialHub({ currentPlan = null }: Props) {
  const [tab, setTab] = useState<Tab>('feed');
  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null);
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [templates, setTemplates] = useState<PublicWorkoutTemplate[]>([]);
  const [athletes, setAthletes] = useState<SocialProfile[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [goal, setGoal] = useState('');
  const [isCoach, setIsCoach] = useState(false);
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateGoal, setTemplateGoal] = useState('');
  const [templateLevel, setTemplateLevel] = useState('');
  const [templateWorkout, setTemplateWorkout] = useState('');
  const [athleteSearch, setAthleteSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const canInteract = useMemo(() => Boolean(authUser && profile), [authUser, profile]);

  const loadProfile = async () => {
    if (!authUser) {
      setProfile(null);
      return;
    }

    try {
      const current = await getMyProfile();
      setProfile(current);
      if (current) {
        setDisplayName(current.display_name);
        setUsername(current.username);
        setBio(current.bio ?? '');
        setGoal(current.goal ?? '');
        setIsCoach(current.is_coach);
      } else {
        setDisplayName(authUser.name);
        setUsername(authUser.name);
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

  const loadAthletes = async (search = athleteSearch) => {
    try {
      setAthletes(await listPublicProfiles(search));
    } catch {
      setAthletes([]);
    }
  };

  const refresh = async () => {
    setLoading(true);
    try {
      await Promise.all([loadProfile(), loadTemplates(), loadAthletes('')]);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentAuthUser()
      .then(setAuthUser)
      .catch(error => setStatus(error instanceof Error ? error.message : 'Não foi possível iniciar sessão social.'));

    return onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ? {
        id: session.user.id,
        email: session.user.email ?? '',
        name: String(session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Atleta'),
      } : null);
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [authUser?.id]);

  useEffect(() => {
    if (!currentPlan) return;
    setTemplateTitle(value => value || currentPlan.planName);
    setTemplateDescription(value => value || currentPlan.goalDescription);
    setTemplateGoal(value => value || currentPlan.goalDescription);
  }, [currentPlan?.id]);

  const createProfile = async () => {
    if (!authUser) {
      setStatus('Entre com Supabase Auth antes de criar o perfil social.');
      return;
    }

    try {
      const created = await upsertMyProfile({
        displayName,
        username,
        bio,
        goal,
        isCoach,
      });
      setProfile(created);
      setStatus('Perfil social salvo.');
      await loadAthletes();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível criar perfil social.');
    }
  };

  const publishTemplate = async () => {
    if (!canInteract) {
      setStatus('Entre e crie seu perfil social para publicar treinos.');
      setTab('profile');
      return;
    }
    if (!templateTitle.trim()) {
      setStatus('Informe um título para publicar o treino.');
      return;
    }
    if (!currentPlan && !templateWorkout.trim()) {
      setStatus('Informe os blocos do treino ou selecione um plano atual.');
      return;
    }

    try {
      await publishWorkoutTemplate({
        title: templateTitle,
        description: templateDescription,
        goal: templateGoal,
        level: templateLevel,
        workout: buildWorkoutTemplatePayload(templateWorkout, currentPlan),
      });

      setTemplateTitle('');
      setTemplateDescription('');
      setTemplateGoal('');
      setTemplateLevel('');
      setTemplateWorkout('');
      await loadTemplates();
      setStatus('Template publicado na biblioteca pública.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível publicar o template.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setProfile(null);
      setStatus('Sessão Supabase encerrada.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível sair.');
    }
  };

  const tabs = [
    { id: 'feed', label: 'Feed', icon: Rss },
    { id: 'groups', label: 'Grupos', icon: Users },
    { id: 'athletes', label: 'Atletas', icon: Search },
    { id: 'library', label: 'Biblioteca', icon: BookOpen },
    { id: 'coach', label: 'Coach', icon: ShieldCheck },
    { id: 'profile', label: 'Perfil', icon: Trophy },
  ] as const;

  return (
    <div className="min-h-screen bg-brand-dark text-white p-4 md:p-6">
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-brand-neon font-bold uppercase tracking-[0.25em] text-xs">
              Bloco 7
            </p>
            <h1 className="text-4xl font-black mt-2">Comunidade & Social Real</h1>
            <p className="text-brand-muted mt-2">
              Feed, grupos, rankings, desafios, coach humano, biblioteca pública e perfil compartilhável.
            </p>
          </div>

          {authUser && (
            <button
              type="button"
              onClick={handleSignOut}
              className="self-start bg-white/10 text-white rounded-xl px-4 py-3 font-bold flex items-center gap-2"
            >
              <LogOut size={16} />
              Sair
            </button>
          )}
        </div>

        {status && (
          <p className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-300">
            {status}
          </p>
        )}
      </header>

      <div className="max-w-6xl mx-auto mb-6">
        {!authUser && <SupabaseAuthPanel onAuthenticated={refresh} />}
        {authUser && !profile && (
          <div className="rounded-3xl border border-brand-neon/30 bg-brand-neon/10 p-4 text-sm text-brand-neon">
            Sessão Supabase ativa. Crie seu perfil social para publicar, seguir atletas, entrar em grupos e usar o coach.
          </div>
        )}
      </div>

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
              O username é único, vira slug público e é protegido por constraint no Supabase.
            </p>
            <div className="grid md:grid-cols-2 gap-3 mt-5">
              <input
                value={displayName}
                onChange={event => setDisplayName(event.target.value)}
                placeholder="Nome público"
                className="bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                maxLength={80}
              />
              <input
                value={username}
                onChange={event => setUsername(event.target.value)}
                placeholder="username"
                className="bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                maxLength={24}
              />
              <input
                value={goal}
                onChange={event => setGoal(event.target.value)}
                placeholder="Objetivo"
                className="bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                maxLength={120}
              />
              <label className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isCoach}
                  onChange={event => setIsCoach(event.target.checked)}
                  className="accent-lime-400"
                />
                Sou coach
              </label>
              <textarea
                value={bio}
                onChange={event => setBio(event.target.value)}
                placeholder="Bio pública"
                className="md:col-span-2 bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none min-h-24"
                maxLength={500}
              />
            </div>
            <button type="button" onClick={createProfile} className="mt-4 bg-brand-neon text-brand-dark rounded-xl px-4 py-3 font-black">
              Salvar perfil
            </button>
          </div>
        )}

        {tab === 'athletes' && (
          <section className="space-y-4">
            <div className="bg-brand-gray rounded-3xl border border-white/10 p-5">
              <h2 className="text-2xl font-black text-white mb-3">Seguir atletas</h2>
              <div className="flex gap-2">
                <input
                  value={athleteSearch}
                  onChange={event => setAthleteSearch(event.target.value)}
                  placeholder="Buscar por username ou nome"
                  className="flex-1 bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none min-w-0"
                />
                <button
                  type="button"
                  onClick={() => loadAthletes(athleteSearch)}
                  className="bg-brand-neon text-brand-dark rounded-xl px-4 py-3 font-black flex items-center gap-2"
                >
                  <Search size={16} />
                  Buscar
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {athletes.map(athlete => (
                <PublicProfileCard key={athlete.id} profile={athlete} showQr={false} />
              ))}
              {athletes.length === 0 && <p className="text-brand-muted">Nenhum atleta público encontrado.</p>}
            </div>
          </section>
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
                  Treinos publicados por atletas e coaches autenticados.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-5">
              <h3 className="font-black text-white mb-3">Publicar treino</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  value={templateTitle}
                  onChange={event => setTemplateTitle(event.target.value)}
                  placeholder="Título"
                  className="bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                  maxLength={120}
                />
                <input
                  value={templateGoal}
                  onChange={event => setTemplateGoal(event.target.value)}
                  placeholder="Objetivo"
                  className="bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                  maxLength={80}
                />
                <input
                  value={templateLevel}
                  onChange={event => setTemplateLevel(event.target.value)}
                  placeholder="Nível"
                  className="bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                  maxLength={40}
                />
                <input
                  value={templateDescription}
                  onChange={event => setTemplateDescription(event.target.value)}
                  placeholder="Descrição"
                  className="bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                  maxLength={800}
                />
                <textarea
                  value={templateWorkout}
                  onChange={event => setTemplateWorkout(event.target.value)}
                  placeholder="Uma linha por bloco ou exercício do treino"
                  className="md:col-span-2 bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none min-h-28"
                />
              </div>
              <button type="button" onClick={publishTemplate} className="mt-3 bg-brand-neon text-brand-dark rounded-xl px-4 py-3 font-black">
                Publicar na biblioteca
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
