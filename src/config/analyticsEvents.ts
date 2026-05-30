export type AnalyticsEventName =
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'registration_completed'
  | 'anamnesis_completed'
  | 'first_plan_created'
  | 'workout_started'
  | 'first_workout_started'
  | 'set_logged'
  | 'workout_completed'
  | 'first_workout_completed'
  | 'day_7_return_detected'
  | 'workout_save_failed'
  | 'ai_suggestion_generated'
  | 'ai_suggestion_accepted'
  | 'ai_suggestion_rejected'
  | 'ai_suggestion_dismissed'
  | 'ai_error'
  | 'billing_error'
  | 'critical_error_captured'
  | 'progression_suggested'
  | 'progression_accepted'
  | 'progression_rejected'
  | 'progression_suggestion_viewed'
  | 'progression_suggestion_hidden_insufficient_data'
  | 'paywall_viewed'
  | 'upgrade_clicked'
  | 'billing_opened';

export interface AnalyticsEventProperties {
  [key: string]: unknown;
}
