import React, { useMemo, useState } from 'react';
import {
  BadgeCheck,
  CalendarClock,
  CreditCard,
  Crown,
  Download,
  Gift,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { SubscriptionPlanId } from '../types';
import {
  activatePlan,
  applyCoupon,
  cancelPremium,
  exportPremiumJson,
  getCurrentPlan,
  getDiscountedPrice,
  getExclusiveBadge,
  getTrialDaysLeft,
  loadEntitlement,
  PREMIUM_FEATURE_LABELS,
  SUBSCRIPTION_PLANS,
} from '../utils/premiumUtils';
import { PricingTable } from './PricingTable';

export function BillingCenter() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [coupon, setCoupon] = useState('');
  const [message, setMessage] = useState('');

  const entitlement = useMemo(() => loadEntitlement(), [refreshKey]);
  const plan = useMemo(() => getCurrentPlan(), [refreshKey]);
  const trialDaysLeft = getTrialDaysLeft();

  const refresh = () => setRefreshKey(key => key + 1);

  const selectPlan = (planId: SubscriptionPlanId) => {
    activatePlan(planId);
    setMessage('Plano atualizado com sucesso.');
    refresh();
  };

  const cancel = () => {
    cancelPremium();
    setMessage('Assinatura cancelada. Você voltou para o plano Free.');
    refresh();
  };

  const apply = () => {
    const result = applyCoupon(coupon);
    setMessage(result.message);
    refresh();
  };

  const exportData = () => {
    const result = exportPremiumJson('treinoapp-premium-entitlement.json', {
      entitlement,
      plan,
      exportedAt: new Date().toISOString(),
    });

    setMessage(result.message);
    refresh();
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white p-6">
      <main className="max-w-6xl mx-auto space-y-6">
        <header>
          <p className="text-brand-neon text-xs uppercase tracking-[0.25em] font-bold">
            Billing Center
          </p>
          <h1 className="text-4xl font-black mt-2">
            Assinatura e Entitlements
          </h1>
          <p className="text-brand-muted mt-2">
            Controle do plano, trial, cupons, recursos liberados e uso mensal.
          </p>
        </header>

        <section className="grid lg:grid-cols-3 gap-4">
          <div className="bg-brand-gray rounded-3xl border border-white/10 p-5">
            <div className="flex items-center gap-2 text-brand-neon mb-3">
              <Crown size={20} />
              <span className="font-bold">Plano atual</span>
            </div>

            <h2 className="text-3xl font-black text-white">{plan.name}</h2>

            <p className="text-brand-muted mt-1">
              Status: {entitlement.billingStatus}
            </p>

            <p className="text-sm text-white/70 mt-4">
              {plan.price === 0
                ? 'R$0'
                : `R$${getDiscountedPrice(plan).toFixed(2)} / ${plan.billing === 'year' ? 'ano' : 'mês'}`}
            </p>

            {trialDaysLeft > 0 && (
              <div className="mt-4 rounded-2xl bg-brand-neon/10 border border-brand-neon/20 p-3 text-brand-neon">
                <p className="font-bold flex items-center gap-2">
                  <CalendarClock size={16} />
                  Trial ativo
                </p>
                <p className="text-sm">{trialDaysLeft} dias restantes</p>
              </div>
            )}
          </div>

          <div className="bg-brand-gray rounded-3xl border border-white/10 p-5">
            <div className="flex items-center gap-2 text-brand-neon mb-3">
              <ShieldCheck size={20} />
              <span className="font-bold">Entitlements</span>
            </div>

            <p className="text-3xl font-black text-white">
              {entitlement.unlockedFeatures.length}
            </p>

            <p className="text-brand-muted mt-1">recursos premium liberados</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {entitlement.unlockedFeatures.slice(0, 6).map(feature => (
                <span
                  key={feature}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs text-white"
                >
                  {PREMIUM_FEATURE_LABELS[feature]}
                </span>
              ))}

              {!entitlement.unlockedFeatures.length && (
                <span className="text-sm text-brand-muted">
                  Nenhum recurso premium ativo.
                </span>
              )}
            </div>
          </div>

          <div className="bg-brand-gray rounded-3xl border border-white/10 p-5">
            <div className="flex items-center gap-2 text-brand-neon mb-3">
              <BadgeCheck size={20} />
              <span className="font-bold">Badge</span>
            </div>

            <h2 className="text-2xl font-black text-white">
              {getExclusiveBadge() ?? 'Badge Free'}
            </h2>

            <p className="text-brand-muted mt-1">
              O badge exclusivo é liberado no Premium.
            </p>
          </div>
        </section>

        <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
          <h2 className="text-xl font-black text-white mb-4">
            Uso mensal
          </h2>

          <div className="grid md:grid-cols-4 gap-3">
            <UsageCard label="IA usada" value={entitlement.usage.aiRequestsThisMonth} suffix="req" />
            <UsageCard label="Exportações" value={entitlement.usage.exportsThisMonth} suffix="x" />
            <UsageCard label="PRs" value={entitlement.usage.prCount} suffix="x" />
            <UsageCard label="Melhor streak" value={entitlement.usage.bestStreak} suffix="d" />
          </div>
        </section>

        <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="text-brand-neon" size={20} />
            <h2 className="text-xl font-black text-white">Cupom</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={coupon}
              onChange={event => setCoupon(event.target.value)}
              placeholder="BIRTHUB30"
              className="flex-1 bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white"
            />

            <button
              onClick={apply}
              className="bg-brand-neon text-brand-dark rounded-xl px-4 py-3 font-black"
            >
              Aplicar cupom
            </button>
          </div>
        </section>

        <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="text-brand-neon" size={20} />
            <h2 className="text-xl font-black text-white">
              Alterar plano
            </h2>
          </div>

          <PricingTable onSelectPlan={selectPlan} compact />
        </section>

        <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
          <h2 className="text-xl font-black text-white mb-4">
            Ações da assinatura
          </h2>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportData}
              className="bg-white/10 text-white rounded-xl px-4 py-3 font-bold flex items-center gap-2"
            >
              <Download size={16} />
              Exportar dados premium
            </button>

            <button
              onClick={cancel}
              className="bg-red-500/10 text-red-300 border border-red-500/30 rounded-xl px-4 py-3 font-bold flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Cancelar premium
            </button>
          </div>

          {message && (
            <p className="text-brand-neon text-sm mt-4">{message}</p>
          )}
        </section>

        <section className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-yellow-200">
          <p className="font-black">Observação de produção</p>
          <p className="text-sm mt-1">
            Este código entrega o controle local de entitlement para MVP.
            Em produção, conecte o botão de assinatura a Stripe, Asaas, Mercado Pago
            ou outro gateway, e sincronize o status real da assinatura via webhook.
          </p>
        </section>
      </main>
    </div>
  );
}

function UsageCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix: string;
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <p className="text-xs text-brand-muted uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-white mt-1">
        {value}
        <span className="text-sm text-brand-muted ml-1">{suffix}</span>
      </p>
    </div>
  );
}
