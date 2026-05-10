import React, { useMemo, useState } from 'react';
import { Check, Crown, Gift, Sparkles } from 'lucide-react';
import { SubscriptionPlanId } from '../types';
import {
  applyCoupon,
  getDiscountedPrice,
  loadEntitlement,
  startSevenDayTrial,
  SUBSCRIPTION_PLANS,
} from '../utils/premiumUtils';

interface Props {
  onSelectPlan: (planId: SubscriptionPlanId) => void;
  compact?: boolean;
}

export function PricingTable({ onSelectPlan, compact = false }: Props) {
  const [coupon, setCoupon] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const entitlement = useMemo(() => loadEntitlement(), [refreshKey]);

  const apply = () => {
    const result = applyCoupon(coupon);
    setCouponMessage(result.message);
    setRefreshKey(key => key + 1);
  };

  const startTrial = () => {
    startSevenDayTrial();
    setRefreshKey(key => key + 1);
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
            Free para começar. Premium para evoluir com IA, wearables, pose e analytics.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {SUBSCRIPTION_PLANS.map(plan => {
          const discountedPrice = getDiscountedPrice(plan);
          const isCurrent = entitlement.planId === plan.id;

          return (
            <article
              key={plan.id}
              className={`relative rounded-3xl border p-5 ${
                plan.highlighted
                  ? 'bg-brand-neon/10 border-brand-neon/40 shadow-[0_0_40px_rgba(163,230,53,0.08)]'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-5 rounded-full bg-brand-neon text-brand-dark px-3 py-1 text-xs font-black">
                  {plan.badge}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black text-white">{plan.name}</h3>
                  <p className="text-sm text-brand-muted mt-1">{plan.subtitle}</p>
                </div>

                {plan.id !== 'free' ? (
                  <Crown className="text-brand-neon" size={24} />
                ) : (
                  <Sparkles className="text-white/40" size={24} />
                )}
              </div>

              <div className="mt-5">
                <p className="text-4xl font-black text-white">
                  {discountedPrice === 0 ? 'R$0' : `R$${discountedPrice.toFixed(2)}`}
                </p>

                <p className="text-xs text-brand-muted mt-1">
                  {plan.billing === 'month' && '/mês'}
                  {plan.billing === 'year' && '/ano'}
                  {plan.billing === 'none' && 'sempre'}
                </p>

                {discountedPrice !== plan.price && (
                  <p className="text-xs text-brand-neon mt-1">
                    De R${plan.price.toFixed(2)} por R${discountedPrice.toFixed(2)}
                  </p>
                )}
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
                onClick={() => onSelectPlan(plan.id)}
                className={`w-full mt-6 rounded-xl py-3 font-black ${
                  plan.highlighted
                    ? 'bg-brand-neon text-brand-dark'
                    : 'bg-white/10 text-white'
                }`}
              >
                {isCurrent ? 'Plano atual' : plan.id === 'free' ? 'Continuar Free' : 'Assinar'}
              </button>

              {plan.id === 'premium_monthly' && !entitlement.trialStartedAt && (
                <button
                  onClick={startTrial}
                  className="w-full mt-2 rounded-xl py-3 font-bold bg-white/5 text-brand-neon border border-brand-neon/20"
                >
                  Testar 7 dias grátis
                </button>
              )}
            </article>
          );
        })}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex items-center gap-2 text-white font-bold">
          <Gift className="text-brand-neon" size={18} />
          Cupom promocional
        </div>

        <input
          value={coupon}
          onChange={event => setCoupon(event.target.value)}
          placeholder="Ex.: BIRTHUB30"
          className="flex-1 bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white"
        />

        <button
          onClick={apply}
          className="bg-brand-neon text-brand-dark rounded-xl px-4 py-3 font-black"
        >
          Aplicar
        </button>
      </div>

      {couponMessage && (
        <p className="text-sm text-brand-neon text-center">{couponMessage}</p>
      )}
    </section>
  );
}
