import { describe, it, expect } from 'vitest';
import { toggleExerciseCompletion, calculateWorkoutProgress } from '../src/rules/workoutEngine';
import { Exercise } from '../src/services/workoutDatabase';

describe('workoutEngine', () => {
  describe('toggleExerciseCompletion', () => {
    it('should toggle completed status from false to true', () => {
      const exercises: Exercise[] = [
        { id: '1', name: 'Bench Press', sets: 3, reps: '10', weight: 50, completed: false }
      ];
      const result = toggleExerciseCompletion(exercises, '1');
      expect(result[0].completed).toBe(true);
      expect(result[0].id).toBe('1');
    });

    it('should toggle completed status from true to false', () => {
      const exercises: Exercise[] = [
        { id: '1', name: 'Bench Press', sets: 3, reps: '10', weight: 50, completed: true }
      ];
      const result = toggleExerciseCompletion(exercises, '1');
      expect(result[0].completed).toBe(false);
    });

    it('should only toggle the targeted exercise', () => {
      const exercises: Exercise[] = [
        { id: '1', name: 'Bench Press', sets: 3, reps: '10', weight: 50, completed: false },
        { id: '2', name: 'Squat', sets: 3, reps: '10', weight: 100, completed: false }
      ];
      const result = toggleExerciseCompletion(exercises, '2');
      expect(result[0].completed).toBe(false);
      expect(result[1].completed).toBe(true);
    });

    it('should return original array if exerciseId is not found', () => {
      const exercises: Exercise[] = [
        { id: '1', name: 'Bench Press', sets: 3, reps: '10', weight: 50, completed: false }
      ];
      const result = toggleExerciseCompletion(exercises, '3');
      expect(result).toEqual(exercises);
    });
  });

  describe('calculateWorkoutProgress', () => {
    it('should return 0 when exercises array is empty', () => {
      expect(calculateWorkoutProgress([])).toBe(0);
    });

    it('should return 0 when no exercises are completed', () => {
      const exercises: Exercise[] = [
        { id: '1', name: 'Bench Press', sets: 3, reps: '10', weight: 50, completed: false },
        { id: '2', name: 'Squat', sets: 3, reps: '10', weight: 100, completed: false }
      ];
      expect(calculateWorkoutProgress(exercises)).toBe(0);
    });

    it('should return 50 when half of the exercises are completed', () => {
      const exercises: Exercise[] = [
        { id: '1', name: 'Bench Press', sets: 3, reps: '10', weight: 50, completed: true },
        { id: '2', name: 'Squat', sets: 3, reps: '10', weight: 100, completed: false }
      ];
      expect(calculateWorkoutProgress(exercises)).toBe(50);
    });

    it('should return 100 when all exercises are completed', () => {
      const exercises: Exercise[] = [
        { id: '1', name: 'Bench Press', sets: 3, reps: '10', weight: 50, completed: true },
        { id: '2', name: 'Squat', sets: 3, reps: '10', weight: 100, completed: true }
      ];
      expect(calculateWorkoutProgress(exercises)).toBe(100);
    });

    it('should properly round decimal percentages', () => {
      const exercises: Exercise[] = [
        { id: '1', name: 'Bench Press', sets: 3, reps: '10', weight: 50, completed: true },
        { id: '2', name: 'Squat', sets: 3, reps: '10', weight: 100, completed: false },
        { id: '3', name: 'Deadlift', sets: 3, reps: '10', weight: 120, completed: false }
      ];
      // 1/3 = 33.333% -> 33
      expect(calculateWorkoutProgress(exercises)).toBe(33);
    });
  });
});
