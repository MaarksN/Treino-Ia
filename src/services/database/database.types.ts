export type TrainingLevel = 'iniciante' | 'intermediario' | 'avancado';
export type ExerciseIntensityTechnique = 'normal' | 'superset' | 'dropset';
export interface UserProfile { id: string; name: string; level: TrainingLevel; goal: string; daysPerWeek: number; timePerWorkout: number; injuries: string; equipment: string; updatedAt?: number; }
export interface ExercisePrescription { id: string; name: string; muscleGroup: string; sets: number; reps: string; rest: string; notes: string; intensityTechnique?: ExerciseIntensityTechnique; supersetGroupId?: string; }
export interface WorkoutDayPlan { id: string; dayName: string; focus: string; exercises: ExercisePrescription[]; }
export interface TrainingPlan { id: string; createdAt: number; planName: string; goalDescription: string; volume: string; frequency: string; focus: string; weeklySplit: string; aiRecommendation: string; nextRecommendation: string; days: WorkoutDayPlan[]; }
export interface ExerciseSet { weight: number; reps: number; rpe: number; }
export interface WorkoutExerciseLog { exerciseId: string; name: string; targetSets: number; targetReps: string; targetRest: string; completed: boolean; sets?: ExerciseSet[]; exerciseNote?: string; intensityTechnique?: ExerciseIntensityTechnique; supersetGroupId?: string; actualWeight?: number; actualReps?: number; rpe?: number; }
export interface WorkoutSession { id: string; planId: string; dayId: string; dayName: string; focus: string; completedAt: number; durationMinutes: number; totalVolume: number; completedExercises: number; totalExercises: number; feedback: string; nextRecommendation: string; exercises: WorkoutExerciseLog[]; }
export interface PersistenceStatus { mode: 'supabase' | 'local'; configured: boolean; authenticated: boolean; email: string | null; message: string; }
