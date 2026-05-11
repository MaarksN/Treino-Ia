import { RealtimeChannel } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase, getCurrentUserId } from './supabaseClient';
import {
  CoachPrivateNote,
  CoachStudent,
  CoachWorkoutAssignment,
  GroupChallenge,
  GroupOnlinePresence,
  LeaderboardEntry,
  PublicWorkoutTemplate,
  SocialComment,
  SocialContentReport,
  SocialReportReason,
  SocialReportTargetType,
  SocialPost,
  SocialPostType,
  SocialProfile,
  StreakData,
  TrainingGroup,
  TrainingGroupMessage,
  WorkoutHistoryEntry,
} from '../types';
import {
  createInviteCode,
  createUsernameSlug,
  normalizeInviteCode,
  requireSocialText,
  sanitizeSocialText,
  validateUsername,
} from '../utils/socialUtils';

type SupabaseErrorLike = { message?: string; details?: string; hint?: string; code?: string };
type CountRow = { post_id: string };

function assertConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
  }
}

function assertNoError(error: SupabaseErrorLike | null | undefined): void {
  if (error) {
    throw new Error(error.message || JSON.stringify(error));
  }
}

async function getOptionalUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) return null;

  return data.user.id;
}

function countByPost(rows: CountRow[] | null | undefined): Record<string, number> {
  return (rows ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.post_id] = (acc[row.post_id] ?? 0) + 1;
    return acc;
  }, {});
}

function parsePositiveNumber(value: number, label: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} deve ser maior que zero.`);
  }

  return value;
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
  assertConfigured();

  const userId = await getCurrentUserId();
  const displayName = requireSocialText(input.displayName, 'Nome público', 80);
  const username = validateUsername(input.username || input.displayName);

  const { data, error } = await supabase
    .from('social_profiles')
    .upsert(
      {
        id: userId,
        username,
        display_name: displayName,
        bio: input.bio ? sanitizeSocialText(input.bio, 500) : null,
        city: input.city ? sanitizeSocialText(input.city, 80) : null,
        goal: input.goal ? sanitizeSocialText(input.goal, 120) : null,
        avatar_url: input.avatarUrl ? sanitizeSocialText(input.avatarUrl, 500) : null,
        is_coach: input.isCoach ?? false,
        is_public: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    .select()
    .single();

  assertNoError(error);
  return data as SocialProfile;
}

export async function getProfileByUsername(username: string): Promise<SocialProfile | null> {
  assertConfigured();

  const slug = createUsernameSlug(username);
  if (!slug) return null;

  const { data, error } = await supabase
    .from('social_profiles')
    .select('*')
    .eq('username', slug)
    .eq('is_public', true)
    .in('moderation_status', ['visible', 'under_review'])
    .maybeSingle();

  assertNoError(error);
  return data as SocialProfile | null;
}

export async function getMyProfile(): Promise<SocialProfile | null> {
  assertConfigured();

  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('social_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  assertNoError(error);
  return data as SocialProfile | null;
}

export async function listPublicProfiles(search = ''): Promise<SocialProfile[]> {
  assertConfigured();

  const term = sanitizeSocialText(search, 80);
  let query = supabase
    .from('social_profiles')
    .select('*')
    .eq('is_public', true)
    .in('moderation_status', ['visible', 'under_review'])
    .order('total_volume', { ascending: false })
    .limit(24);

  if (term) {
    query = query.or(`username.ilike.%${term}%,display_name.ilike.%${term}%`);
  }

  const { data, error } = await query;
  assertNoError(error);

  return (data ?? []) as SocialProfile[];
}

export async function followUser(followingId: string): Promise<void> {
  assertConfigured();

  const userId = await getCurrentUserId();
  if (followingId === userId) throw new Error('Você não pode seguir seu próprio perfil.');

  const { error } = await supabase.from('social_follows').upsert({
    follower_id: userId,
    following_id: followingId,
  });

  assertNoError(error);
}

export async function unfollowUser(followingId: string): Promise<void> {
  assertConfigured();

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
  assertConfigured();

  const userId = await getCurrentUserId();
  const title = requireSocialText(input.title, 'Título', 140);
  const body = input.body ? sanitizeSocialText(input.body, 1000) : null;

  const { data, error } = await supabase
    .from('social_posts')
    .insert({
      author_id: userId,
      type: input.type,
      title,
      body,
      metric_label: input.metricLabel ? sanitizeSocialText(input.metricLabel, 40) : null,
      metric_value: input.metricValue ? sanitizeSocialText(input.metricValue, 80) : null,
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

export async function createPersonalRecordPost(input: {
  exerciseName: string;
  weight: number;
  reps: number;
  note?: string;
}): Promise<SocialPost> {
  const exerciseName = requireSocialText(input.exerciseName, 'Exercício', 80);
  const weight = parsePositiveNumber(input.weight, 'Carga');
  const reps = parsePositiveNumber(input.reps, 'Repetições');

  return createAchievementPost({
    title: `PR em ${exerciseName}`,
    body: input.note ? sanitizeSocialText(input.note, 500) : `Recorde pessoal registrado no treino.`,
    metricLabel: 'PR',
    metricValue: `${weight}kg x ${reps}`,
  });
}

export async function createWorkoutSharePost(entry: WorkoutHistoryEntry, streak?: StreakData): Promise<SocialPost> {
  const prs = entry.prsBroken?.filter(Boolean) ?? [];
  const type: SocialPostType = prs.length ? 'pr' : 'workout';

  return createPost({
    type,
    title: prs.length ? `PR batido: ${prs.slice(0, 2).join(', ')}` : `Treino concluído: ${entry.dayFocus || entry.planName}`,
    body: [
      `${entry.completedCount}/${entry.exerciseCount} exercícios concluídos.`,
      entry.durationMinutes ? `${entry.durationMinutes} minutos de sessão.` : '',
      streak ? `${streak.currentStreak} dias de streak.` : '',
    ].filter(Boolean).join(' '),
    metricLabel: entry.totalVolume > 0 ? 'Volume' : undefined,
    metricValue: entry.totalVolume > 0 ? `${entry.totalVolume}kg` : undefined,
  });
}

async function enrichPosts(posts: SocialPost[]): Promise<SocialPost[]> {
  const postIds = posts.map(post => post.id);
  if (!postIds.length) return posts;

  const userId = await getOptionalUserId();

  const [likesResult, commentsResult] = await Promise.all([
    supabase.from('social_post_likes').select('post_id,user_id').in('post_id', postIds),
    supabase.from('social_post_comments').select('post_id').in('post_id', postIds),
  ]);

  assertNoError(likesResult.error);
  assertNoError(commentsResult.error);

  const likes = (likesResult.data ?? []) as Array<CountRow & { user_id: string }>;
  const comments = commentsResult.data as CountRow[] | null;
  const likeCounts = countByPost(likes);
  const commentCounts = countByPost(comments);
  const likedByMe = new Set(likes.filter(row => row.user_id === userId).map(row => row.post_id));

  return posts.map(post => ({
    ...post,
    likes_count: likeCounts[post.id] ?? 0,
    comments_count: commentCounts[post.id] ?? 0,
    liked_by_me: likedByMe.has(post.id),
  }));
}

export async function listFeed(): Promise<SocialPost[]> {
  assertConfigured();

  const { data, error } = await supabase
    .from('social_posts')
    .select(`
      *,
      author:social_profiles(*)
    `)
    .eq('visibility', 'public')
    .in('moderation_status', ['visible', 'under_review'])
    .order('created_at', { ascending: false })
    .limit(50);

  assertNoError(error);
  return enrichPosts((data ?? []) as SocialPost[]);
}

export async function listPostsByAuthor(authorId: string): Promise<SocialPost[]> {
  assertConfigured();

  const { data, error } = await supabase
    .from('social_posts')
    .select(`
      *,
      author:social_profiles(*)
    `)
    .eq('author_id', authorId)
    .eq('visibility', 'public')
    .in('moderation_status', ['visible', 'under_review'])
    .order('created_at', { ascending: false })
    .limit(20);

  assertNoError(error);
  return enrichPosts((data ?? []) as SocialPost[]);
}

export async function likePost(postId: string): Promise<void> {
  assertConfigured();

  const userId = await getCurrentUserId();

  const { error } = await supabase.from('social_post_likes').upsert({
    post_id: postId,
    user_id: userId,
  });

  assertNoError(error);
}

export async function unlikePost(postId: string): Promise<void> {
  assertConfigured();

  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('social_post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);

  assertNoError(error);
}

export async function toggleLikePost(post: SocialPost): Promise<void> {
  if (post.liked_by_me) {
    await unlikePost(post.id);
  } else {
    await likePost(post.id);
  }
}

export async function addComment(postId: string, body: string): Promise<SocialComment> {
  assertConfigured();

  const userId = await getCurrentUserId();
  const comment = requireSocialText(body, 'Comentário', 500);

  const { data, error } = await supabase
    .from('social_post_comments')
    .insert({
      post_id: postId,
      author_id: userId,
      body: comment,
    })
    .select()
    .single();

  assertNoError(error);
  return data as SocialComment;
}

export async function listComments(postId: string): Promise<SocialComment[]> {
  assertConfigured();

  const { data, error } = await supabase
    .from('social_post_comments')
    .select(`
      *,
      author:social_profiles(*)
    `)
    .eq('post_id', postId)
    .in('moderation_status', ['visible', 'under_review'])
    .order('created_at', { ascending: true });

  assertNoError(error);
  return (data ?? []) as SocialComment[];
}

export async function createGroup(input: {
  name: string;
  description?: string;
  isPrivate?: boolean;
}): Promise<TrainingGroup> {
  assertConfigured();

  const userId = await getCurrentUserId();
  const name = requireSocialText(input.name, 'Nome do grupo', 80);
  const inviteCode = createInviteCode(name);

  const { data, error } = await supabase
    .from('training_groups')
    .insert({
      owner_id: userId,
      name,
      description: input.description ? sanitizeSocialText(input.description, 300) : null,
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
  assertConfigured();

  await getCurrentUserId();
  const code = normalizeInviteCode(inviteCode);
  if (!code) throw new Error('Código de convite inválido.');

  const { error } = await supabase.rpc('join_training_group_by_invite', {
    p_invite_code: code,
  });

  assertNoError(error);
}

export async function listMyGroups(): Promise<TrainingGroup[]> {
  assertConfigured();

  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('training_group_members')
    .select(`
      role,
      group:training_groups(*)
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });

  assertNoError(error);

  const rows = (data ?? []) as unknown as Array<{ group: TrainingGroup | null; role: TrainingGroup['my_role'] }>;
  return rows
    .map(item => (item.group ? { ...item.group, my_role: item.role } : null))
    .filter(Boolean) as TrainingGroup[];
}

export async function listGroupMessages(groupId: string): Promise<TrainingGroupMessage[]> {
  assertConfigured();

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
  assertConfigured();

  const userId = await getCurrentUserId();
  const message = requireSocialText(body, 'Mensagem', 1000);

  const { data, error } = await supabase
    .from('training_group_messages')
    .insert({
      group_id: groupId,
      author_id: userId,
      body: message,
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
  assertConfigured();

  const { data, error } = await supabase
    .from('group_challenges')
    .insert({
      group_id: input.groupId,
      name: requireSocialText(input.name, 'Nome do desafio', 100),
      description: input.description ? sanitizeSocialText(input.description, 400) : null,
      target: parsePositiveNumber(input.target, 'Meta'),
      metric: input.metric,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      badge_reward: input.badgeReward ? sanitizeSocialText(input.badgeReward, 80) : null,
    })
    .select()
    .single();

  assertNoError(error);
  return data as GroupChallenge;
}

export async function listGroupChallenges(groupId: string): Promise<GroupChallenge[]> {
  assertConfigured();

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
  assertConfigured();

  const { data, error } = await supabase.rpc('get_group_leaderboard', {
    p_group_id: groupId,
    p_metric: metric,
  });

  assertNoError(error);

  return ((data ?? []) as LeaderboardEntry[]).map(row => ({
    ...row,
    total_volume: Number(row.total_volume ?? 0),
    current_streak: Number(row.current_streak ?? 0),
    total_workouts: Number(row.total_workouts ?? 0),
  }));
}

export async function listCoachStudents(): Promise<CoachStudent[]> {
  assertConfigured();

  const coachId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('coach_students')
    .select(`
      status,
      created_at,
      student:social_profiles(*)
    `)
    .eq('coach_id', coachId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

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

export async function addCoachStudentByUsername(username: string): Promise<void> {
  assertConfigured();

  const coachId = await getCurrentUserId();
  const student = await getProfileByUsername(username);

  if (!student) throw new Error('Aluno não encontrado pelo username informado.');
  if (student.id === coachId) throw new Error('Coach e aluno não podem ser o mesmo perfil.');

  const { error } = await supabase.from('coach_students').upsert({
    coach_id: coachId,
    student_id: student.id,
    status: 'active',
  });

  assertNoError(error);
}

export async function listCoachNotes(studentId: string): Promise<CoachPrivateNote[]> {
  assertConfigured();

  const coachId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('coach_private_notes')
    .select('*')
    .eq('coach_id', coachId)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(20);

  assertNoError(error);
  return (data ?? []) as CoachPrivateNote[];
}

export async function createCoachNote(studentId: string, note: string): Promise<CoachPrivateNote> {
  assertConfigured();

  const coachId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('coach_private_notes')
    .insert({
      coach_id: coachId,
      student_id: studentId,
      note: requireSocialText(note, 'Nota', 1000),
    })
    .select()
    .single();

  assertNoError(error);
  return data as CoachPrivateNote;
}

export async function listCoachAssignments(studentId: string): Promise<CoachWorkoutAssignment[]> {
  assertConfigured();

  const coachId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('coach_workout_assignments')
    .select('*')
    .eq('coach_id', coachId)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(20);

  assertNoError(error);
  return (data ?? []) as CoachWorkoutAssignment[];
}

export async function assignWorkoutToStudent(input: {
  studentId: string;
  title: string;
  workout: unknown;
}): Promise<void> {
  assertConfigured();

  const coachId = await getCurrentUserId();

  const { error } = await supabase.from('coach_workout_assignments').insert({
    coach_id: coachId,
    student_id: input.studentId,
    title: requireSocialText(input.title, 'Título do treino', 120),
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
  assertConfigured();

  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('public_workout_templates')
    .insert({
      author_id: userId,
      title: requireSocialText(input.title, 'Título do template', 120),
      description: input.description ? sanitizeSocialText(input.description, 800) : null,
      goal: input.goal ? sanitizeSocialText(input.goal, 80) : null,
      level: input.level ? sanitizeSocialText(input.level, 40) : null,
      workout_json: input.workout,
    })
    .select()
    .single();

  assertNoError(error);
  return data as PublicWorkoutTemplate;
}

export async function listPublicWorkoutTemplates(): Promise<PublicWorkoutTemplate[]> {
  assertConfigured();

  const { data, error } = await supabase
    .from('public_workout_templates')
    .select(`
      *,
      author:social_profiles(*)
    `)
    .order('created_at', { ascending: false })
    .in('moderation_status', ['visible', 'under_review'])
    .limit(50);

  assertNoError(error);
  return (data ?? []) as PublicWorkoutTemplate[];
}

export async function reportContent(input: {
  targetType: SocialReportTargetType;
  targetId: string;
  reason: SocialReportReason;
  details?: string;
}): Promise<SocialContentReport> {
  assertConfigured();

  const userId = await getCurrentUserId();
  const details = input.details ? sanitizeSocialText(input.details, 1000) : null;

  const { data, error } = await supabase
    .from('social_content_reports')
    .insert({
      reporter_id: userId,
      target_type: input.targetType,
      target_id: input.targetId,
      reason: input.reason,
      details,
    })
    .select()
    .single();

  assertNoError(error);
  return data as SocialContentReport;
}

export function subscribeToFeed(onChange: () => void): RealtimeChannel {
  return supabase
    .channel('social-feed')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'social_posts' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'social_post_likes' }, onChange)
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

function readPresence(channel: RealtimeChannel): GroupOnlinePresence[] {
  const state = channel.presenceState<GroupOnlinePresence>();
  return Object.values(state)
    .flat()
    .map(item => item as GroupOnlinePresence)
    .sort((a, b) => a.display_name.localeCompare(b.display_name));
}

export function subscribePresence(
  roomId: string,
  user: SocialProfile,
  onPresenceChange?: (presence: GroupOnlinePresence[]) => void,
): RealtimeChannel {
  const channel = supabase.channel(`presence-${roomId}`, {
    config: {
      presence: {
        key: user.id,
      },
    },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      onPresenceChange?.(readPresence(channel));
    })
    .on('presence', { event: 'join' }, () => {
      onPresenceChange?.(readPresence(channel));
    })
    .on('presence', { event: 'leave' }, () => {
      onPresenceChange?.(readPresence(channel));
    })
    .subscribe(async status => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: user.id,
          username: user.username,
          display_name: user.display_name,
          online_at: new Date().toISOString(),
        });
        onPresenceChange?.(readPresence(channel));
      }
    });

  return channel;
}
