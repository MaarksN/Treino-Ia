import { Entity } from './Entity';
import { WorkoutVolume } from '../value-objects/WorkoutVolume';

export interface ExerciseLogProps {
  exerciseId: string;
  exerciseName: string;
  setsCompleted: number;
  totalVolumeLifted: WorkoutVolume;
}

interface WorkoutSessionProps {
  planId: string;
  dayId: string;
  userId: string;
  completedAt: number;
  durationMinutes: number;
  totalVolume: WorkoutVolume;
  logs: ExerciseLogProps[];
}

export class WorkoutSession extends Entity<WorkoutSessionProps> {
  private constructor(props: WorkoutSessionProps, id?: string) {
    super(props, id);
  }

  public static create(props: {
    planId: string;
    dayId: string;
    userId: string;
    completedAt: number;
    durationMinutes: number;
    totalVolume: number;
    logs: { exerciseId: string; exerciseName: string; setsCompleted: number; totalVolumeLifted: number }[];
  }, id?: string): WorkoutSession {
    return new WorkoutSession({
      planId: props.planId,
      dayId: props.dayId,
      userId: props.userId,
      completedAt: props.completedAt,
      durationMinutes: props.durationMinutes,
      totalVolume: new WorkoutVolume(props.totalVolume),
      logs: props.logs.map(log => ({
        ...log,
        totalVolumeLifted: new WorkoutVolume(log.totalVolumeLifted)
      }))
    }, id);
  }

  get planId(): string { return this.props.planId; }
  get dayId(): string { return this.props.dayId; }
  get userId(): string { return this.props.userId; }
  get completedAt(): number { return this.props.completedAt; }
  get durationMinutes(): number { return this.props.durationMinutes; }
  get totalVolume(): number { return this.props.totalVolume.getValue(); }
  get logs(): { exerciseId: string; exerciseName: string; setsCompleted: number; totalVolumeLifted: number }[] {
    return this.props.logs.map(log => ({
      ...log,
      totalVolumeLifted: log.totalVolumeLifted.getValue()
    }));
  }
}
