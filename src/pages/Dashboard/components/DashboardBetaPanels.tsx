import { lazy, Suspense } from 'react';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { Skeleton } from '../../../components/ui/Skeleton';
import {
  type TrainingPlan,
  type UserProfile,
  type WorkoutSession,
} from '../../../services/database';
import { GamificationRetentionPanel } from './GamificationRetentionPanel';
import { RecoveryReadinessSection } from './RecoveryReadinessSection';
import { type GamificationRetentionState } from '../services/gamificationRetentionEngine';
import { type RemoteGamifiedState } from '../services/remoteGamifiedEngine';

const NutritionLifestyleHub = lazy(() =>
  import('../../../components/NutritionLifestyleHub').then((module) => ({
    default: module.NutritionLifestyleHub,
  })),
);
const AdvancedSocialHub = lazy(() =>
  import('../../../components/AdvancedSocial/AdvancedSocialHub').then((module) => ({
    default: module.AdvancedSocialHub,
  })),
);
const BiohackingWidget = lazy(() =>
  import('./BiohackingWidget').then((module) => ({ default: module.BiohackingWidget })),
);
const RemoteGamifiedPanel = lazy(() =>
  import('./RemoteGamified').then((module) => ({ default: module.RemoteGamifiedPanel })),
);
const CalmModePanel = lazy(() =>
  import('../../../components/wellness/CalmModePanel').then((module) => ({
    default: module.CalmModePanel,
  })),
);
const EcoLiftingPanel = lazy(() =>
  import('../../../components/sustainability/EcoLiftingPanel').then((module) => ({
    default: module.EcoLiftingPanel,
  })),
);
const BossFightCancellationPreview = lazy(() =>
  import('../../../components/monetization/BossFightCancellationPreview').then((module) => ({
    default: module.BossFightCancellationPreview,
  })),
);
const PartnerTokenPreview = lazy(() =>
  import('../../../components/partners/PartnerTokenPreview').then((module) => ({
    default: module.PartnerTokenPreview,
  })),
);
const TimeTravelProgressViewer = lazy(() =>
  import('../../../components/reports/TimeTravelProgressViewer').then((module) => ({
    default: module.TimeTravelProgressViewer,
  })),
);
const PainCheckinPanel = lazy(() =>
  import('../../../components/recovery/PainCheckinPanel').then((module) => ({
    default: module.PainCheckinPanel,
  })),
);
const AdaptivePathwaysPanel = lazy(() =>
  import('../../../components/accessibility/AdaptivePathwaysPanel').then((module) => ({
    default: module.AdaptivePathwaysPanel,
  })),
);
const HighContrastModeToggle = lazy(() =>
  import('../../../components/accessibility/HighContrastModeToggle').then((module) => ({
    default: module.HighContrastModeToggle,
  })),
);
const ScreenReaderSupportPanel = lazy(() =>
  import('../../../components/accessibility/ScreenReaderSupportPanel').then((module) => ({
    default: module.ScreenReaderSupportPanel,
  })),
);
const PlainLanguagePanel = lazy(() =>
  import('../../../components/accessibility/PlainLanguagePanel').then((module) => ({
    default: module.PlainLanguagePanel,
  })),
);
const AdaptiveProtocolsPanel = lazy(() =>
  import('../../../components/accessibility/AdaptiveProtocolsPanel').then((module) => ({
    default: module.AdaptiveProtocolsPanel,
  })),
);
const ThemeCustomizationPanel = lazy(() =>
  import('../../../components/premium/ThemeCustomizationPanel').then((module) => ({
    default: module.ThemeCustomizationPanel,
  })),
);
const PictureInPicturePanel = lazy(() =>
  import('../../../components/media/PictureInPicturePanel').then((module) => ({
    default: module.PictureInPicturePanel,
  })),
);
const WorkoutImportPanel = lazy(() =>
  import('../../../components/media/WorkoutImportPanel').then((module) => ({
    default: module.WorkoutImportPanel,
  })),
);
const FormCheckerPreviewPanel = lazy(() =>
  import('../../../components/ai/FormCheckerPreviewPanel').then((module) => ({
    default: module.FormCheckerPreviewPanel,
  })),
);
const EquipmentReplanPanel = lazy(() =>
  import('../../../components/ai/EquipmentReplanPanel').then((module) => ({
    default: module.EquipmentReplanPanel,
  })),
);
const PantryPlannerPanel = lazy(() =>
  import('../../../components/Nutrition/PantryPlannerPanel').then((module) => ({
    default: module.PantryPlannerPanel,
  })),
);
const LongevitySignalPanel = lazy(() =>
  import('../../../components/wellness/LongevitySignalPanel').then((module) => ({
    default: module.LongevitySignalPanel,
  })),
);
const WebXRPreviewPanel = lazy(() =>
  import('../../../components/xr/WebXRPreviewPanel').then((module) => ({
    default: module.WebXRPreviewPanel,
  })),
);

interface DashboardBetaPanelsProps {
  profile: UserProfile;
  plan: TrainingPlan;
  history: WorkoutSession[];
  gamificationRetention: GamificationRetentionState | null;
  remoteGamifiedState: RemoteGamifiedState | null;
  flags: {
    nutrition: boolean;
    recovery: boolean;
    workoutImport: boolean;
    social: boolean;
    advancedGamification: boolean;
    advancedWellness: boolean;
    accessibility: boolean;
    advancedAi: boolean;
    premiumUx: boolean;
    mediaEnhancements: boolean;
    cameraFormCheck: boolean;
    webxr: boolean;
    premiumIntegrations: boolean;
    partnerTokens: boolean;
  };
}

function LazyPanelFallback() {
  return <Skeleton lines={3} />;
}

export function DashboardBetaPanels({
  profile,
  plan,
  history,
  gamificationRetention,
  remoteGamifiedState,
  flags,
}: DashboardBetaPanelsProps) {
  return (
    <>
      {flags.advancedGamification && gamificationRetention && (
        <div id="dashboard-gamification" className="scroll-mt-24">
          <GamificationRetentionPanel state={gamificationRetention} />
        </div>
      )}

      {flags.advancedGamification && remoteGamifiedState && (
        <div id="dashboard-remote-gamified" className="scroll-mt-24">
          <Suspense fallback={<LazyPanelFallback />}>
            <RemoteGamifiedPanel state={remoteGamifiedState} />
          </Suspense>
        </div>
      )}

      {flags.nutrition && (
        <div id="dashboard-nutrition" className="scroll-mt-24">
          <ErrorBoundary section="NutritionLifestyleHub">
            <Suspense fallback={<LazyPanelFallback />}>
              <NutritionLifestyleHub
                profile={profile}
                plan={plan}
                history={history}
                showAdvanced={flags.advancedWellness}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}

      {flags.social && (
        <div id="dashboard-advanced-social" className="scroll-mt-24">
          <ErrorBoundary section="AdvancedSocialHub">
            <Suspense fallback={<LazyPanelFallback />}>
              <AdvancedSocialHub profile={profile} />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}

      {flags.recovery && (
        <>
          <Suspense fallback={<LazyPanelFallback />}>
            <BiohackingWidget />
          </Suspense>
          <RecoveryReadinessSection history={history} />
        </>
      )}

      {flags.advancedWellness && (
        <section className="mb-8 space-y-6">
          <div className="border-b-2 border-brand-light/10 pb-4">
            <h2 className="font-display text-4xl uppercase text-brand-light">
              Bem-estar, Sustentabilidade & Retrospectiva
            </h2>
          </div>
          <Suspense fallback={<LazyPanelFallback />}>
            <CalmModePanel />
            <EcoLiftingPanel history={history} />
            <TimeTravelProgressViewer history={history} />
          </Suspense>
        </section>
      )}

      {flags.accessibility && (
        <section id="dashboard-accessibility" className="mb-8 scroll-mt-24 space-y-6">
          <div className="border-b-2 border-brand-light/10 pb-4">
            <h2 className="font-display text-4xl uppercase text-brand-light">
              Acessibilidade &amp; Bem-estar
            </h2>
          </div>
          <Suspense fallback={<LazyPanelFallback />}>
            <PainCheckinPanel />
            <AdaptivePathwaysPanel />
            <div className="grid gap-6 md:grid-cols-2">
              <HighContrastModeToggle />
              <PlainLanguagePanel />
            </div>
            <ScreenReaderSupportPanel />
            <AdaptiveProtocolsPanel />
          </Suspense>
        </section>
      )}

      {(flags.premiumUx || flags.mediaEnhancements || flags.workoutImport) && (
        <section className="mb-8 space-y-6">
          <div className="border-b-2 border-brand-light/10 pb-4">
            <h2 className="font-display text-4xl uppercase text-brand-light">
              Dados, Premium UX &amp; Midia
            </h2>
          </div>
          <Suspense fallback={<LazyPanelFallback />}>
            {(flags.premiumUx || flags.mediaEnhancements) && (
              <div className="grid gap-6 md:grid-cols-2">
                {flags.premiumUx && <ThemeCustomizationPanel />}
                {flags.mediaEnhancements && <PictureInPicturePanel />}
              </div>
            )}
            {flags.workoutImport && <WorkoutImportPanel />}
          </Suspense>
        </section>
      )}

      {flags.advancedAi && (
        <section className="mb-8 space-y-6">
          <div className="border-b-2 border-brand-light/10 pb-4">
            <h2 className="font-display text-4xl uppercase text-brand-light">
              IA, Habitos &amp; Tecnologias Futuras
            </h2>
          </div>
          <Suspense fallback={<LazyPanelFallback />}>
            <div className="grid gap-6 md:grid-cols-2">
              <EquipmentReplanPanel />
              {flags.nutrition && <PantryPlannerPanel />}
            </div>
            <LongevitySignalPanel history={history} />
            <div className="grid gap-6 md:grid-cols-2">
              {flags.cameraFormCheck && <FormCheckerPreviewPanel />}
              {flags.webxr && (
                <ErrorBoundary section="WebXRPreviewPanel">
                  <WebXRPreviewPanel />
                </ErrorBoundary>
              )}
            </div>
          </Suspense>
        </section>
      )}

      {(flags.premiumIntegrations || flags.partnerTokens) && (
        <section className="mb-8 space-y-6">
          <div className="border-b-2 border-brand-light/10 pb-4">
            <h2 className="font-display text-4xl uppercase text-brand-light">
              Integracoes comerciais internas
            </h2>
          </div>
          <Suspense fallback={<LazyPanelFallback />}>
            <div className="grid gap-6 md:grid-cols-2">
              {flags.premiumIntegrations && <BossFightCancellationPreview />}
              {flags.partnerTokens && <PartnerTokenPreview />}
            </div>
          </Suspense>
        </section>
      )}
    </>
  );
}
