import React, { useState } from 'react';
import { Check, Crown, Loader2, Sparkles } from 'lucide-react';
import { BILLING_PLANS } from '../config/plans';
import { createCheckoutSession } from '../services/billingService';
import { BillingInterval, BillingTier } from '../types/billing';

interface Props {
  currentPlanId?: BillingTier;
  onCheckoutStart?: (planId: BillingTier, interval: BillingInterval) => void;
  compact?: boolean;
}

export function PricingTable({ currentPlanId = 'free', onCheckoutStart, compact = false }: Props) {
  const [interval, setInterval] = useState<BillingInterval>('month');
  const [loadingPlan, setLoadingPlan] = useState<BillingTier | null>(null);
  const [error, setError] = useState('');

  const startCheckout = async (planId: BillingTier) => {
    if (planId === 'free') return;

    setError('');
    setLoadingPlan(planId);
    onCheckoutStart?.(planId, interval);

    try {
      const session = await createCheckoutSession(planId, interval);
      window.location.assign(session.checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Falha ao criar checkout Stripe.');
      setLoadingPlan(null);
    }
  };

  return (
    <section className="space-y-5">
      {!compact && (
        <div className="text-center">
          <p className="text-brand-neon text-xs uppercase tracking-[0.25em] font-bold">
            Premium
          </p>
          <h2 className="text-3xl font-black text-white mt-2">
            Escolha seu plano
          </h2>
          <p className="text-brand-muted mt-2">
            Checkout real via Stripe. O app só libera entitlements após webhook validado.
          </p>
        </div>
      )}

      <div className="flex w-fit rounded-xl border border-white/10 bg-white/5 p-1">
        {(['month', 'year'] as const).map(option => (
          <button
            key={option}
            type="button"
            onClick={() => setInterval(option)}
            className={`rounded-lg px-4 py-2 text-sm font-black ${
              interval === option
                ? 'bg-brand-neon text-brand-dark'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {option === 'month' ? 'Mensal' : 'Anual'}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {BILLING_PLANS.map(plan => {
          const isCurrent = currentPlanId === plan.id;
          const price = interval === 'year' ? plan.annualPrice : plan.monthlyPrice;
          const highlighted = plan.id === 'pro';
          const loading = loadingPlan === plan.id;

          return (
            <article
              key={plan.id}
              className={`relative rounded-3xl border p-5 ${
                highlighted
                  ? 'bg-brand-neon/10 border-brand-neon/40 shadow-[0_0_40px_rgba(163,230,53,0.08)]'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {highlighted && (
                <div className="absolute -top-3 left-5 rounded-full bg-brand-neon text-brand-dark px-3 py-1 text-xs font-black">
                  Mais escolhido
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black text-white">{plan.name}</h3>
                  <p className="text-sm text-brand-muted mt-1">
                    {plan.planLimit === 'unlimited' ? 'Planos ilimitados' : `${plan.planLimit} planos ativos`}
                  </p>
                </div>

                {plan.id !== 'free' ? (
                  <Crown className="text-brand-neon" size={24} />
                ) : (
                  <Sparkles className="text-white/40" size={24} />
                )}
              </div>

              <div className="mt-5">
                <p className="text-4xl font-black text-white">
                  {price === 0 ? 'R$0' : `R$${price.toFixed(2)}`}
                </p>

                <p className="text-xs text-brand-muted mt-1">
                  {price === 0 ? 'sempre' : interval === 'year' ? '/ano' : '/mês'}
                </p>
              </div>

              <div className="mt-5 space-y-2">
                {plan.features.map(feature => (
                  <p key={feature} className="text-sm text-white/85 flex items-start gap-2">
                    <Check className="text-brand-neon shrink-0 mt-0.5" size={16} />
                    {feature}
                  </p>
                ))}
              </div>

              <button
                type="button"
                disabled={isCurrent || plan.id === 'free' || loading}
                onClick={() => startCheckout(plan.id)}
                className={`w-full mt-6 rounded-xl py-3 font-black flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                  highlighted
                    ? 'bg-brand-neon text-brand-dark'
                    : 'bg-white/10 text-white'
                }`}
              >
                {loading && <Loader2 className="animate-spin" size={16} />}
                {isCurrent ? 'Plano atual' : plan.id === 'free' ? 'Free' : 'Ir para Stripe'}
              </button>
            </article>
          );
        })}
      </div>

      {error && (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </p>
      )}
    </section>
  );
}

