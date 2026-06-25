import {
  type UserProfile,
  type WorkoutSession,
  type TrainingPlan,
  DatabaseService,
} from '../../../services/database';
import { CurrentPlanConsistencyHelper } from '../../../services/data/currentPlanConsistency';
import { calculateTrainingPlan } from '../../../rules/iaEngine';
import {
  reorderExercisesInDay,
} from './workoutAuthoring';
import { trackEvent, trackEventOnce } from '../../../utils/analytics';
import { captureError } from '../../../utils/errorTelemetry';
import { validateDashboardProfileInput } from './dashboardValidation';

const PLAN_GENERATION_FEEDBACK_MS = 750;

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export interface PlanUpdateResult {
  profile: UserProfile;
  plan: TrainingPlan;
  notice: string;
  error: string;
}

export async function updateProfileAndRecalculatePlan(
  formProfile: UserProfile,
  history: WorkoutSession[],
  currentProfile: UserProfile | null,
  currentPlan: TrainingPlan | null,
): Promise<PlanUpdateResult | null> {
  const validation = validateDashboardProfileInput(formProfile);
  if (!validation.success) {
    return {
      profile: formProfile,
      plan: currentPlan!,
      notice: '',
      error: validation.message,
    };
  }

  const isFirstPlan = !currentProfile || !currentPlan;

  try {
    const updatedProfile = validation.data;
    const startedAt = Date.now();
    const nextPlan = calculateTrainingPlan(updatedProfile, history);

    await DatabaseService.saveProfile(updatedProfile);
    const res = await CurrentPlanConsistencyHelper.setCurrentPlan(nextPlan);

    let notice = '';
    if (res.status === 'local_fallback') {
      notice = 'Plano salvo localmente. Aguardando sincronização.';
    } else {
      notice = 'Anamnese salva e plano semanal recalculado.';
    }

    // Move wait logic to component to handle PlanGenerationProgress if needed,
    // but keeping it here for consistency with original logic if desired.
    // However, the reviewer noted regressions in visual feedback.
    await wait(Math.max(0, PLAN_GENERATION_FEEDBACK_MS - (Date.now() - startedAt)));

    trackEvent('anamnesis_completed', {
      goal: updatedProfile.goal,
      level: updatedProfile.level,
      daysPerWeek: updatedProfile.daysPerWeek,
    });

    if (isFirstPlan) {
      trackEventOnce('first_plan_created', {
        planId: nextPlan.id,
        daysPerWeek: updatedProfile.daysPerWeek,
        source: 'anamnesis_submit',
      });
    }

    return {
      profile: updatedProfile,
      plan: nextPlan,
      notice,
      error: '',
    };
  } catch (err) {
    captureError(err, 'dashboardPlanService.updateProfileAndRecalculatePlan');
    return {
      profile: formProfile,
      plan: currentPlan!,
      notice: '',
      error: 'Não consegui salvar a anamnese agora.',
    };
  }
}

export async function regeneratePlanFromHistory(
  profile: UserProfile,
  history: WorkoutSession[],
): Promise<PlanUpdateResult | null> {
  try {
    const startedAt = Date.now();
    const updatedProfile = { ...profile, updatedAt: Date.now() };
    const nextPlan = calculateTrainingPlan(updatedProfile, history);

    const res = await CurrentPlanConsistencyHelper.setCurrentPlan(nextPlan);
    let notice = 'Plano recalculado com base no histórico mais recente.';
    if (res.status === 'local_fallback') {
      notice = 'Plano salvo localmente. Aguardando sincronização.';
    }

    await wait(Math.max(0, PLAN_GENERATION_FEEDBACK_MS - (Date.now() - startedAt)));

    return {
      profile: updatedProfile,
      plan: nextPlan,
      notice,
      error: '',
    };
  } catch (err) {
    captureError(err, 'dashboardPlanService.regeneratePlanFromHistory');
    return {
      profile,
      plan: null as unknown as TrainingPlan,
      notice: '',
      error: 'Não consegui recalcular o plano agora.',
    };
  }
}

export async function reorderExercises(
  plan: TrainingPlan,
  dayIndex: number,
  fromIndex: number,
  toIndex: number,
): Promise<{ plan: TrainingPlan; notice: string; error: string }> {
  const nextPlan = reorderExercisesInDay(plan, dayIndex, fromIndex, toIndex);
  if (nextPlan === plan) return { plan, notice: '', error: '' };

  try {
    const res = await CurrentPlanConsistencyHelper.setCurrentPlan(nextPlan);
    let notice = 'Ordem dos exercícios atualizada.';
    if (res.status === 'local_fallback') {
      notice = 'Plano salvo localmente. Aguardando sincronização.';
    }
    return { plan: nextPlan, notice, error: '' };
  } catch (err) {
    return { plan: nextPlan, notice: '', error: 'Alteração aplicada na tela, mas não consegui salvar o plano agora.' };
  }
}
