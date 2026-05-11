import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, getCurrentUserId } from './supabaseClient';
import {
  CoachPrivateNote,
  CoachStudent,
  GroupChallenge,
  LeaderboardEntry,
  PublicWorkoutTemplate,
  SocialComment,
  SocialPost,
  SocialPostType,
  SocialProfile,
  TrainingGroup,
  TrainingGroupMessage,
} from '../types';
import { createInviteCode, createUsernameSlug } from '../utils/socialUtils';

type SupabaseErrorLike = { message?: string; details?: string; hint?: string; code?: string };

function assertNoError(error: SupabaseErrorLike | null | undefined): void {
  if (error) {
    throw new Error(error.message || JSON.stringify(error));
  }
}

export async function upsertMyProfile(input: {
  displayName: string;
  username?: string;
  bio?: string;
  city?: string;
  goal?: string;
  isCoach?: boolean;
  avatarUrl?: string;
}): Promise<SocialProfile> {
  const userId = await getCurrentUserId();
  const username = createUsernameSlug(input.username || input.displayName);

  const { data, error } = await supabase
    .from('social_profiles')
    .upsert({
      id: userId,
      username,
      display_name: input.displayName,
      bio: input.bio ?? null,
      city: input.city ?? null,
      goal: input.goal ?? null,
      avatar_url: input.avatarUrl ?? null,
      is_coach: input.isCoach ?? false,
      is_public: true,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  assertNoError(error);
  return data as SocialProfile;
}

export async function getProfileByUsername(username: string): Promise<SocialProfile | null> {
  const { data, error } = await supabase
    .from('social_profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  assertNoError(error);
  return data as SocialProfile | null;
}

export async function getMyProfile(): Promise<SocialProfile | null> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('social_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  assertNoError(error);
  return data as SocialProfile | null;
}

export async function followUser(followingId: string): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase.from('social_follows').upsert({
    follower_id: userId,
    following_id: followingId,
  });

  assertNoError(error);
}

export async function unfollowUser(followingId: string): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('social_follows')
    .delete()
    .eq('follower_id', userId)
    .eq('following_id', followingId);

  assertNoError(error);
}

export async function createPost(input: {
  type: SocialPostType;
  title: string;
  body?: string;
  metricLabel?: string;
  metricValue?: string;
  groupId?: string;
}): Promise<SocialPost> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('social_posts')
    .insert({
      author_id: userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      metric_label: input.metricLabel ?? null,
      metric_value: input.metricValue ?? null,
      visibility: input.groupId ? 'group' : 'public',
      group_id: input.groupId ?? null,
    })
    .select()
    .single();

  assertNoError(error);
  return data as SocialPost;
}

export async function createAchievementPost(input: {
  title: string;
  body?: string;
  metricLabel?: string;
  metricValue?: string;
}): Promise<SocialPost> {
  return createPost({
    type: 'pr',
    title: input.title,
    body: input.body,
    metricLabel: input.metricLabel,
    metricValue: input.metricValue,
  });
}

export async function listFeed(): Promise<SocialPost[]> {
  const { data, error } = await supabase
    .from('social_posts')
    .select(`
      *,
      author:social_profiles(*)
    `)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(50);

  assertNoError(error);
  return (data ?? []) as SocialPost[];
}

export async function likePost(postId: string): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase.from('social_post_likes').upsert({
    post_id: postId,
    user_id: userId,
  });

  assertNoError(error);
}

export async function unlikePost(postId: string): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('social_post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);

  assertNoError(error);
}

export async function addComment(postId: string, body: string): Promise<SocialComment> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('social_post_comments')
    .insert({
      post_id: postId,
      author_id: userId,
      body,
    })
    .select()
    .single();

  assertNoError(error);
  return data as SocialComment;
}

export async function listComments(postId: string): Promise<SocialComment[]> {
  const { data, error } = await supabase
    .from('social_post_comments')
    .select(`
      *,
      author:social_profiles(*)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  assertNoError(error);
  return (data ?? []) as SocialComment[];
}

export async function createGroup(input: {
  name: string;
  description?: string;
  isPrivate?: boolean;
}): Promise<TrainingGroup> {
  const userId = await getCurrentUserId();
  const inviteCode = createInviteCode(input.name);

  const { data, error } = await supabase
    .from('training_groups')
    .insert({
      owner_id: userId,
      name: input.name,
      description: input.description ?? null,
      invite_code: inviteCode,
      is_private: input.isPrivate ?? true,
    })
    .select()
    .single();

  assertNoError(error);

  const { error: memberError } = await supabase.from('training_group_members').insert({
    group_id: data.id,
    user_id: userId,
    role: 'owner',
  });
  assertNoError(memberError);

  return data as TrainingGroup;
}

export async function joinGroupByInvite(inviteCode: string): Promise<void> {
  const userId = await getCurrentUserId();

  const { data: group, error } = await supabase
    .from('training_groups')
    .select('id')
    .eq('invite_code', inviteCode)
    .single();

  assertNoError(error);

  const { error: joinError } = await supabase.from('training_group_members').upsert({
    group_id: group.id,
    user_id: userId,
    role: 'member',
  });

  assertNoError(joinError);
}

export async function listMyGroups(): Promise<TrainingGroup[]> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('training_group_members')
    .select(`
      group:training_groups(*)
    `)
    .eq('user_id', userId);

  assertNoError(error);

  const rows = (data ?? []) as unknown as Array<{ group: TrainingGroup | null }>;
  return rows.map(item => item.group).filter(Boolean) as TrainingGroup[];
}

export async function listGroupMessages(groupId: string): Promise<TrainingGroupMessage[]> {
  const { data, error } = await supabase
    .from('training_group_messages')
    .select(`
      *,
      author:social_profiles(*)
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })
    .limit(100);

  assertNoError(error);
  return (data ?? []) as TrainingGroupMessage[];
}

export async function sendGroupMessage(groupId: string, body: string): Promise<TrainingGroupMessage> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('training_group_messages')
    .insert({
      group_id: groupId,
      author_id: userId,
      body,
    })
    .select()
    .single();

  assertNoError(error);
  return data as TrainingGroupMessage;
}

export async function createGroupChallenge(input: {
  groupId: string;
  name: string;
  description?: string;
  target: number;
  metric: 'workouts' | 'volume' | 'streak';
  startsAt: string;
  endsAt: string;
  badgeReward?: string;
}): Promise<GroupChallenge> {
  const { data, error } = await supabase
    .from('group_challenges')
    .insert({
      group_id: input.groupId,
      name: input.name,
      description: input.description ?? null,
      target: input.target,
      metric: input.metric,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      badge_reward: input.badgeReward ?? null,
    })
    .select()
    .single();

  assertNoError(error);
  return data as GroupChallenge;
}

export async function listGroupChallenges(groupId: string): Promise<GroupChallenge[]> {
  const { data, error } = await supabase
    .from('group_challenges')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  assertNoError(error);
  return (data ?? []) as GroupChallenge[];
}

export async function listGroupLeaderboard(
  groupId: string,
  metric: 'volume' | 'streak' | 'workouts'
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('training_group_members')
    .select(`
      user:social_profiles(
        id,
        username,
        display_name,
        avatar_url,
        total_volume,
        current_streak,
        total_workouts
      )
    `)
    .eq('group_id', groupId);

  assertNoError(error);

  type LeaderboardProfileRow = Omit<LeaderboardEntry, 'user_id'> & { id: string };

  const rows = (data ?? []) as unknown as Array<{ user: LeaderboardProfileRow | null }>;
  const entries = rows
    .map(item => item.user)
    .filter(Boolean)
    .map(user => ({
      user_id: user.id,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      total_volume: Number(user.total_volume),
      current_streak: user.current_streak,
      total_workouts: user.total_workouts,
    }));

  return entries.sort((a, b) => {
    if (metric === 'volume') return Number(b.total_volume) - Number(a.total_volume);
    if (metric === 'streak') return b.current_streak - a.current_streak;
    return b.total_workouts - a.total_workouts;
  });
}

export async function listCoachStudents(): Promise<CoachStudent[]> {
  const coachId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('coach_students')
    .select(`
      status,
      created_at,
      student:social_profiles(*)
    `)
    .eq('coach_id', coachId)
    .eq('status', 'active');

  assertNoError(error);

  const rows = (data ?? []) as unknown as Array<{
    student: SocialProfile;
    status: CoachStudent['status'];
    created_at: string;
  }>;

  return rows.map(item => ({
    student: item.student,
    status: item.status,
    created_at: item.created_at,
  }));
}

export async function createCoachNote(studentId: string, note: string): Promise<CoachPrivateNote> {
  const coachId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('coach_private_notes')
    .insert({
      coach_id: coachId,
      student_id: studentId,
      note,
    })
    .select()
    .single();

  assertNoError(error);
  return data as CoachPrivateNote;
}

export async function assignWorkoutToStudent(input: {
  studentId: string;
  title: string;
  workout: unknown;
}): Promise<void> {
  const coachId = await getCurrentUserId();

  const { error } = await supabase.from('coach_workout_assignments').insert({
    coach_id: coachId,
    student_id: input.studentId,
    title: input.title,
    workout_json: input.workout,
  });

  assertNoError(error);
}

export async function publishWorkoutTemplate(input: {
  title: string;
  description?: string;
  goal?: string;
  level?: string;
  workout: unknown;
}): Promise<PublicWorkoutTemplate> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('public_workout_templates')
    .insert({
      author_id: userId,
      title: input.title,
      description: input.description ?? null,
      goal: input.goal ?? null,
      level: input.level ?? null,
      workout_json: input.workout,
    })
    .select()
    .single();

  assertNoError(error);
  return data as PublicWorkoutTemplate;
}

export async function listPublicWorkoutTemplates(): Promise<PublicWorkoutTemplate[]> {
  const { data, error } = await supabase
    .from('public_workout_templates')
    .select(`
      *,
      author:social_profiles(*)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  assertNoError(error);
  return (data ?? []) as PublicWorkoutTemplate[];
}

export function subscribeToFeed(onChange: () => void): RealtimeChannel {
  return supabase
    .channel('social-feed')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'social_posts' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'social_post_comments' }, onChange)
    .subscribe();
}

export function subscribeToGroupMessages(groupId: string, onChange: () => void): RealtimeChannel {
  return supabase
    .channel(`group-messages-${groupId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'training_group_messages',
        filter: `group_id=eq.${groupId}`,
      },
      onChange
    )
    .subscribe();
}

export function subscribePresence(roomId: string, user: SocialProfile): RealtimeChannel {
  const channel = supabase.channel(`presence-${roomId}`, {
    config: {
      presence: {
        key: user.id,
      },
    },
  });

  channel.subscribe(async status => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        user_id: user.id,
        username: user.username,
        display_name: user.display_name,
        online_at: new Date().toISOString(),
      });
    }
  });

  return channel;
}
