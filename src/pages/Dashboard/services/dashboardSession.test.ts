import { describe, expect, it } from 'vitest';
import { createActiveDraft, persistStarterUser, readStarterUser } from './dashboardSession';
import { type TrainingPlan, type WorkoutSession } from '../../../services/database';

const day: TrainingPlan['days'][number] = {
  id: 'd1',
  dayName: 'Dia 1',
  focus: 'Peito',
  exercises: [{
    id: 'supino',
    name: 'Supino reto',
    muscleGroup: 'Peitoral',
    sets: 2,
    reps: '8-10',
    rest: '90s',
    notes: '',
  }],
};

describe('dashboardSession', () => {
  it('cria draft ativo com sugestao do historico recente', () => {
    const draft = createActiveDraft(day, [createSession(100)]);

    expect(draft[0].sets).toHaveLength(2);
    expect(draft[0].sets[0].autofillSuggested).toBe(true);
    expect(draft[0].sets[0].suggestedWeight).toBe('10');
    expect(draft[0].sets[1].autofillSuggested).toBe(false);
  });

  it('isola leitura quebrada de starter user', () => {
    const storage = {
      getItem: () => '{invalid-json',
    };

    expect(readStarterUser(storage)).toBeNull();
  });

  it('normaliza starter user antes de persistir', () => {
    const writes: string[] = [];
    const saved = persistStarterUser(
      { name: '  Maria  ', email: ' maria@example.com ', avatarUrl: 'avatar' },
      { setItem: (_key, value) => writes.push(value) },
    );

    expect(saved.name).toBe('Maria');
    expect(saved.email).toBe('maria@example.com');
    expect(writes[0]).toContain('"createdAt"');
  });
});

function createSession(volume: number): WorkoutSession {
  return {
    id: 's1',
    planId: 'p1',
    dayId: 'd1',
    dayName: 'Dia 1',
    focus: 'Peito',
    completedAt: Date.now(),
    durationMinutes: 45,
    totalVolume: volume,
    completedExercises: 1,
    totalExercises: 1,
    feedback: '',
    nextRecommendation: '',
    exercises: [{
      exerciseId: 'supino',
      name: 'Supino reto',
      targetSets: 2,
      targetReps: '8-10',
      targetRest: '90s',
      completed: true,
      sets: [{ weight: volume / 10, reps: 10, rpe: 8 }],
    }],
  };
}
