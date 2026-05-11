import { Exercise, PersonalRecord, WorkoutHistoryRecord, WorkoutSession } from '../types';
import { LibraryExercise } from '../data/exerciseLibrary';

export type DataMode = 'supabase' | 'mock_dev_only';

export interface PersistResult {
  dataMode: DataMode;
  warning?: string;
}

export interface WorkoutExecutionPayload {
  record: WorkoutHistoryRecord;
  session: WorkoutSession;
  personalRecords: PersonalRecord[];
}

export interface WorkoutExecutionPersistResult extends PersistResult {
  recordId: string;
}

export interface ExerciseLibraryState extends PersistResult {
  exercises: LibraryExercise[];
  favoriteIds: string[];
}

export interface CustomExerciseInput {
  name: string;
  muscleGroup: string;
  movementPattern: string;
  tags: string[];
  videoUrl?: string;
}

export interface LastExercisePerformance {
  exercise: Exercise;
  source: 'workout_history' | 'session';
}
