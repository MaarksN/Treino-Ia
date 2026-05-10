import React, { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  CalendarClock,
  CreditCard,
  Crown,
  ExternalLink,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { getBillingPlan } from '../config/plans';
import {
  BillingEntitlementSummary,
  createBillingPortalSession,
  fetchBillingEntitlement,
} from '../services/billingService';
import { PricingTable } from './PricingTable';

export function BillingCenter() {
  const [entitlement, setEntitlement] = useState<BillingEntitlementSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);

  const plan = useMemo(
    () => getBillingPlan(entitlement?.planId ?? 'free'),
    [entitlement?.planId],
  );

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const next = await fetchBillingEntitlement();
        if (active) setEntitlement(next);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Falha ao carregar billing.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const openPortal = async () => {
    setPortalLoading(true);
    setError('');

    try {
      const portal = await createBillingPortalSession();
      window.location.assign(portal.portalUrl);
    } catch (portalError) {
      setError(portalError instanceof Error ? portalError.message : 'Falha ao abrir portal Stripe.');
      setPortalLoading(false);
    }
  };

  const trialEndsAt = entitlement?.subscription?.trial_ends_at
    ? new Date(entitlement.subscription.trial_ends_at)
    : null;

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
            Status carregado do backend. Stripe webhook e Supabase são a fonte de verdade.
          </p>
        </header>

        {loading && (
          <section className="rounded-3xl border border-white/10 bg-brand-gray p-6 text-white flex items-center gap-3">
            <Loader2 className="animate-spin text-brand-neon" size={20} />
            Carregando assinatura real...
          </section>
        )}

        {error && (
          <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
            <p className="font-black">Billing indisponível</p>
            <p className="text-sm mt-1">{error}</p>
          </section>
        )}

        {entitlement && (
          <>
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
                  {entitlement.subscription?.current_period_end
                    ? `Renova em ${new Date(entitlement.subscription.current_period_end).toLocaleDateString('pt-BR')}`
                    : 'Sem assinatura paga ativa.'}
                </p>

                {trialEndsAt && trialEndsAt.getTime() > Date.now() && (
                  <div className="mt-4 rounded-2xl bg-brand-neon/10 border border-brand-neon/20 p-3 text-brand-neon">
                    <p className="font-bold flex items-center gap-2">
                      <CalendarClock size={16} />
                      Trial ativo
                    </p>
                    <p className="text-sm">
                      Até {trialEndsAt.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-brand-gray rounded-3xl border border-white/10 p-5">
                <div className="flex items-center gap-2 text-brand-neon mb-3">
                  <ShieldCheck size={20} />
                  <span className="font-bold">Entitlements</span>
                </div>

                <p className="text-3xl font-black text-white">
                  {entitlement.entitlements.length}
                </p>

                <p className="text-brand-muted mt-1">recursos liberados pelo servidor</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {entitlement.entitlements.slice(0, 8).map(feature => (
                    <span
                      key={feature}
                      className="rounded-full bg-white/10 px-3 py-1 text-xs text-white"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-brand-gray rounded-3xl border border-white/10 p-5">
                <div className="flex items-center gap-2 text-brand-neon mb-3">
                  <BadgeCheck size={20} />
                  <span className="font-bold">Servidor</span>
                </div>

                <h2 className="text-2xl font-black text-white">
                  {entitlement.isPremium ? 'Premium validado' : 'Free validado'}
                </h2>

                <p className="text-brand-muted mt-1">
                  Nenhum estado premium é aceito do navegador.
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
          </>
        )}

        <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="text-brand-neon" size={20} />
            <h2 className="text-xl font-black text-white">
              Planos
            </h2>
          </div>

          <PricingTable
            currentPlanId={entitlement?.planId ?? 'free'}
            onCheckoutStart={() => setMessage('Redirecionando para checkout Stripe...')}
            compact
          />
        </section>

        <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
          <h2 className="text-xl font-black text-white mb-4">
            Gestão da assinatura
          </h2>

          <button
            type="button"
            disabled={portalLoading || !entitlement?.isPremium}
            onClick={openPortal}
            className="bg-white/10 text-white rounded-xl px-4 py-3 font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {portalLoading ? <Loader2 className="animate-spin" size={16} /> : <ExternalLink size={16} />}
            Abrir portal Stripe
          </button>

          {message && (
            <p className="text-brand-neon text-sm mt-4">{message}</p>
          )}
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
