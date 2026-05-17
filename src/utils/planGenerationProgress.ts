import { type TrainingPlan, type UserProfile, type WorkoutSession } from '../services/database';

export interface PlanGenerationProgressStep {
  id: string;
  label: string;
  detail: string;
  metric: string;
}

export function buildPlanGenerationProgress(
  profile: UserProfile,
  history: WorkoutSession[],
  plan: TrainingPlan
): PlanGenerationProgressStep[] {
  const totalExercises = plan.days.reduce((sum, day) => sum + day.exercises.length, 0);
  const lastSession = history[0];

  return [
    {
      id: 'profile',
      label: 'Perfil aplicado',
      detail: `${profile.level} | ${profile.goal} | ${profile.daysPerWeek}x/semana`,
      metric: `${profile.timePerWorkout} min`,
    },
    {
      id: 'history',
      label: 'Historico analisado',
      detail: lastSession
        ? `${lastSession.completedExercises}/${lastSession.totalExercises} exercicios no ultimo treino`
        : 'Primeiro plano sem historico finalizado',
      metric: `${history.length} sessoes`,
    },
    {
      id: 'plan',
      label: 'Divisao recalculada',
      detail: plan.weeklySplit,
      metric: `${plan.days.length} dias`,
    },
    {
      id: 'volume',
      label: 'Volume estimado',
      detail: `${plan.volume} com foco em ${plan.focus}`,
      metric: `${totalExercises} exercicios`,
    },
  ];
}

export function getPlanGenerationProgressPercent(completedSteps: number, totalSteps: number) {
  if (totalSteps <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((completedSteps / totalSteps) * 100)));
}
