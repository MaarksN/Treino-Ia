import { describe, it, expect } from 'vitest';
import { ProgressionEngine } from './progressionEngine';
import type { WorkoutSession, UserProfile } from './database';

describe('progressionEngine', () => {
  it('retorna insufficient_data com histórico vazio', () => {
    const profile = {} as UserProfile;
    const history: WorkoutSession[] = [];
    
    const result = ProgressionEngine.getSuggestionForExercise('ex1', 'Supino', history);
    expect(result.action).toBe('insufficient_data');
  });

  it('sugere increase quando completou séries e reps consistentemente', () => {
    const history: WorkoutSession[] = [{
      id: '1', planId: '1', dayId: '1', dayName: 'A', focus: 'Peito', completedAt: 1, durationMinutes: 60, totalVolume: 100, completedExercises: 1, totalExercises: 1, feedback: '', nextRecommendation: '', exercises: [
        {
          exerciseId: 'ex1', name: 'Supino', targetSets: 1, targetReps: '10', targetRest: '60s', completed: true, actualWeight: 100, 
          sets: [{ reps: 10, rpe: 7, weight: 100 }]
        }
      ]
    }];
    
    const result = ProgressionEngine.getSuggestionForExercise('ex1', 'Supino', history);
    expect(result.action).toBe('increase');
    expect(result.suggestedLoad).toBeGreaterThan(100);
  });

  it('sugere maintain quando performance é mediana (alto RPE)', () => {
    const history: WorkoutSession[] = [{
      id: '1', planId: '1', dayId: '1', dayName: 'A', focus: 'Peito', completedAt: 1, durationMinutes: 60, totalVolume: 100, completedExercises: 1, totalExercises: 1, feedback: '', nextRecommendation: '', exercises: [
        {
          exerciseId: 'ex1', name: 'Supino', targetSets: 1, targetReps: '10', targetRest: '60s', completed: true, actualWeight: 100, 
          sets: [{ reps: 10, rpe: 9.5, weight: 100 }]
        }
      ]
    }];
    
    const result = ProgressionEngine.getSuggestionForExercise('ex1', 'Supino', history);
    expect(result.action).toBe('maintain');
    expect(result.suggestedLoad).toBe(100);
  });

  it('sugere decrease quando há falhas repetidas', () => {
    const history: WorkoutSession[] = [{
      id: '1', planId: '1', dayId: '1', dayName: 'A', focus: 'Peito', completedAt: 1, durationMinutes: 60, totalVolume: 100, completedExercises: 1, totalExercises: 1, feedback: '', nextRecommendation: '', exercises: [
        {
          exerciseId: 'ex1', name: 'Supino', targetSets: 1, targetReps: '10', targetRest: '60s', completed: true, actualWeight: 100, 
          sets: [{ reps: 5, rpe: 10, weight: 100 }]
        }
      ]
    }];
    
    const result = ProgressionEngine.getSuggestionForExercise('ex1', 'Supino', history);
    expect(result.action).toBe('decrease');
    expect(result.suggestedLoad).toBeLessThan(100);
  });

  it('não retorna carga negativa', () => {
    const history: WorkoutSession[] = [{
      id: '1', planId: '1', dayId: '1', dayName: 'A', focus: 'Peito', completedAt: 1, durationMinutes: 60, totalVolume: 100, completedExercises: 1, totalExercises: 1, feedback: '', nextRecommendation: '', exercises: [
        {
          exerciseId: 'ex1', name: 'Supino', targetSets: 1, targetReps: '10', targetRest: '60s', completed: true, actualWeight: 0, 
          sets: [{ reps: 5, rpe: 10, weight: 0 }]
        }
      ]
    }];
    
    const result = ProgressionEngine.getSuggestionForExercise('ex1', 'Supino', history);
    expect(result.suggestedLoad).toBeGreaterThanOrEqual(0);
  });

  it('não quebra com campos opcionais ausentes', () => {
    const history: WorkoutSession[] = [{
      id: '1', planId: '1', dayId: '1', dayName: 'A', focus: 'Peito', completedAt: 1, durationMinutes: 60, totalVolume: 100, completedExercises: 1, totalExercises: 1, feedback: '', nextRecommendation: '', exercises: [
        { exerciseId: 'ex1', name: 'Supino', targetSets: 1, targetReps: '10', targetRest: '60s', completed: true }
      ]
    }];
    
    const result = ProgressionEngine.getSuggestionForExercise('ex1', 'Supino', history);
    expect(result.action).toBe('maintain'); // because previousLoad is 0
  });
});
