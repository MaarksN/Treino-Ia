import { type WorkoutExerciseLog } from '../../services/database';

export interface DraftSet {
  weight: string;
  reps: string;
  rpe: string;
  completed: boolean;
}

export type ActiveExerciseDraft = Omit<WorkoutExerciseLog, 'sets' | 'actualWeight' | 'actualReps' | 'rpe'> & {
  sets: DraftSet[];
  plateauDetected?: boolean;
};
