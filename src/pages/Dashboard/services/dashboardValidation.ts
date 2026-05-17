import { z } from 'zod';
import { type ExerciseSet, type UserProfile } from '../../../services/database';
import { type DraftSet } from '../types';

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; issues: string[] };

const trainingLevelSchema = z.enum(['iniciante', 'intermediario', 'avancado']);

const profileFormSchema = z.object({
  id: z.string().trim().min(1, 'Perfil sem identificador valido.'),
  name: z.string().trim().max(80, 'Nome deve ter no maximo 80 caracteres.'),
  level: trainingLevelSchema,
  goal: z.string().trim().max(80, 'Objetivo deve ter no maximo 80 caracteres.'),
  daysPerWeek: z.coerce.number().finite('Dias por semana precisa ser numerico.'),
  timePerWorkout: z.coerce.number().finite('Tempo por treino precisa ser numerico.'),
  injuries: z.string().trim().max(160, 'Lesoes devem ter no maximo 160 caracteres.'),
  equipment: z.string().trim().max(120, 'Equipamento deve ter no maximo 120 caracteres.'),
  updatedAt: z.number().optional(),
});

const numericInputSchema = z.preprocess(value => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return Number(trimmed.replace(',', '.'));
}, z.number().finite().catch(0));

const activeSetMetricsSchema = z.object({
  weight: numericInputSchema,
  reps: numericInputSchema,
  rpe: numericInputSchema,
});

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatIssues(error: z.ZodError): string[] {
  return error.issues.map(issue => {
    const field = issue.path.length ? issue.path.join('.') : 'formulario';
    return `${field}: ${issue.message}`;
  });
}

export function validateDashboardProfileInput(profile: UserProfile): ValidationResult<UserProfile> {
  const result = profileFormSchema.safeParse(profile);

  if (!result.success) {
    const issues = formatIssues(result.error);
    return {
      success: false,
      message: issues[0] ?? 'Revise os campos da anamnese.',
      issues,
    };
  }

  const data = result.data;

  return {
    success: true,
    data: {
      ...data,
      name: data.name || 'Atleta',
      goal: data.goal || 'Hipertrofia',
      injuries: data.injuries || 'Nenhuma',
      equipment: data.equipment || 'Academia completa',
      daysPerWeek: clampNumber(Math.round(data.daysPerWeek), 1, 6),
      timePerWorkout: clampNumber(Math.round(data.timePerWorkout), 20, 120),
      updatedAt: Date.now(),
    },
  };
}

export function parseDraftSetMetrics(set: Pick<DraftSet, 'weight' | 'reps' | 'rpe'>): ExerciseSet {
  const result = activeSetMetricsSchema.parse(set);

  return {
    weight: clampNumber(Number(result.weight.toFixed(1)), 0, 1000),
    reps: clampNumber(Math.round(result.reps), 0, 200),
    rpe: clampNumber(Number(result.rpe.toFixed(1)), 0, 10),
  };
}
