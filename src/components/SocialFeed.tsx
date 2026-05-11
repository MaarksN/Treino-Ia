import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Send, Trophy } from 'lucide-react';
import { SocialComment, SocialPost } from '../types';
import {
  addComment,
  createPersonalRecordPost,
  createPost,
  listComments,
  listFeed,
  subscribeToFeed,
  toggleLikePost,
} from '../services/socialService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { timeAgo } from '../utils/socialUtils';
import { SocialReportButton } from './SocialReportButton';

interface Props {
  canInteract?: boolean;
  onAuthRequired?: () => void;
}

export function SocialFeed({ canInteract = true, onAuthRequired }: Props) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [prExercise, setPrExercise] = useState('');
  const [prWeight, setPrWeight] = useState('');
  const [prReps, setPrReps] = useState('');
  const [comments, setComments] = useState<Record<string, SocialComment[]>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const requireAuth = () => {
    if (canInteract) return true;
    setStatus('Entre com Supabase Auth para publicar, curtir ou comentar.');
    onAuthRequired?.();
    return false;
  };

  const load = async () => {
    setLoading(true);
    try {
      setPosts(await listFeed());
      setStatus('');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível carregar o feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (!isSupabaseConfigured) return undefined;

    const channel = subscribeToFeed(load);
    return () => {
      channel.unsubscribe();
    };
  }, []);

  const publish = async () => {
    if (!requireAuth()) return;

    setSubmitting(true);
    try {
      await createPost({
        type: 'text',
        title,
        body,
      });
      setTitle('');
      setBody('');
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível publicar.');
    } finally {
      setSubmitting(false);
    }
  };

  const sharePr = async () => {
    if (!requireAuth()) return;

    setSubmitting(true);
    try {
      await createPersonalRecordPost({
        exerciseName: prExercise,
        weight: Number(prWeight),
        reps: Number(prReps),
        note: body,
      });
      setPrExercise('');
      setPrWeight('');
      setPrReps('');
      setBody('');
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível compartilhar o PR.');
    } finally {
      setSubmitting(false);
    }
  };

  const openComments = async (postId: string) => {
    setComments(previous => ({ ...previous, [postId]: previous[postId] ?? [] }));
    try {
      const rows = await listComments(postId);
      setComments(previous => ({ ...previous, [postId]: rows }));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível carregar comentários.');
    }
  };

  const sendComment = async (postId: string) => {
    if (!requireAuth()) return;

    const text = commentText[postId]?.trim();
    if (!text) return;

    try {
      await addComment(postId, text);
      setCommentText(previous => ({ ...previous, [postId]: '' }));
      await openComments(postId);
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível comentar.');
    }
  };

  const toggleLike = async (post: SocialPost) => {
    if (!requireAuth()) return;

    try {
      await toggleLikePost(post);
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível atualizar curtida.');
    }
  };

  return (
    <section className="space-y-5">
      <div className="bg-brand-gray rounded-3xl border border-white/10 p-5">
        <h2 className="text-xl font-black text-white mb-4">Feed de Conquistas</h2>

        {status && (
          <div className="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-300">
            {status}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4">
          <div>
            <input
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="O que você conquistou hoje?"
              className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white mb-3 outline-none"
              maxLength={140}
            />

            <textarea
              value={body}
              onChange={event => setBody(event.target.value)}
              placeholder="Contexto, sensações ou detalhes do treino..."
              className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white min-h-24 outline-none"
              maxLength={1000}
            />

            <button
              type="button"
              onClick={publish}
              disabled={submitting}
              className="mt-4 bg-brand-neon text-brand-dark rounded-xl px-4 py-3 font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={16} />
              Publicar conquista
            </button>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <h3 className="font-black text-white flex items-center gap-2 mb-3">
              <Trophy className="text-brand-neon" size={18} />
              Compartilhar PR no feed
            </h3>

            <div className="grid sm:grid-cols-[1fr_100px_100px] gap-3">
              <input
                value={prExercise}
                onChange={event => setPrExercise(event.target.value)}
                placeholder="Exercício"
                className="bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                maxLength={80}
              />
              <input
                value={prWeight}
                onChange={event => setPrWeight(event.target.value)}
                inputMode="decimal"
                placeholder="kg"
                className="bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
              />
              <input
                value={prReps}
                onChange={event => setPrReps(event.target.value)}
                inputMode="numeric"
                placeholder="reps"
                className="bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>

            <button
              type="button"
              onClick={sharePr}
              disabled={submitting}
              className="mt-3 bg-white/10 text-white rounded-xl px-4 py-3 font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <Trophy size={16} />
              Publicar PR
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-brand-gray rounded-3xl border border-white/10 p-5 text-brand-muted">
          Carregando feed...
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="bg-brand-gray rounded-3xl border border-white/10 p-5 text-brand-muted">
          Nenhuma conquista publicada ainda.
        </div>
      )}

      {posts.map(post => (
        <article key={post.id} className="bg-brand-gray rounded-3xl border border-white/10 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-brand-neon/20 flex items-center justify-center overflow-hidden">
              {post.author?.avatar_url ? (
                <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-brand-neon font-black">{post.author?.display_name?.charAt(0) ?? 'A'}</span>
              )}
            </div>

            <div>
              <p className="font-bold text-white">{post.author?.display_name ?? 'Atleta'}</p>
              <p className="text-xs text-brand-muted">@{post.author?.username ?? 'usuario'} · {timeAgo(post.created_at)}</p>
            </div>
          </div>

          <h3 className="text-lg font-black text-white">{post.title}</h3>
          {post.body && <p className="text-white/75 mt-2">{post.body}</p>}

          {post.metric_label && (
            <div className="mt-4 rounded-2xl bg-brand-neon/10 border border-brand-neon/20 p-4">
              <p className="text-xs text-brand-neon uppercase tracking-widest">{post.metric_label}</p>
              <p className="text-2xl font-black text-white">{post.metric_value}</p>
            </div>
          )}

          <div className="flex gap-4 mt-5">
            <button
              type="button"
              onClick={() => toggleLike(post)}
              className={`${post.liked_by_me ? 'text-brand-neon' : 'text-white/70'} hover:text-brand-neon flex items-center gap-2`}
            >
              <Heart size={18} fill={post.liked_by_me ? 'currentColor' : 'none'} />
              {post.likes_count ?? 0}
            </button>

            <button type="button" onClick={() => openComments(post.id)} className="text-white/70 hover:text-brand-neon flex items-center gap-2">
              <MessageCircle size={18} />
              {post.comments_count ?? 0}
            </button>
            <SocialReportButton
              targetType="post"
              targetId={post.id}
              canInteract={canInteract}
              onAuthRequired={onAuthRequired}
            />
          </div>

          {comments[post.id] && (
            <div className="mt-4 space-y-3">
              {comments[post.id].map(comment => (
                <div key={comment.id} className="rounded-2xl bg-white/5 p-3">
                  <p className="text-xs text-brand-muted">@{comment.author?.username ?? 'usuario'}</p>
                  <p className="text-sm text-white">{comment.body}</p>
                  <div className="mt-2">
                    <SocialReportButton
                      targetType="comment"
                      targetId={comment.id}
                      canInteract={canInteract}
                      onAuthRequired={onAuthRequired}
                    />
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <input
                  value={commentText[post.id] ?? ''}
                  onChange={event => setCommentText(previous => ({ ...previous, [post.id]: event.target.value }))}
                  placeholder="Escreva um comentário..."
                  className="flex-1 bg-brand-dark border border-white/10 rounded-xl px-4 py-2 text-white outline-none min-w-0"
                  maxLength={500}
                />
                <button type="button" onClick={() => sendComment(post.id)} className="bg-brand-neon text-brand-dark rounded-xl px-4 font-bold">
                  Enviar
                </button>
              </div>
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
