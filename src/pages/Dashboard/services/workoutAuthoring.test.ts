import { describe, expect, it } from 'vitest';
import { type TrainingPlan } from '../../../services/database';
import {
  reorderExercisesInDay,
  updateExerciseNotes,
  updateExerciseTechnique,
} from './workoutAuthoring';

const plan: TrainingPlan = {
  id: 'plan-1',
  createdAt: 1,
  planName: 'Plano',
  goalDescription: 'Hipertrofia',
  volume: 'moderado',
  frequency: '3x',
  focus: 'força',
  weeklySplit: 'ABC',
  aiRecommendation: '',
  nextRecommendation: '',
  days: [{
    id: 'day-1',
    dayName: 'A',
    focus: 'Peito',
    exercises: [
      { id: 'ex-1', name: 'Supino', muscleGroup: 'Peito', sets: 3, reps: '8', rest: '90s', notes: '' },
      { id: 'ex-2', name: 'Crucifixo', muscleGroup: 'Peito', sets: 3, reps: '12', rest: '60s', notes: '' },
      { id: 'ex-3', name: 'Triceps', muscleGroup: 'Braços', sets: 3, reps: '10', rest: '60s', notes: '' },
    ],
  }],
};

describe('workoutAuthoring', () => {
  it('reordena exercicios dentro do dia sem mutar o plano original', () => {
    const updated = reorderExercisesInDay(plan, 0, 0, 2);

    expect(updated.days[0].exercises.map(exercise => exercise.id)).toEqual(['ex-2', 'ex-3', 'ex-1']);
    expect(plan.days[0].exercises.map(exercise => exercise.id)).toEqual(['ex-1', 'ex-2', 'ex-3']);
  });

  it('cria grupo de superset com o proximo exercicio', () => {
    const updated = updateExerciseTechnique(plan, 0, 0, 'superset');
    const [first, second] = updated.days[0].exercises;

    expect(first.intensityTechnique).toBe('superset');
    expect(second.intensityTechnique).toBe('superset');
    expect(first.supersetGroupId).toBe(second.supersetGroupId);
  });

  it('aplica dropset sem schema externo', () => {
    const updated = updateExerciseTechnique(plan, 0, 2, 'dropset');

    expect(updated.days[0].exercises[2].intensityTechnique).toBe('dropset');
    expect(updated.days[0].exercises[2].supersetGroupId).toBeUndefined();
  });

  it('atualiza nota textual por exercicio', () => {
    const updated = updateExerciseNotes(plan, 0, 1, 'Reduzir amplitude se ombro incomodar.');

    expect(updated.days[0].exercises[1].notes).toBe('Reduzir amplitude se ombro incomodar.');
  });
});
