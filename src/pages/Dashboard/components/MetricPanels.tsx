import { type ReactNode } from 'react';

export function MetricCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: 'neon' | 'magenta' | 'light' }) {
  const toneClass = tone === 'neon'
    ? 'border-brand-neon shadow-brutal-neon text-brand-neon'
    : tone === 'magenta'
      ? 'border-brand-magenta shadow-brutal-magenta text-brand-magenta'
      : 'border-brand-light shadow-brutal-light text-brand-light';

  return (
    <div className={`border-2 bg-brand-dark p-5 ${toneClass}`}>
      <div className="mb-3 h-7 w-7">{icon}</div>
      <p className="font-display text-5xl leading-none text-brand-light">{value}</p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-brand-muted">{label}</p>
    </div>
  );
}

export function MetricPanel({ icon, title, value, tone }: { icon: ReactNode; title: string; value: string; tone: 'neon' | 'magenta' | 'light' }) {
  const toneClass = tone === 'neon'
    ? 'border-brand-neon shadow-brutal-neon text-brand-neon'
    : tone === 'magenta'
      ? 'border-brand-magenta shadow-brutal-magenta text-brand-magenta'
      : 'border-brand-light shadow-brutal-light text-brand-light';

  return (
    <article className={`rounded-[28px] border-2 bg-brand-gray/80 p-6 ${toneClass}`}>
      <div className="mb-4 h-8 w-8">{icon}</div>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">{title}</p>
      <h3 className="mt-3 font-display text-4xl uppercase leading-none text-brand-light">{value}</h3>
    </article>
  );
}
