export type StrategicItemCategory =
  | 'engineering'
  | 'ui_ux'
  | 'active_workout'
  | 'nutrition_recovery'
  | 'gamification_retention'
  | 'advanced_ai'
  | 'monetization'
  | 'hardware_ar_iot'
  | 'social_community'
  | 'injury_prevention'
  | 'accessibility_inclusion';

export type StrategicItemStatus =
  | 'implemented_now'
  | 'foundation_created'
  | 'existing_supported'
  | 'blocked_external_dependency'
  | 'deferred_high_risk';

export type StrategicItemHorizon = 'now' | 'next' | 'later' | 'future';

export interface StrategicItem {
  id: number;
  title: string;
  category: StrategicItemCategory;
  status: StrategicItemStatus;
  horizon: StrategicItemHorizon;
  risk: 'low' | 'medium' | 'high';
  productArea: string;
  implementationNotes: string;
}
