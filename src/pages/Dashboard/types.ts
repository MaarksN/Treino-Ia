import { WorkoutExerciseLog } from '../../services/database';

export type ActiveExerciseDraft = Omit<WorkoutExerciseLog, 'actualWeight' | 'actualReps' | 'rpe'> & {
  actualWeight: string;
  actualReps: string;
  rpe: string;
};
