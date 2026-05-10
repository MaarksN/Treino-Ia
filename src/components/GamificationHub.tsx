import React, { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, Coins, Flame, Loader2, ShieldCheck, Trophy } from 'lucide-react';
import {
  fetchGamificationState,
  recordGamificationEvent,
  ServerGamificationState,
} from '../services/gamificationService';

export function GamificationHub() {
  const [state, setState] = useState<ServerGamificationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const progress = useMemo(() => {
    const xp = state?.profile.xp ?? 0;
    const current = xp % 300;
    return {
      current,
      required: 300,
      percent: Math.min(100, Math.round((current / 300) * 100)),
    };
  }, [state?.profile.xp]);

  async function load() {
    setError('');

    try {
      const next = await fetchGamificationState();
      setState(next);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Falha ao carregar gamificação.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const recordEvent = async (eventType: 'login' | 'checkin') => {
    setActionLoading(eventType);
    setError('');
    setMessage('');

    try {
      const result = await recordGamificationEvent(eventType);
      setMessage(result.skipped ? result.reason ?? 'Evento já registrado.' : 'Evento registrado no servidor.');
      await load();
    } catch (eventError) {
      setError(eventError instanceof Error ? eventError.message : 'Falha ao registrar evento.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white p-6">
      <header className="max-w-7xl mx-auto mb-8">
        <p className="text-brand-neon text-xs uppercase tracking-[0.25em] font-bold">
          Bloco 10
        </p>

        <h1 className="text-4xl font-black mt-2">
          Gamificação Profunda
        </h1>

        <p className="text-brand-muted mt-2 max-w-3xl">
          XP, moedas, streak e ledger carregados do Supabase. O navegador não é mais fonte de verdade.
        </p>
      </header>

      <main className="max-w-7xl mx-auto space-y-5">
        {loading && (
          <section className="rounded-3xl border border-white/10 bg-brand-gray p-6 text-white flex items-center gap-3">
            <Loader2 className="animate-spin text-brand-neon" size={20} />
            Carregando gamificação real...
          </section>
        )}

        {error && (
          <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
            <p className="font-black">Gamificação indisponível</p>
            <p className="text-sm mt-1">{error}</p>
          </section>
        )}

        {state && (
          <>
            <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div>
                  <p className="text-brand-neon text-xs uppercase tracking-[0.25em] font-bold">
                    XP e Level
                  </p>

                  <h2 className="text-4xl font-black text-white mt-2">
                    Level {state.profile.level}
                  </h2>

                  <p className="text-brand-muted mt-1">
                    {state.profile.active_title} · {state.profile.xp} XP total · {state.profile.coins} moedas
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={Boolean(actionLoading)}
                    onClick={() => recordEvent('login')}
                    className="bg-white/10 rounded-2xl px-4 py-3 text-white font-bold flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading === 'login' ? <Loader2 className="animate-spin" size={16} /> : <Flame size={16} className="text-brand-neon" />}
                    Registrar login
                  </button>

                  <button
                    type="button"
                    disabled={Boolean(actionLoading)}
                    onClick={() => recordEvent('checkin')}
                    className="bg-brand-neon rounded-2xl px-4 py-3 text-brand-dark font-black flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading === 'checkin' ? <Loader2 className="animate-spin" size={16} /> : <CalendarCheck size={16} />}
                    Check-in
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-brand-muted">Progresso do level</span>
                  <span className="text-brand-neon font-bold">
                    {progress.current}/{progress.required} XP
                  </span>
                </div>

                <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-neon"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-3 mt-5">
                <StatCard icon={<Flame />} label="Login streak" value={`${state.profile.login_streak}d`} />
                <StatCard icon={<Trophy />} label="Season XP" value={state.profile.season_xp} />
                <StatCard icon={<ShieldCheck />} label="Season level" value={state.profile.season_level} />
                <StatCard icon={<Coins />} label="Moedas" value={state.profile.coins} />
              </div>

              {message && (
                <p className="mt-4 rounded-2xl border border-brand-neon/20 bg-brand-neon/10 p-3 text-sm text-brand-neon">
                  {message}
                </p>
              )}
            </section>

            <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
              <h3 className="text-xl font-black text-white mb-4">
                Ledger de eventos
              </h3>

              <div className="space-y-3">
                {state.events.map(event => (
                  <article key={event.id} className="rounded-2xl bg-brand-dark border border-white/10 p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-white">{event.event_type}</p>
                      <p className="text-xs text-brand-muted">
                        {new Date(event.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>

                    <p className="text-sm text-brand-neon font-black">
                      +{event.xp_delta} XP · {event.coin_delta >= 0 ? '+' : ''}{event.coin_delta} moedas
                    </p>
                  </article>
                ))}

                {!state.events.length && (
                  <p className="text-sm text-brand-muted">
                    Nenhum evento registrado ainda.
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="text-brand-neon mb-2">{icon}</div>
      <p className="text-xs text-brand-muted uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-white mt-1">{value}</p>
    </div>
  );
}
