import { ITrainingRepository } from '../../domain/repositories/ITrainingRepository';
import { WorkoutSession } from '../../domain/entities/WorkoutSession';
import { LogWorkoutSessionRequestDTO, WorkoutSessionDTO } from '../dto/WorkoutSessionDTO';

export class LogWorkoutSessionUseCase {
  constructor(private readonly trainingRepository: ITrainingRepository) {}

  public async execute(request: LogWorkoutSessionRequestDTO): Promise<WorkoutSessionDTO> {
    const session = WorkoutSession.create({
      ...request,
      completedAt: Date.now(),
    });

    await this.trainingRepository.save(session);

    return {
      id: session.id,
      planId: session.planId,
      dayId: session.dayId,
      userId: session.userId,
      completedAt: session.completedAt,
      durationMinutes: session.durationMinutes,
      totalVolume: session.totalVolume,
      logs: session.logs,
    };
  }
}
