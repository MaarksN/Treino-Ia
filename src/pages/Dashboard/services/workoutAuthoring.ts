import {
  type ExerciseIntensityTechnique,
  type ExercisePrescription,
  type TrainingPlan,
} from '../../../services/database';

export const EXERCISE_TECHNIQUE_LABELS: Record<ExerciseIntensityTechnique, string> = {
  normal: 'Normal',
  superset: 'Superset',
  dropset: 'Dropset',
};

function isValidIndex(index: number, length: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}

function clonePlanWithExercises(
  plan: TrainingPlan,
  dayIndex: number,
  exercises: ExercisePrescription[],
): TrainingPlan {
  return {
    ...plan,
    days: plan.days.map((day, index) => (
      index === dayIndex ? { ...day, exercises } : day
    )),
  };
}

function clearSupersetGroup(
  exercises: ExercisePrescription[],
  groupId: string | undefined,
): ExercisePrescription[] {
  if (!groupId) return exercises;

  return exercises.map(exercise => {
    if (exercise.supersetGroupId !== groupId) return exercise;

    return {
      ...exercise,
      intensityTechnique: 'normal',
      supersetGroupId: undefined,
    };
  });
}

export function reorderExercisesInDay(
  plan: TrainingPlan,
  dayIndex: number,
  fromIndex: number,
  toIndex: number,
): TrainingPlan {
  const day = plan.days[dayIndex];
  if (!day || !isValidIndex(fromIndex, day.exercises.length) || !isValidIndex(toIndex, day.exercises.length)) {
    return plan;
  }

  if (fromIndex === toIndex) return plan;

  const exercises = [...day.exercises];
  const [moved] = exercises.splice(fromIndex, 1);
  exercises.splice(toIndex, 0, moved);

  return clonePlanWithExercises(plan, dayIndex, exercises);
}

export function updateExerciseTechnique(
  plan: TrainingPlan,
  dayIndex: number,
  exerciseIndex: number,
  technique: ExerciseIntensityTechnique,
): TrainingPlan {
  const day = plan.days[dayIndex];
  if (!day || !isValidIndex(exerciseIndex, day.exercises.length)) return plan;

  const current = day.exercises[exerciseIndex];
  let exercises = clearSupersetGroup([...day.exercises], current.supersetGroupId);

  if (technique === 'superset') {
    const nextIndex = exerciseIndex + 1;
    if (!isValidIndex(nextIndex, exercises.length)) return clonePlanWithExercises(plan, dayIndex, exercises);

    const groupId = `superset-${day.id}-${exerciseIndex}-${nextIndex}`;
    exercises[exerciseIndex] = {
      ...exercises[exerciseIndex],
      intensityTechnique: 'superset',
      supersetGroupId: groupId,
    };
    exercises[nextIndex] = {
      ...exercises[nextIndex],
      intensityTechnique: 'superset',
      supersetGroupId: groupId,
    };

    return clonePlanWithExercises(plan, dayIndex, exercises);
  }

  exercises[exerciseIndex] = {
    ...exercises[exerciseIndex],
    intensityTechnique: technique,
    supersetGroupId: undefined,
  };

  return clonePlanWithExercises(plan, dayIndex, exercises);
}

export function updateExerciseNotes(
  plan: TrainingPlan,
  dayIndex: number,
  exerciseIndex: number,
  notes: string,
): TrainingPlan {
  const day = plan.days[dayIndex];
  if (!day || !isValidIndex(exerciseIndex, day.exercises.length)) return plan;

  const exercises = day.exercises.map((exercise, index) => (
    index === exerciseIndex ? { ...exercise, notes } : exercise
  ));

  return clonePlanWithExercises(plan, dayIndex, exercises);
}

export function getExerciseTechniqueLabel(technique: ExerciseIntensityTechnique | undefined): string {
  return EXERCISE_TECHNIQUE_LABELS[technique ?? 'normal'];
}
