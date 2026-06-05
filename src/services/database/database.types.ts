export type Json = any;

type AnyRecord = Record<string, any>;

type RelationshipList = Array<{
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
}>;

type GenericTable = {
  Row: AnyRecord;
  Insert: AnyRecord;
  Update: AnyRecord;
  Relationships: RelationshipList;
};

type UserOwnedTable<Row extends Record<string, Json | null>> = {
  Row: Row & AnyRecord;
  Insert: AnyRecord;
  Update: AnyRecord;
  Relationships: RelationshipList;
};

type ServerOnlyTable<Row extends Record<string, Json | null>> = {
  Row: Row & AnyRecord;
  Insert: AnyRecord;
  Update: AnyRecord;
  Relationships: RelationshipList;
};

type CoreTables = {
  training_user_profiles: UserOwnedTable<{
    user_id: string;
    profile_json: Json;
    profile_name: string | null;
    profile_goal: string | null;
    created_at: string;
    updated_at: string;
  }>;
  training_workout_plans: UserOwnedTable<{
    id: string;
    user_id: string;
    plan_json: Json;
    plan_name: string;
    goal_description: string;
    is_current: boolean;
    created_at_ms: number;
    created_at: string;
    updated_at: string;
  }>;
  training_workout_history_records: UserOwnedTable<{
    id: string;
    user_id: string;
    plan_id: string;
    day_id: string;
    day_name: string;
    focus: string;
    workout_date: string;
    duration_minutes: number;
    volume_load: number;
    record_json: Json;
    created_at: string;
    updated_at: string;
  }>;
  workout_sessions: UserOwnedTable<{
    id: string;
    user_id: string;
    legacy_session_id: string | null;
    plan_id: string | null;
    day_id: string | null;
    day_name: string | null;
    focus: string | null;
    started_at: string;
    finished_at: string | null;
    status: string;
    total_volume: number;
    duration_seconds: number | null;
    metadata_json: Json;
    created_at: string;
    updated_at: string;
  }>;
  exercise_logs: UserOwnedTable<{
    id: string;
    session_id: string;
    user_id: string;
    exercise_id: string;
    exercise_name: string;
    order_index: number;
    target_sets: number | null;
    target_reps: string | null;
    target_rest: string | null;
    completed: boolean;
    exercise_note: string | null;
    created_at: string;
    updated_at: string;
  }>;
  set_logs: UserOwnedTable<{
    id: string;
    exercise_log_id: string;
    session_id: string;
    user_id: string;
    set_index: number;
    weight: number;
    reps: number;
    rpe: number | null;
    completed: boolean;
    volume: number;
    is_personal_record: boolean;
    created_at: string;
    updated_at: string;
  }>;
  personal_records: UserOwnedTable<{
    id: string;
    user_id: string;
    exercise_id: string;
    exercise_name: string;
    record_type: string;
    value: number;
    unit: string;
    source_session_id: string | null;
    source_set_log_id: string | null;
    achieved_at: string;
    created_at: string;
  }>;
  ai_recommendations: UserOwnedTable<{
    id: string;
    user_id: string;
    recommendation_type: string;
    status: string;
    payload_json: Json;
    reason: string | null;
    source_session_id: string | null;
    legacy_source_session_id: string | null;
    decided_by: string | null;
    decision_reason: string | null;
    plan_before_json: Json | null;
    plan_after_json: Json | null;
    created_at: string;
    reviewed_at: string | null;
    accepted_at: string | null;
    rejected_at: string | null;
    dismissed_at: string | null;
    applied_at: string | null;
  }>;
  plan_revisions: UserOwnedTable<{
    id: string;
    user_id: string;
    plan_id: string;
    source_recommendation_id: string | null;
    status: string;
    revision_json: Json;
    created_at: string;
    applied_at: string | null;
    rejected_at: string | null;
  }>;
  billing_subscriptions: UserOwnedTable<{
    user_id: string;
    plan_id: string;
    status: string;
    interval: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    current_period_end: string | null;
    trial_ends_at: string | null;
    cancel_at_period_end: boolean;
    created_at: string;
    updated_at: string;
  }>;
  billing_usage_counters: UserOwnedTable<{
    user_id: string;
    billing_month: string;
    ai_requests: number;
    exports_count: number;
    prs_count: number;
    best_streak: number;
    created_at: string;
    updated_at: string;
  }>;
  stripe_webhook_events: ServerOnlyTable<{
    id: string;
    type: string;
    stripe_created_at: string | null;
    payload: Json;
    processed_at: string;
  }>;
  health_oauth_states: ServerOnlyTable<{
    state: string;
    user_id: string;
    provider: string;
    redirect_to: string;
    expires_at: string;
    consumed_at: string | null;
    created_at: string;
  }>;
  health_integration_tokens: ServerOnlyTable<{
    user_id: string;
    provider: string;
    access_token: string;
    refresh_token: string | null;
    token_type: string | null;
    scope: string | null;
    expires_at: string | null;
    updated_at: string;
  }>;
  telemetry_error_events: ServerOnlyTable<{
    id: string;
    user_id: string | null;
    source: string;
    message: string;
    stack: string | null;
    url: string | null;
    user_agent: string | null;
    metadata: Json;
    created_at: string;
  }>;
};

type CoreFunctions = {
  increment_billing_usage: {
    Args: {
      p_user_id: string;
      p_billing_month: string;
      p_field: string;
      p_amount?: number;
    };
    Returns: Json;
  };
  join_training_group_by_invite: {
    Args: { p_invite_code: string };
    Returns: Json;
  };
  get_group_leaderboard: {
    Args: { p_group_id: string; p_metric?: string };
    Returns: Array<Record<string, Json>>;
  };
  apply_gamification_event: {
    Args: {
      p_user_id: string;
      p_event_type: string;
      p_source_id: string | null;
      p_xp_delta: number;
      p_coin_delta: number;
      p_metadata: Json;
    };
    Returns: Json;
  };
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: CoreTables & Record<string, GenericTable>;
    Views: Record<string, never>;
    Functions: CoreFunctions & Record<string, { Args: AnyRecord; Returns: any }>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;
type DefaultSchema = DatabaseWithoutInternals['public'];

export type Tables<TableName extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])> =
  (DefaultSchema['Tables'] & DefaultSchema['Views'])[TableName] extends { Row: infer Row }
    ? Row
    : never;

export type TablesInsert<TableName extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][TableName] extends { Insert: infer Insert } ? Insert : never;

export type TablesUpdate<TableName extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][TableName] extends { Update: infer Update } ? Update : never;

export type Enums<EnumName extends keyof DefaultSchema['Enums']> = DefaultSchema['Enums'][EnumName];

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
