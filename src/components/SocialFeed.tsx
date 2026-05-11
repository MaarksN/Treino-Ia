import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Send, Trophy } from 'lucide-react';
import { SocialComment, SocialPost } from '../types';
import {
  addComment,
  createAchievementPost,
  createPost,
  likePost,
  listComments,
  listFeed,
  subscribeToFeed,
} from '../services/socialService';
import { timeAgo } from '../utils/socialUtils';

export function SocialFeed() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [comments, setComments] = useState<Record<string, SocialComment[]>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');

  const load = async () => {
    try {
      setPosts(await listFeed());
      setStatus('');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível carregar o feed.');
    }
  };

  useEffect(() => {
    load();
    const channel = subscribeToFeed(load);
    return () => {
      channel.unsubscribe();
    };
  }, []);

  const publish = async () => {
    if (!title.trim()) return;

    try {
      await createPost({
        type: 'text',
        title: title.trim(),
        body: body.trim(),
      });
      setTitle('');
      setBody('');
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível publicar.');
    }
  };

  const sharePr = async () => {
    try {
      await createAchievementPost({
        title: 'Novo PR registrado 🏆',
        body: 'Bati meu recorde pessoal no treino de hoje.',
        metricLabel: 'PR',
        metricValue: '+ carga máxima',
      });
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível compartilhar o PR.');
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
    const text = commentText[postId]?.trim();
    if (!text) return;

    try {
      await addComment(postId, text);
      setCommentText(previous => ({ ...previous, [postId]: '' }));
      await openComments(postId);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível comentar.');
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

        <input
          value={title}
          onChange={event => setTitle(event.target.value)}
          placeholder="O que você conquistou hoje?"
          className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white mb-3 outline-none"
        />

        <textarea
          value={body}
          onChange={event => setBody(event.target.value)}
          placeholder="Conte rapidamente sua evolução..."
          className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white min-h-24 outline-none"
        />

        <div className="flex gap-3 mt-4 flex-wrap">
          <button type="button" onClick={publish} className="bg-brand-neon text-brand-dark rounded-xl px-4 py-3 font-bold flex items-center gap-2">
            <Send size={16} />
            Publicar
          </button>

          <button type="button" onClick={sharePr} className="bg-white/10 text-white rounded-xl px-4 py-3 font-bold flex items-center gap-2">
            <Trophy size={16} />
            Compartilhar PR
          </button>
        </div>
      </div>

      {posts.map(post => (
        <article key={post.id} className="bg-brand-gray rounded-3xl border border-white/10 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-brand-neon/20 flex items-center justify-center">
              {post.author?.avatar_url ? (
                <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                '🏋️'
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

          <div className="flex gap-3 mt-5">
            <button type="button" onClick={() => likePost(post.id).then(load).catch(() => setStatus('Não foi possível curtir.'))} className="text-white/70 hover:text-brand-neon flex items-center gap-2">
              <Heart size={18} />
              Curtir
            </button>

            <button type="button" onClick={() => openComments(post.id)} className="text-white/70 hover:text-brand-neon flex items-center gap-2">
              <MessageCircle size={18} />
              Comentar
            </button>
          </div>

          {comments[post.id] && (
            <div className="mt-4 space-y-3">
              {comments[post.id].map(comment => (
                <div key={comment.id} className="rounded-2xl bg-white/5 p-3">
                  <p className="text-xs text-brand-muted">@{comment.author?.username ?? 'usuario'}</p>
                  <p className="text-sm text-white">{comment.body}</p>
                </div>
              ))}

              <div className="flex gap-2">
                <input
                  value={commentText[post.id] ?? ''}
                  onChange={event => setCommentText(previous => ({ ...previous, [post.id]: event.target.value }))}
                  placeholder="Escreva um comentário..."
                  className="flex-1 bg-brand-dark border border-white/10 rounded-xl px-4 py-2 text-white outline-none min-w-0"
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
