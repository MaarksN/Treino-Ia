import { WorkoutSession } from '../entities/WorkoutSession';

export interface ITrainingRepository {
  findById(id: string): Promise<WorkoutSession | null>;
  findByUserId(userId: string): Promise<WorkoutSession[]>;
  save(session: WorkoutSession): Promise<void>;
}
