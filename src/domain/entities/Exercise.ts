import { Entity } from './Entity';

interface ExerciseProps {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  videoUrl?: string;
  muscleGroup?: string;
  movementPattern?: string;
  tags?: string[];
  isCustom?: boolean;
}

export class Exercise extends Entity<ExerciseProps> {
  private constructor(props: ExerciseProps, id?: string) {
    super(props, id);
  }

  public static create(props: ExerciseProps, id?: string): Exercise {
    return new Exercise(props, id);
  }

  get name(): string { return this.props.name; }
  get sets(): number { return this.props.sets; }
  get reps(): string { return this.props.reps; }
  get rest(): string { return this.props.rest; }
  get videoUrl(): string | undefined { return this.props.videoUrl; }
  get muscleGroup(): string | undefined { return this.props.muscleGroup; }
  get movementPattern(): string | undefined { return this.props.movementPattern; }
  get tags(): string[] | undefined { return this.props.tags; }
  get isCustom(): boolean | undefined { return this.props.isCustom; }
}
