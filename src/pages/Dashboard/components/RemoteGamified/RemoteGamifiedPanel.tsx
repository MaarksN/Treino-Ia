import { Users, Skull, Gamepad2, Gift, Cat } from 'lucide-react';
import type { RemoteGamifiedState } from '../../services/remoteGamifiedEngine';

interface Props {
  state: RemoteGamifiedState;
}

export function RemoteGamifiedPanel({ state }: Props) {
  return (
    <section className="mb-8 rounded-[28px] border-4 border-brand-magenta bg-brand-gray p-6 shadow-brutal-magenta md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-brand-magenta">
            Deep Gamification
          </p>
          <h2 className="mt-2 font-display text-4xl uppercase leading-none text-brand-light md:text-5xl">
            Desafios e Recompensas
          </h2>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Item 76 - Co-op Guard */}
        <article className="border-2 border-brand-light/20 bg-brand-dark p-5">
          <div className="mb-4 flex items-center gap-3">
            <Users className="h-6 w-6 text-brand-neon" />
            <h3 className="font-display text-2xl uppercase text-brand-light">Co-op Workouts</h3>
          </div>
          <p className="font-mono text-sm font-bold uppercase text-brand-neon mb-2">
            {state.coopGuard.statusLabel}
          </p>
          <p className="font-mono text-xs text-brand-muted">
            {state.coopGuard.explanation}
          </p>
        </article>

        {/* Item 78 - Roguelike Mode */}
        <article className="border-2 border-brand-light/20 bg-brand-dark p-5">
          <div className="mb-4 flex items-center gap-3">
            <Gamepad2 className="h-6 w-6 text-brand-magenta" />
            <h3 className="font-display text-2xl uppercase text-brand-light">Roguelike Mode</h3>
          </div>
          {state.roguelike.isUnlocked ? (
            <>
              <p className="font-mono text-sm text-brand-light mb-2">Modo Experimental Liberado!</p>
              <div className="flex gap-2">
                 <span className="border border-brand-magenta px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-brand-magenta">
                   Vidas: {state.roguelike.lives}
                 </span>
              </div>
            </>
          ) : (
            <p className="font-mono text-xs text-brand-muted">
              Complete 5 treinos para desbloquear este modo extremo.
            </p>
          )}
        </article>

        {/* Item 79 - Cosmetic Drops */}
        <article className="border-2 border-brand-light/20 bg-brand-dark p-5">
          <div className="mb-4 flex items-center gap-3">
            <Gift className="h-6 w-6 text-brand-neon" />
            <h3 className="font-display text-2xl uppercase text-brand-light">Drops Locais</h3>
          </div>
          <p className="font-mono text-sm text-brand-light mb-2">
            Drops disponíveis: {state.cosmeticDrops.availableDrops}
          </p>
          {state.cosmeticDrops.unlockedItems.length > 0 && (
            <div className="mt-3">
              <p className="font-mono text-xs uppercase tracking-widest text-brand-muted mb-1">Desbloqueados:</p>
              <div className="flex flex-wrap gap-2">
                {state.cosmeticDrops.unlockedItems.map(item => (
                  <span key={item} className="bg-brand-gray border border-brand-neon/30 px-2 py-1 font-mono text-[10px] text-brand-neon">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Item 80 - Muscle Pet */}
        <article className="border-2 border-brand-light/20 bg-brand-dark p-5">
          <div className="mb-4 flex items-center gap-3">
            <Cat className="h-6 w-6 text-brand-magenta" />
            <h3 className="font-display text-2xl uppercase text-brand-light">Muscle Pet</h3>
          </div>
          <p className="font-mono text-sm font-bold text-brand-light mb-1">{state.musclePet.petName}</p>
          <p className="font-mono text-xs text-brand-muted mb-3">{state.musclePet.status}</p>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between font-mono text-[10px] uppercase mb-1">
                <span className="text-brand-muted">Saúde</span>
                <span className="text-brand-neon">{state.musclePet.health}%</span>
              </div>
              <ProgressBar percent={state.musclePet.health} tone="neon" compact />
            </div>
            <div>
              <div className="flex justify-between font-mono text-[10px] uppercase mb-1">
                <span className="text-brand-muted">Felicidade</span>
                <span className="text-brand-magenta">{state.musclePet.happiness}%</span>
              </div>
              <ProgressBar percent={state.musclePet.happiness} tone="magenta" compact />
            </div>
          </div>
        </article>

        {/* Item 77 - Death Penalty */}
        <article className="border-2 border-red-500/30 bg-brand-dark p-5 sm:col-span-2 lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <Skull className="h-6 w-6 text-red-500" />
            <h3 className="font-display text-2xl uppercase text-red-500">Death Penalty (Opcional)</h3>
          </div>
          <p className="font-mono text-sm text-red-400 mb-2">{state.deathPenalty.warningLabel}</p>
          <p className="font-mono text-xs text-red-500/70">
            {state.deathPenalty.consequence}
          </p>
          <div className="mt-4 flex items-center gap-2">
             <div className="h-4 w-8 rounded-full bg-brand-gray border border-red-500/50 flex items-center p-1">
               <div className="h-2 w-2 rounded-full bg-red-500/30" />
             </div>
             <span className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">Desativado</span>
          </div>
        </article>

      </div>
    </section>
  );
}

function ProgressBar({
  percent,
  tone,
  compact = false,
}: {
  percent: number;
  tone: 'neon' | 'magenta';
  compact?: boolean;
}) {
  return (
    <div className={`${compact ? 'h-1' : 'h-3'} w-full bg-brand-dark overflow-hidden`}>
      <div
        className={`h-full ${tone === 'neon' ? 'bg-brand-neon' : 'bg-brand-magenta'}`}
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      />
    </div>
  );
}
