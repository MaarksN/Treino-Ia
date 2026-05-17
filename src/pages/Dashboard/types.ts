import { type ExerciseIntensityTechnique, type WorkoutExerciseLog } from '../../services/database';

export interface DraftSet {
  weight: string;
  reps: string;
  rpe: string;
  completed: boolean;
  autofillSuggested?: boolean;
  suggestedWeight?: string;
  suggestedReps?: string;
  suggestedRpe?: string;
}

export type ActiveExerciseDraft = Omit<WorkoutExerciseLog, 'sets' | 'actualWeight' | 'actualReps' | 'rpe'> & {
  sets: DraftSet[];
  exerciseNote?: string;
  intensityTechnique?: ExerciseIntensityTechnique;
  supersetGroupId?: string;
  plateauDetected?: boolean;
  plateauReason?: string;
};
