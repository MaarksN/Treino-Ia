import { IUserProfileRepository } from '../../domain/repositories/IUserProfileRepository';
import { UserProfile } from '../../domain/entities/UserProfile';
import { CreateUserProfileRequestDTO, UserProfileDTO } from '../dto/UserProfileDTO';
import { DomainError } from '../../domain/exceptions/DomainError';

export class CreateUserProfileUseCase {
  constructor(private readonly userProfileRepository: IUserProfileRepository) {}

  public async execute(request: CreateUserProfileRequestDTO): Promise<UserProfileDTO> {
    const existingProfile = await this.userProfileRepository.findByUserId(request.userId);

    if (existingProfile) {
      throw new DomainError('PROFILE_ALREADY_EXISTS', `Profile for user ${request.userId} already exists`);
    }

    const profile = UserProfile.create({
      ...request,
    });

    await this.userProfileRepository.save(profile);

    return {
      id: profile.id,
      userId: profile.userId,
      age: profile.age,
      gender: profile.gender,
      weight: profile.weight,
      height: profile.height,
      bodyFatPercent: profile.bodyFatPercent,
      experienceLevel: profile.experienceLevel,
      goal: profile.goal,
      secondaryGoal: profile.secondaryGoal,
      daysPerWeek: profile.daysPerWeek,
      sessionDuration: profile.sessionDuration,
      preferredTime: profile.preferredTime,
      injuries: profile.injuries,
      equipment: profile.equipment,
      gymType: profile.gymType,
      sleepHours: profile.sleepHours,
      stressLevel: profile.stressLevel,
      preferredMethods: profile.preferredMethods,
      weakPoints: profile.weakPoints,
      timePerWorkout: profile.timePerWorkout,
      workoutLocation: profile.workoutLocation,
      secondaryFocus: profile.secondaryFocus,
    };
  }
}
