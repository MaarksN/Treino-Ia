import {
  type UserProfile,
  type WorkoutSession,
  type TrainingPlan,
  DatabaseService,
} from '../../../services/database';
import {
  aiRecommendationRepository,
  type AiRecommendationRecord,
} from '../../../services/data/aiRecommendationRepository';
import { trackEvent, trackEventOnce } from '../../../utils/analytics';
import { captureError } from '../../../utils/errorTelemetry';
import { triggerHapticFeedback } from '../../../services/hapticFeedback';
import { buildCompletedDashboardWorkout } from './dashboardWorkoutCompletion';
import { createActiveDraft } from './dashboardSession';
import { type ActiveExerciseDraft } from '../types';

export function startWorkout(
  plan: TrainingPlan,
  dayIndex: number,
  history: WorkoutSession[],
): { activeDraft: ActiveExerciseDraft[]; activeDayIndex: number } {
  const day = plan.days[dayIndex];
  const activeDraft = createActiveDraft(day, history);

  trackEvent('workout_started', {
    planId: plan.id,
    dayId: day.id,
    focus: day.focus,
  });

  if (history.length === 0) {
    trackEventOnce('first_workout_started', {
      planId: plan.id,
      dayId: day.id,
      focus: day.focus,
    });
  }

  void triggerHapticFeedback('selection');

  return { activeDraft, activeDayIndex: dayIndex };
}

export interface WorkoutCompletionResult {
  history: WorkoutSession[];
  pendingRecommendation: AiRecommendationRecord | null;
  notice: string;
  error: string;
}

export async function finishWorkout(
  profile: UserProfile,
  plan: TrainingPlan,
  activeDayIndex: number,
  activeDraft: ActiveExerciseDraft[],
  activeFeedback: string,
  history: WorkoutSession[],
): Promise<WorkoutCompletionResult> {
  try {
    const {
      adjustedPlan,
      completedExercises,
      completedSession,
      day,
      finalHistory,
      totalExercises,
      totalVolume,
    } = buildCompletedDashboardWorkout({
      activeDayIndex,
      activeDraft,
      activeFeedback,
      history,
      plan,
      profile,
    });

    const saveResult = await DatabaseService.saveWorkoutSessionWithStatus(completedSession);
    let recommendation: AiRecommendationRecord | null = null;

    try {
      recommendation = await aiRecommendationRepository.createPendingPlanRecommendation({
        currentPlan: plan,
        proposedPlan: adjustedPlan,
        reason: adjustedPlan.nextRecommendation,
        legacySourceSessionId: completedSession.id,
      });
    } catch (recommendationError) {
      trackEvent('ai_error', {
        operation: 'create_pending_plan_recommendation',
        source: 'finish_active_workout',
      });
      captureError(recommendationError, 'dashboardWorkoutService.createPendingAiRecommendation');
    }

    const saveMessage =
      'warning' in saveResult && saveResult.warning
        ? `${saveResult.message} ${saveResult.warning}`
        : saveResult.message;

    const notice = recommendation
      ? `${saveMessage} A IA gerou uma sugestao pendente para voce revisar.`
      : `${saveMessage} Nao consegui gerar a sugestao da IA agora; seu historico foi mantido.`;

    trackEvent('workout_completed', {
      planId: plan.id,
      dayId: day.id,
      totalVolume,
      completedExercises,
      totalExercises,
    });

    if (history.length === 0) {
      trackEventOnce('first_workout_completed', {
        planId: plan.id,
        dayId: day.id,
        totalVolume,
        completedExercises,
        totalExercises,
      });
    }

    if (recommendation) {
      trackEvent('ai_suggestion_generated', {
        recommendationId: recommendation.id,
        sourceSessionId: completedSession.id,
      });
    }

    void triggerHapticFeedback('success');

    return {
      history: finalHistory,
      pendingRecommendation: recommendation,
      notice,
      error: '',
    };
  } catch (err) {
    trackEvent('workout_save_failed', {
      planId: plan.id,
      dayId: plan.days[activeDayIndex]?.id,
    });
    captureError(err, 'dashboardWorkoutService.finishWorkout');
    return {
      history,
      pendingRecommendation: null,
      notice: '',
      error: 'Não consegui finalizar o treino agora.',
    };
  }
}
