import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { Loader2, Lock, X } from 'lucide-react';
import { PaywallTrigger, PremiumFeature } from '../types';
import {
  BillingEntitlementSummary,
  fetchBillingEntitlement,
  hasBillingEntitlement,
} from '../services/billingService';
import { PricingTable } from './PricingTable';

const PREMIUM_FEATURE_LABELS: Record<PremiumFeature, string> = {
  premium_theme: 'Tema premium',
  export_data: 'Exportação premium',
  unlimited_ai: 'IA ilimitada',
  wearable_sync: 'Wearables',
  pose_detection: 'Análise de postura',
  premium_community: 'Comunidade premium',
  exclusive_badge: 'Badge exclusivo',
  advanced_analytics: 'Analytics avançado',
  priority_coach: 'Coach prioritário',
  periodization_lab: 'Periodização avançada',
};

const ENTITLEMENT_BY_FEATURE: Record<PremiumFeature, string> = {
  premium_theme: 'export.clean',
  export_data: 'export.clean',
  unlimited_ai: 'ai.unlimited',
  wearable_sync: 'wearables.advanced',
  pose_detection: 'reports.executive',
  premium_community: 'coach.students',
  exclusive_badge: 'export.clean',
  advanced_analytics: 'reports.executive',
  priority_coach: 'ai.priority',
  periodization_lab: 'workouts.unlimited',
};

interface PremiumPaywallProps {
  trigger: PaywallTrigger;
  onClose: () => void;
}

export function PremiumPaywall({ trigger, onClose }: PremiumPaywallProps) {
  const featureName = trigger.feature
    ? PREMIUM_FEATURE_LABELS[trigger.feature]
    : 'recursos premium';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-brand-gray border border-white/10 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-brand-neon text-xs uppercase tracking-[0.25em] font-bold">
              Premium
            </p>

            <h2 className="text-3xl font-black text-white mt-2">
              {trigger.title ?? `Desbloqueie ${featureName}`}
            </h2>

            <p className="text-brand-muted mt-2">
              {trigger.description ??
                'O checkout é feito pela Stripe e a liberação só acontece após webhook assinado.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/10 text-white p-3 hover:bg-white/20"
          >
            <X size={20} />
          </button>
        </div>

        <PricingTable compact />

        <div className="mt-6 rounded-2xl bg-brand-neon/10 border border-brand-neon/20 p-4">
          <p className="text-brand-neon font-black">
            Entitlement validado no servidor
          </p>
          <p className="text-sm text-white/70 mt-1">
            Alterar localStorage, DOM ou estado React não libera recursos premium.
          </p>
        </div>
      </div>
    </div>
  );
}
interface PremiumFeatureGateProps {
  feature: PremiumFeature;
  children: ReactNode;
  fallback?: ReactNode;
  onBlocked?: (feature: PremiumFeature) => void;
}

export function PremiumFeatureGate({
  feature,
  children,
  fallback,
  onBlocked,
}: PremiumFeatureGateProps) {
  const [entitlement, setEntitlement] = useState<BillingEntitlementSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const requiredEntitlement = ENTITLEMENT_BY_FEATURE[feature];

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const next = await fetchBillingEntitlement();
        if (active) setEntitlement(next);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Falha ao validar entitlement.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const allowed = useMemo(
    () => hasBillingEntitlement(entitlement, requiredEntitlement),
    [entitlement, requiredEntitlement],
  );

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white flex items-center gap-3">
        <Loader2 className="animate-spin text-brand-neon" size={18} />
        Validando entitlement...
      </div>
    );
  }

  if (allowed) {
    return <>{children}</>;
  }

  const open = () => {
    onBlocked?.(feature);
    setShowPaywall(true);
  };

  return (
    <>
      {fallback ?? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-brand-neon/10 p-3 text-brand-neon">
              <Lock size={20} />
            </div>

            <div className="flex-1">
              <h3 className="font-black text-white">
                {PREMIUM_FEATURE_LABELS[feature]} bloqueado
              </h3>

              <p className="text-sm text-brand-muted mt-1">
                {error || `Requer entitlement ${requiredEntitlement} confirmado pelo servidor.`}
              </p>

              <button
                type="button"
                onClick={open}
                className="mt-4 bg-brand-neon text-brand-dark rounded-xl px-4 py-3 font-black"
              >
                Fazer upgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaywall && (
        <PremiumPaywall
          trigger={{
            source: 'feature_gate',
            feature,
            title: `Desbloqueie ${PREMIUM_FEATURE_LABELS[feature]}`,
          }}
          onClose={() => setShowPaywall(false)}
        />
      )}
    </>
  );
}
