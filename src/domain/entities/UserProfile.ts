import { Entity } from './Entity';
import { Age } from '../value-objects/Age';
import { Weight } from '../value-objects/Weight';
import { Height } from '../value-objects/Height';
import { ExperienceLevel } from '../value-objects/ExperienceLevel';

export interface UserProfileProps {
  userId: string;
  age: Age;
  gender: string;
  weight: Weight;
  height: Height;
  bodyFatPercent?: number;
  experienceLevel: ExperienceLevel;
  goal: string;
  secondaryGoal?: string;
  daysPerWeek: number;
  sessionDuration?: string;
  preferredTime?: string;
  injuries: string;
  equipment?: string;
  gymType?: string;
  sleepHours?: string;
  stressLevel?: string;
  preferredMethods?: string[];
  weakPoints?: string;
  timePerWorkout?: number;
  workoutLocation?: string;
  secondaryFocus?: string;
}

export interface UserProfilePrimitiveProps {
  userId: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  bodyFatPercent?: number;
  experienceLevel: string;
  goal: string;
  secondaryGoal?: string;
  daysPerWeek: number;
  sessionDuration?: string;
  preferredTime?: string;
  injuries: string;
  equipment?: string;
  gymType?: string;
  sleepHours?: string;
  stressLevel?: string;
  preferredMethods?: string[];
  weakPoints?: string;
  timePerWorkout?: number;
  workoutLocation?: string;
  secondaryFocus?: string;
}

export class UserProfile extends Entity<UserProfileProps> {
  private constructor(props: UserProfileProps, id?: string) {
    super(props, id);
  }

  public static create(props: UserProfilePrimitiveProps, id?: string): UserProfile {
    return new UserProfile(
      {
        ...props,
        age: new Age(props.age),
        weight: new Weight(props.weight),
        height: new Height(props.height),
        experienceLevel: new ExperienceLevel(props.experienceLevel),
      },
      id
    );
  }

  get userId(): string { return this.props.userId; }
  get age(): number { return this.props.age.getValue(); }
  get gender(): string { return this.props.gender; }
  get weight(): number { return this.props.weight.getValue(); }
  get height(): number { return this.props.height.getValue(); }
  get bodyFatPercent(): number | undefined { return this.props.bodyFatPercent; }
  get experienceLevel(): string { return this.props.experienceLevel.getValue(); }
  get goal(): string { return this.props.goal; }
  get secondaryGoal(): string | undefined { return this.props.secondaryGoal; }
  get daysPerWeek(): number { return this.props.daysPerWeek; }
  get sessionDuration(): string | undefined { return this.props.sessionDuration; }
  get preferredTime(): string | undefined { return this.props.preferredTime; }
  get injuries(): string { return this.props.injuries; }
  get equipment(): string | undefined { return this.props.equipment; }
  get gymType(): string | undefined { return this.props.gymType; }
  get sleepHours(): string | undefined { return this.props.sleepHours; }
  get stressLevel(): string | undefined { return this.props.stressLevel; }
  get preferredMethods(): string[] | undefined { return this.props.preferredMethods; }
  get weakPoints(): string | undefined { return this.props.weakPoints; }
  get timePerWorkout(): number | undefined { return this.props.timePerWorkout; }
  get workoutLocation(): string | undefined { return this.props.workoutLocation; }
  get secondaryFocus(): string | undefined { return this.props.secondaryFocus; }
}
