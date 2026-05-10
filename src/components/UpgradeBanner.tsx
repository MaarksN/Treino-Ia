import React, { useEffect, useState } from 'react';
import { Crown, Flame, Trophy, X } from 'lucide-react';
import { PremiumPaywall } from './PremiumPaywall';

interface Props {
  trigger: 'generic' | 'after_pr' | 'after_streak';
  streak?: number;
  compact?: boolean;
}

export function UpgradeBanner({ trigger, streak = 0, compact = false }: Props) {
  const [visible, setVisible] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  useEffect(() => {
    setVisible(trigger === 'generic' || trigger === 'after_pr' || (trigger === 'after_streak' && streak >= 7));
  }, [trigger, streak]);

  if (!visible) return null;

  const content = getContent(trigger, streak);

  return (
    <>
      <section
        className={`relative overflow-hidden rounded-3xl border border-brand-neon/30 bg-brand-neon/10 ${
          compact ? 'p-4' : 'p-6'
        }`}
      >
        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 top-4 text-white/50 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between pr-8">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-brand-neon text-brand-dark p-3">
              {content.icon}
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-brand-neon font-bold">
                Upgrade Premium
              </p>

              <h3 className="text-xl font-black text-white mt-1">
                {content.title}
              </h3>

              <p className="text-sm text-white/70 mt-1">
                {content.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => setPaywallOpen(true)}
            className="bg-brand-neon text-brand-dark rounded-xl px-5 py-3 font-black"
          >
            Ver planos
          </button>
        </div>
      </section>

      {paywallOpen && (
        <PremiumPaywall
          trigger={{
            source: trigger === 'generic' ? 'upgrade_banner' : trigger,
            title: content.title,
            description: content.description,
          }}
          onClose={() => setPaywallOpen(false)}
        />
      )}
    </>
  );
}

function getContent(trigger: Props['trigger'], streak: number) {
  if (trigger === 'after_pr') {
    return {
      icon: <Trophy size={22} />,
      title: 'Você bateu um PR. Agora desbloqueie análise premium.',
      description:
        'Use IA ilimitada, histórico avançado e exportação para transformar recordes em evolução contínua.',
    };
  }

  if (trigger === 'after_streak') {
    return {
      icon: <Flame size={22} />,
      title: `${streak} dias de sequência. Hora de acelerar sua evolução.`,
      description:
        'Premium libera badges, analytics avançado, comunidade premium e recomendações mais profundas.',
    };
  }

  return {
    icon: <Crown size={22} />,
    title: 'Desbloqueie a experiência completa',
    description:
      'Planos ilimitados, IA ilimitada, wearables, pose detection, exportação e tema premium.',
  };
}
