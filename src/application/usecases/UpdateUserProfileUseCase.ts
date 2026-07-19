import { IUserProfileRepository } from '../../domain/repositories/IUserProfileRepository';
import { UserProfile } from '../../domain/entities/UserProfile';
import { UserProfileDTO } from '../dto/UserProfileDTO';
import { NotFoundError } from '../../domain/exceptions/DomainError';

export class UpdateUserProfileUseCase {
  constructor(private readonly userProfileRepository: IUserProfileRepository) {}

  public async execute(profileId: string, updates: Partial<Omit<UserProfileDTO, 'id' | 'userId'>>): Promise<UserProfileDTO> {
    const profile = await this.userProfileRepository.findById(profileId);

    if (!profile) {
      throw new NotFoundError('UserProfile', profileId);
    }

    const updatedProfile = UserProfile.create({
      userId: profile.userId,
      age: updates.age ?? profile.age,
      gender: updates.gender ?? profile.gender,
      weight: updates.weight ?? profile.weight,
      height: updates.height ?? profile.height,
      bodyFatPercent: updates.bodyFatPercent ?? profile.bodyFatPercent,
      experienceLevel: updates.experienceLevel ?? profile.experienceLevel,
      goal: updates.goal ?? profile.goal,
      secondaryGoal: updates.secondaryGoal ?? profile.secondaryGoal,
      daysPerWeek: updates.daysPerWeek ?? profile.daysPerWeek,
      sessionDuration: updates.sessionDuration ?? profile.sessionDuration,
      preferredTime: updates.preferredTime ?? profile.preferredTime,
      injuries: updates.injuries ?? profile.injuries,
      equipment: updates.equipment ?? profile.equipment,
      gymType: updates.gymType ?? profile.gymType,
      sleepHours: updates.sleepHours ?? profile.sleepHours,
      stressLevel: updates.stressLevel ?? profile.stressLevel,
      preferredMethods: updates.preferredMethods ?? profile.preferredMethods,
      weakPoints: updates.weakPoints ?? profile.weakPoints,
      timePerWorkout: updates.timePerWorkout ?? profile.timePerWorkout,
      workoutLocation: updates.workoutLocation ?? profile.workoutLocation,
      secondaryFocus: updates.secondaryFocus ?? profile.secondaryFocus,
    }, profile.id);

    await this.userProfileRepository.update(updatedProfile);

    return {
      id: updatedProfile.id,
      userId: updatedProfile.userId,
      age: updatedProfile.age,
      gender: updatedProfile.gender,
      weight: updatedProfile.weight,
      height: updatedProfile.height,
      bodyFatPercent: updatedProfile.bodyFatPercent,
      experienceLevel: updatedProfile.experienceLevel,
      goal: updatedProfile.goal,
      secondaryGoal: updatedProfile.secondaryGoal,
      daysPerWeek: updatedProfile.daysPerWeek,
      sessionDuration: updatedProfile.sessionDuration,
      preferredTime: updatedProfile.preferredTime,
      injuries: updatedProfile.injuries,
      equipment: updatedProfile.equipment,
      gymType: updatedProfile.gymType,
      sleepHours: updatedProfile.sleepHours,
      stressLevel: updatedProfile.stressLevel,
      preferredMethods: updatedProfile.preferredMethods,
      weakPoints: updatedProfile.weakPoints,
      timePerWorkout: updatedProfile.timePerWorkout,
      workoutLocation: updatedProfile.workoutLocation,
      secondaryFocus: updatedProfile.secondaryFocus,
    };
  }
}
