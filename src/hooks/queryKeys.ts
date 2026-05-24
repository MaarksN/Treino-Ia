export const queryKeys = {
  workoutPlan: (userId: string = 'local') => ['workout-plan', userId] as const,
  workoutHistory: (userId: string = 'local') => ['workout-history', userId] as const,
  userProfile: (userId: string = 'local') => ['user-profile', userId] as const,
  gamification: (userId: string = 'local') => ['gamification', userId] as const,
};
