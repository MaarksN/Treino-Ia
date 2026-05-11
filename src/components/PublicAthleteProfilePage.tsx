import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { SocialPost, SocialProfile } from '../types';
import { getProfileByUsername, listPostsByAuthor } from '../services/socialService';
import { getUsernameFromPath, timeAgo } from '../utils/socialUtils';
import { PublicProfileCard } from './PublicProfileCard';

export function PublicAthleteProfilePage() {
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const username = getUsernameFromPath();

  useEffect(() => {
    const load = async () => {
      if (!username) {
        setStatus('Username público não informado.');
        setLoading(false);
        return;
      }

      try {
        const nextProfile = await getProfileByUsername(username);
        setProfile(nextProfile);
        if (nextProfile) {
          setPosts(await listPostsByAuthor(nextProfile.id));
          setStatus('');
        } else {
          setStatus('Perfil público não encontrado.');
        }
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'Não foi possível carregar o perfil público.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [username]);

  return (
    <main className="max-w-4xl mx-auto space-y-5">
      <button
        type="button"
        onClick={() => {
          window.history.pushState({}, '', '/');
          window.location.reload();
        }}
        className="text-brand-neon hover:text-brand-magenta text-sm font-bold uppercase tracking-widest font-mono transition-colors flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      {loading && (
        <div className="bg-brand-gray rounded-3xl border border-white/10 p-5 text-brand-muted">
          Carregando perfil público...
        </div>
      )}

      {status && (
        <div className="bg-brand-gray rounded-3xl border border-yellow-500/30 p-5 text-yellow-300">
          {status}
        </div>
      )}

      {profile && (
        <>
          <PublicProfileCard profile={profile} />

          <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
            <h2 className="text-2xl font-black text-white mb-4">Feed público</h2>
            <div className="space-y-3">
              {posts.map(post => (
                <article key={post.id} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <p className="text-xs text-brand-muted">{timeAgo(post.created_at)}</p>
                  <h3 className="text-lg text-white font-black mt-1">{post.title}</h3>
                  {post.body && <p className="text-sm text-white/75 mt-2">{post.body}</p>}
                  {post.metric_label && (
                    <p className="mt-3 text-brand-neon font-bold">
                      {post.metric_label}: {post.metric_value}
                    </p>
                  )}
                </article>
              ))}
              {posts.length === 0 && <p className="text-brand-muted">Este atleta ainda não publicou conquistas.</p>}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
