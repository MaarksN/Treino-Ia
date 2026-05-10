import { describe, expect, it } from 'vitest';
import {
  calculateWeeklyMuscleVolumes,
  classifyVolume,
  createLoadSuggestion,
  nextLoad,
  shouldSuggestExerciseSwap,
} from '../src/utils/periodizationUtils';
import { TrainingExercisePerformance } from '../src/types';

describe('periodizationUtils', () => {
  it('classifica volume semanal nos quatro estados esperados', () => {
    expect(classifyVolume(4, 8, 14, 20).status).toBe('below_mev');
    expect(classifyVolume(12, 8, 14, 20).status).toBe('optimal');
    expect(classifyVolume(18, 8, 14, 20).status).toBe('high_tolerable');
    expect(classifyVolume(24, 8, 14, 20).status).toBe('above_mrv');
  });

  it('soma apenas séries efetivas de exercícios concluídos', () => {
    const rows = calculateWeeklyMuscleVolumes([
      { exerciseName: 'Supino Reto', muscle: 'Peito', sets: 4, currentLoad: 80, targetReps: 10, actualReps: 10, rpe: 8, completed: true },
      { exerciseName: 'Crucifixo', muscle: 'Peito', sets: 4, currentLoad: 18, targetReps: 12, actualReps: 12, rpe: 5, completed: true },
      { exerciseName: 'Puxada Frontal', muscle: 'Costas', sets: 3, currentLoad: 60, targetReps: 10, actualReps: 10, rpe: 8, completed: false },
    ]);

    expect(rows.find(row => row.muscle === 'Peito')?.currentVolume).toBe(6);
    expect(rows.find(row => row.muscle === 'Costas')?.currentVolume).toBe(0);
  });

  it('sugere progressão, regressão ou troca com base em performance e fadiga', () => {
    const base: TrainingExercisePerformance = {
      exerciseName: 'Supino Reto',
      sets: 4,
      currentLoad: 100,
      targetReps: 8,
      actualReps: 11,
      rpe: 7,
    };

    expect(createLoadSuggestion(base, 30).action).toBe('increase');
    expect(createLoadSuggestion({ ...base, actualReps: 5, rpe: 9 }, 40).action).toBe('decrease');
    expect(createLoadSuggestion({ ...base, pain: true }, 20).action).toBe('swap');
    expect(shouldSuggestExerciseSwap({ ...base, pain: true })).toBe(true);
    expect(nextLoad(100, 'increase')).toBe(102.5);
  });
});
