export interface ExerciseLogDTO {
  exerciseId: string;
  exerciseName: string;
  setsCompleted: number;
  totalVolumeLifted: number;
}

export interface WorkoutSessionDTO {
  id: string;
  planId: string;
  dayId: string;
  userId: string;
  completedAt: number;
  durationMinutes: number;
  totalVolume: number;
  logs: ExerciseLogDTO[];
}

export type LogWorkoutSessionRequestDTO = Omit<WorkoutSessionDTO, 'id' | 'completedAt'>;
