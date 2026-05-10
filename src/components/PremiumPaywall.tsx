import React, { ReactNode, useState } from 'react';
import { Lock, X } from 'lucide-react';
import { PaywallTrigger, PremiumFeature, SubscriptionPlanId } from '../types';
import {
  activatePlan,
  canUseFeature,
  getExclusiveBadge,
  PREMIUM_FEATURE_LABELS,
  trackPremiumEvent,
} from '../utils/premiumUtils';
import { PricingTable } from './PricingTable';

interface PremiumPaywallProps {
  trigger: PaywallTrigger;
  onClose: () => void;
  onUpgrade?: (planId: SubscriptionPlanId) => void;
}

export function PremiumPaywall({ trigger, onClose, onUpgrade }: PremiumPaywallProps) {
  const featureName = trigger.feature
    ? PREMIUM_FEATURE_LABELS[trigger.feature]
    : 'recursos premium';

  const selectPlan = (planId: SubscriptionPlanId) => {
    activatePlan(planId);
    trackPremiumEvent('paywall_plan_selected', {
      planId,
      source: trigger.source,
      feature: trigger.feature,
    });

    onUpgrade?.(planId);
    onClose();
  };

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
                'Mais IA, mais performance, mais dados, mais evolução e recursos avançados.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 text-white p-3 hover:bg-white/20"
          >
            <X size={20} />
          </button>
        </div>

        <PricingTable onSelectPlan={selectPlan} compact />

        <div className="mt-6 rounded-2xl bg-brand-neon/10 border border-brand-neon/20 p-4">
          <p className="text-brand-neon font-black">
            {getExclusiveBadge() ?? '👑 Badge exclusivo liberado no Premium'}
          </p>
          <p className="text-sm text-white/70 mt-1">
            Use o premium para liberar IA ilimitada, tema premium, exportação,
            wearables, pose detection e comunidade premium.
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
  const permission = canUseFeature(feature);
  const [showPaywall, setShowPaywall] = useState(false);

  if (permission.allowed) {
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
                {permission.reason ?? 'Este recurso faz parte do plano Premium.'}
              </p>

              <button
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
