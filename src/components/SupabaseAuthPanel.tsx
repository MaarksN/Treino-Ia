import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { signInWithEmail, signUpWithEmail } from '../services/authService';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface Props {
  onAuthenticated?: () => void;
}

export function SupabaseAuthPanel({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signUpWithEmail({ email, password, name });
        setStatus('Conta criada. Confirme o e-mail se o Supabase exigir confirmação.');
      } else {
        await signInWithEmail(email, password);
        setStatus('Sessão Supabase iniciada.');
      }
      onAuthenticated?.();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <section className="bg-brand-gray rounded-3xl border border-yellow-500/30 p-5">
        <h2 className="text-xl font-black text-white">Supabase Auth indisponível</h2>
        <p className="text-sm text-yellow-300 mt-2">
          Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para usar comunidade, grupos, coach e feed com dados reais.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-black text-white">Entrar na comunidade</h2>
          <p className="text-sm text-brand-muted">Ações sociais usam Supabase Auth e RLS.</p>
        </div>

        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="bg-white/10 text-white rounded-xl px-3 py-2 text-sm font-bold"
        >
          {mode === 'signin' ? 'Criar conta' : 'Já tenho conta'}
        </button>
      </div>

      {status && (
        <p className="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-300">
          {status}
        </p>
      )}

      <form onSubmit={submit} className="grid md:grid-cols-[1fr_1fr_auto] gap-3">
        {mode === 'signup' && (
          <input
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder="Nome público"
            className="bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
            maxLength={80}
          />
        )}

        <input
          type="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder="email"
          required
          className="bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
        />

        <input
          type="password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          placeholder="senha"
          required
          minLength={8}
          className="bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-brand-neon text-brand-dark rounded-xl px-4 py-3 font-black flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {mode === 'signin' ? <LogIn size={16} /> : <UserPlus size={16} />}
          {mode === 'signin' ? 'Entrar' : 'Criar'}
        </button>
      </form>
    </section>
  );
}
