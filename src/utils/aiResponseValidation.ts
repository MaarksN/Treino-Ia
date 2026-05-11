import {
  AbandonmentRiskContract,
  AdvancedMethodsRecommendation,
  DayVariationAdvice,
  DeloadAdvice,
  ExerciseAlternativesAdvice,
  GeneratedWorkoutFromAnamnesis,
  IdealFrequencyRecommendation,
  LoadProgressionAdvice,
  PlateauPrediction,
  SleepStressAdjustment,
  WeeklyInsightsContract,
  WeeklyPlanAdaptation,
  WeeklyVolumeRecommendation,
} from '../types/aiPersonalization';

export interface AiJsonParseResult<T> {
  ok: boolean;
  value?: T;
  reason: 'valid' | 'invalid_json' | 'invalid_schema' | 'no_json';
}

export type TypeGuard<T> = (value: unknown) => value is T;

export function safeParseAiJson<T>(text: string | undefined, guard: TypeGuard<T>): AiJsonParseResult<T> {
  const jsonText = extractJsonObject(text);
  if (!jsonText) return { ok: false, reason: 'no_json' };

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { ok: false, reason: 'invalid_json' };
  }

  if (!guard(parsed)) {
    return { ok: false, reason: 'invalid_schema' };
  }

  return { ok: true, value: parsed, reason: 'valid' };
}

function extractJsonObject(text: string | undefined): string | null {
  if (!text?.trim()) return null;
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1]?.trim();
  const candidate = fenced || trimmed;

  if (candidate.startsWith('{') && candidate.endsWith('}')) return candidate;

  const first = candidate.indexOf('{');
  const last = candidate.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) return null;
  return candidate.slice(first, last + 1);
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString);
const isAdjustment = (value: unknown): value is 'increase' | 'maintain' | 'reduce' =>
  value === 'increase' || value === 'maintain' || value === 'reduce';
const isRisk = (value: unknown): value is 'baixo' | 'medio' | 'alto' =>
  value === 'baixo' || value === 'medio' || value === 'alto';

export function isGeneratedWorkoutFromAnamnesis(value: unknown): value is GeneratedWorkoutFromAnamnesis {
  return isRecord(value)
    && isString(value.split)
    && isStringArray(value.dayFocus)
    && isString(value.weeklyVolume)
    && isNumber(value.idealFrequency)
    && isStringArray(value.safetyNotes)
    && isString(value.initialProgression)
    && isString(value.summary);
}

export function isWeeklyPlanAdaptation(value: unknown): value is WeeklyPlanAdaptation {
  return isRecord(value)
    && isStringArray(value.changes)
    && isAdjustment(value.volumeAdjustment)
    && isAdjustment(value.intensityAdjustment)
    && isStringArray(value.safetyNotes)
    && isString(value.summary);
}

export function isLoadProgressionAdvice(value: unknown): value is LoadProgressionAdvice {
  return isRecord(value)
    && Array.isArray(value.items)
    && value.items.every(item => isRecord(item)
      && isString(item.exercise)
      && (item.action === 'increase' || item.action === 'maintain' || item.action === 'reduce' || item.action === 'swap')
      && isString(item.adjustment)
      && isString(item.reason))
    && isString(value.summary);
}

export function isPlateauPrediction(value: unknown): value is PlateauPrediction {
  return isRecord(value)
    && isRisk(value.risk)
    && isBoolean(value.plateauDetected)
    && isStringArray(value.stagnantExercises)
    && isString(value.probableCause)
    && isString(value.suggestedAction)
    && isString(value.summary);
}

export function isDeloadAdvice(value: unknown): value is DeloadAdvice {
  return isRecord(value)
    && isBoolean(value.needed)
    && isStringArray(value.signals)
    && isString(value.nextWeekAdjustment)
    && isNumber(value.volumeReductionPercent)
    && isNumber(value.intensityReductionPercent)
    && isString(value.summary);
}

export function isExerciseAlternativesAdvice(value: unknown): value is ExerciseAlternativesAdvice {
  const isAlternative = (item: unknown) => isRecord(item)
    && isString(item.name)
    && isString(item.reason)
    && isString(item.safetyNote);

  return isRecord(value)
    && Array.isArray(value.byEquipment)
    && value.byEquipment.every(isAlternative)
    && Array.isArray(value.byPainOrLimitation)
    && value.byPainOrLimitation.every(isAlternative)
    && isString(value.summary);
}

export function isWeeklyVolumeRecommendation(value: unknown): value is WeeklyVolumeRecommendation {
  return isRecord(value)
    && Array.isArray(value.muscleGroups)
    && value.muscleGroups.every(item => isRecord(item)
      && isString(item.group)
      && isNumber(item.weeklySets)
      && isString(item.reason))
    && isString(value.summary);
}

export function isAdvancedMethodsRecommendation(value: unknown): value is AdvancedMethodsRecommendation {
  return isRecord(value)
    && Array.isArray(value.methods)
    && value.methods.every(item => isRecord(item)
      && isString(item.name)
      && isString(item.applyTo)
      && isString(item.caution))
    && isString(value.summary);
}

export function isIdealFrequencyRecommendation(value: unknown): value is IdealFrequencyRecommendation {
  return isRecord(value)
    && isNumber(value.daysPerWeek)
    && isString(value.rationale)
    && isStringArray(value.recoveryNotes)
    && isString(value.summary);
}

export function isSleepStressAdjustment(value: unknown): value is SleepStressAdjustment {
  return isRecord(value)
    && (value.intensityAdjustment === 'maintain' || value.intensityAdjustment === 'reduce')
    && (value.volumeAdjustment === 'maintain' || value.volumeAdjustment === 'reduce')
    && (value.aggressiveness === 'normal' || value.aggressiveness === 'conservative')
    && isStringArray(value.notes)
    && isString(value.summary);
}

export function isWeeklyInsightsContract(value: unknown): value is WeeklyInsightsContract {
  return isRecord(value)
    && isString(value.consistency)
    && isString(value.fatigue)
    && isString(value.progress)
    && isString(value.adherence)
    && isString(value.nextWeekRecommendation)
    && isStringArray(value.alerts)
    && isString(value.summary);
}

export function isAbandonmentRiskContract(value: unknown): value is AbandonmentRiskContract {
  return isRecord(value)
    && isRisk(value.risk)
    && isStringArray(value.signals)
    && isString(value.recommendedAction)
    && isString(value.alert)
    && isString(value.summary);
}

export function isDayVariationAdvice(value: unknown): value is DayVariationAdvice {
  return isRecord(value)
    && isNumber(value.availableMinutes)
    && isStringArray(value.equipment)
    && (value.volumeAdjustment === 'maintain' || value.volumeAdjustment === 'reduce')
    && (value.intensityAdjustment === 'maintain' || value.intensityAdjustment === 'reduce')
    && isStringArray(value.variations)
    && isStringArray(value.safetyNotes)
    && isString(value.summary);
}
