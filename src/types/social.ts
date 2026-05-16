export type SocialPostType = 'workout' | 'pr' | 'badge' | 'challenge' | 'text';

export type SocialVisibility = 'public' | 'followers' | 'private' | 'group';

export interface SocialProfile {
  id: string;
  username: string;
  display_name: string;
  bio?: string | null;
  avatar_url?: string | null;
  city?: string | null;
  goal?: string | null;
  is_coach: boolean;
  is_public: boolean;
  total_workouts: number;
  current_streak: number;
  best_streak: number;
  total_volume: number;
  weekly_volume?: number;
  followers_count?: number;
  following_count?: number;
  moderation_status?: SocialModerationStatus;
  moderation_reason?: string | null;
  moderated_at?: string | null;
  moderated_by?: string | null;
  badges: SocialBadge[];
  created_at: string;
  updated_at: string;
}

export interface SocialBadge {
  id: string;
  name: string;
  emoji: string;
  unlocked_at: string;
}

export interface SocialPost {
  id: string;
  author_id: string;
  type: SocialPostType;
  title: string;
  body?: string | null;
  metric_label?: string | null;
  metric_value?: string | null;
  visibility: SocialVisibility;
  group_id?: string | null;
  workout_template_id?: string | null;
  moderation_status?: SocialModerationStatus;
  moderation_reason?: string | null;
  moderated_at?: string | null;
  moderated_by?: string | null;
  created_at: string;
  author?: SocialProfile;
  likes_count?: number;
  comments_count?: number;
  liked_by_me?: boolean;
}

export interface SocialComment {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  moderation_status?: SocialModerationStatus;
  moderation_reason?: string | null;
  moderated_at?: string | null;
  moderated_by?: string | null;
  created_at: string;
  author?: SocialProfile;
}

export interface TrainingGroup {
  id: string;
  owner_id: string;
  name: string;
  description?: string | null;
  invite_code: string;
  is_private: boolean;
  created_at: string;
  members_count?: number;
  my_role?: 'owner' | 'coach' | 'member';
}

export interface TrainingGroupMessage {
  id: string;
  group_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: SocialProfile;
}

export interface GroupChallenge {
  id: string;
  group_id: string;
  name: string;
  description?: string | null;
  target: number;
  metric: 'workouts' | 'volume' | 'streak';
  starts_at: string;
  ends_at: string;
  badge_reward?: string | null;
  created_at: string;
  current?: number;
  completed?: boolean;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
  total_volume: number;
  current_streak: number;
  total_workouts: number;
}

export interface CoachStudent {
  student: SocialProfile;
  status: 'pending' | 'active' | 'archived';
  created_at: string;
}

export interface CoachPrivateNote {
  id: string;
  coach_id: string;
  student_id: string;
  note: string;
  created_at: string;
}

export interface CoachWorkoutAssignment {
  id: string;
  coach_id: string;
  student_id: string;
  title: string;
  workout_json: unknown;
  status: 'assigned' | 'accepted' | 'completed';
  created_at: string;
}

export interface PublicWorkoutTemplate {
  id: string;
  author_id: string;
  title: string;
  description?: string | null;
  goal?: string | null;
  level?: string | null;
  workout_json: unknown;
  likes_count: number;
  moderation_status?: SocialModerationStatus;
  moderation_reason?: string | null;
  moderated_at?: string | null;
  moderated_by?: string | null;
  created_at: string;
  author?: SocialProfile;
}

export interface GroupOnlinePresence {
  user_id: string;
  username: string;
  display_name: string;
  online_at: string;
}

export type SocialReportTargetType = 'post' | 'comment' | 'profile' | 'workout_template';

export type SocialReportReason =
  | 'spam'
  | 'harassment'
  | 'hate'
  | 'sexual_content'
  | 'violence'
  | 'self_harm'
  | 'illegal_activity'
  | 'privacy'
  | 'misinformation'
  | 'other';

export type SocialReportStatus = 'open' | 'reviewing' | 'actioned' | 'dismissed';

export type SocialModerationStatus = 'visible' | 'under_review' | 'hidden' | 'removed';

export type SocialModerationAction = 'none' | 'hidden' | 'removed' | 'user_warned' | 'user_suspended';

export interface SocialContentReport {
  id: string;
  reporter_id: string;
  target_type: SocialReportTargetType;
  target_id: string;
  reason: SocialReportReason;
  details?: string | null;
  status: SocialReportStatus;
  moderation_action: SocialModerationAction;
  reviewer_id?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}
