import { memo } from 'react';
import { Cloud, Database, ShieldAlert } from 'lucide-react';
import { type PersistenceStatus } from '../../../services/database';

const fieldClass = 'mt-2 w-full rounded-[22px] border-2 border-brand-light/15 bg-brand-gray px-4 py-3 font-mono text-sm text-brand-light outline-none transition-colors placeholder:text-brand-muted focus:border-brand-neon';

interface CloudPanelProps {
  persistence: PersistenceStatus | null;
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
}

export const CloudPanel = memo(function CloudPanel({
  persistence,
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  onSignIn,
  onSignUp,
  onSignOut,
}: CloudPanelProps) {
  if (!persistence) return null;

  return (
    <section className="mb-8 rounded-[28px] border-2 border-brand-light/15 bg-brand-gray/80 p-5 shadow-brutal-light">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-4">
          <div className={`rounded-[22px] border-2 p-3 ${persistence.mode === 'supabase' ? 'border-brand-neon text-brand-neon' : 'border-brand-magenta text-brand-magenta'}`}>
            {persistence.mode === 'supabase' ? <Cloud className="h-6 w-6" /> : <Database className="h-6 w-6" />}
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">
              Persistência
            </p>
            <h3 className="font-display text-3xl uppercase text-brand-light">
              {persistence.mode === 'supabase' ? 'Supabase Cloud' : 'Local'}
            </h3>
            <p className="mt-1 font-mono text-xs text-brand-light/70">{persistence.message}</p>
          </div>
        </div>

        {persistence.authenticated ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="rounded-full border-2 border-brand-neon px-4 py-2 font-mono text-xs uppercase tracking-widest text-brand-neon">
              {persistence.email}
            </span>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-full border-2 border-brand-light/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-brand-light hover:border-brand-magenta hover:text-brand-magenta"
            >
              Sair
            </button>
          </div>
        ) : persistence.configured ? (
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
            <input
              value={email}
              onChange={event => onEmailChange(event.target.value)}
              className={fieldClass}
              placeholder="email"
              type="email"
            />
            <input
              value={password}
              onChange={event => onPasswordChange(event.target.value)}
              className={fieldClass}
              placeholder="senha"
              type="password"
            />
            <button
              type="button"
              onClick={onSignIn}
              disabled={loading}
              className="rounded-[22px] border-2 border-brand-neon bg-brand-neon px-5 py-3 font-mono text-xs uppercase tracking-widest text-brand-dark disabled:opacity-60"
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={onSignUp}
              disabled={loading}
              className="rounded-[22px] border-2 border-brand-light/20 px-5 py-3 font-mono text-xs uppercase tracking-widest text-brand-light disabled:opacity-60"
            >
              Criar
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-[22px] border-2 border-brand-magenta/60 bg-brand-magenta/10 px-4 py-3 font-mono text-xs text-brand-light">
            <ShieldAlert className="h-5 w-5 text-brand-magenta" />
            Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
          </div>
        )}
      </div>
    </section>
  );
});
