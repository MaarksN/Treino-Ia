import { type User as StarterUser } from '../../../types';
import { type TrainingPlan, type WorkoutSession } from '../../../services/database';
import { type ActiveExerciseDraft } from '../types';
import { detectSimplePlateau, suggestInitialExerciseDraft } from './activeWorkoutEngine';

export const STARTER_USER_KEY = '@TreinoIA:starterUser';

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'setItem'>;
type PersistedStarterUser = StarterUser & { createdAt: number };

function getReadableStorage(): ReadableStorage | null {
  return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
}

function getWritableStorage(): WritableStorage | null {
  return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
}

export function createDashboardSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `session_${crypto.randomUUID()}`;
  }

  return `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function createActiveDraft(
  day: TrainingPlan['days'][number],
  history: WorkoutSession[],
): ActiveExerciseDraft[] {
  return day.exercises.map(exercise => {
    const suggestion = suggestInitialExerciseDraft(exercise.id, history);
    const plateau = detectSimplePlateau(exercise.id, history);

    const sets = Array.from({ length: exercise.sets }).map((_, index) => ({
      weight: '',
      reps: '',
      rpe: '8',
      completed: false,
      autofillSuggested: suggestion.hasSuggestion && index === 0,
      suggestedWeight: index === 0 ? suggestion.weight : undefined,
      suggestedReps: index === 0 ? suggestion.reps : undefined,
      suggestedRpe: index === 0 ? suggestion.rpe : undefined,
    }));

    return {
      exerciseId: exercise.id,
      name: exercise.name,
      targetSets: exercise.sets,
      targetReps: exercise.reps,
      targetRest: exercise.rest,
      completed: false,
      sets,
      exerciseNote: '',
      intensityTechnique: exercise.intensityTechnique ?? 'normal',
      supersetGroupId: exercise.supersetGroupId,
      plateauDetected: plateau.isPlateau,
      plateauReason: plateau.reason,
    };
  });
}

export function readStarterUser(storage: ReadableStorage | null = getReadableStorage()): StarterUser | null {
  if (!storage) return null;

  try {
    const raw = storage.getItem(STARTER_USER_KEY);
    return raw ? JSON.parse(raw) as StarterUser : null;
  } catch {
    return null;
  }
}

export function persistStarterUser(
  starterUser: StarterUser,
  storage: WritableStorage | null = getWritableStorage(),
): StarterUser {
  const normalized: PersistedStarterUser = {
    ...starterUser,
    name: starterUser.name.trim(),
    email: starterUser.email.trim(),
    createdAt: Date.now(),
  };

  storage?.setItem(STARTER_USER_KEY, JSON.stringify(normalized));
  return normalized;
}
