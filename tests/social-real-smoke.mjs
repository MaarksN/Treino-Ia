import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isPlaceholder() {
  return !url ||
    !anonKey ||
    url.includes('SEU-PROJETO') ||
    url.includes('seu-projeto') ||
    anonKey === 'SUA_ANON_KEY' ||
    anonKey.split('.').length !== 3;
}

async function signUpAndProfile(email, password, username, displayName, isCoach = false) {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: signUpError } = await client.auth.signUp({
    email,
    password,
    options: { data: { name: displayName } },
  });
  if (signUpError) throw signUpError;

  const { data: sessionData, error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) throw signInError;

  const userId = sessionData.user?.id || authData.user?.id;
  assert(userId, `Auth não retornou user id para ${email}`);

  const { error: profileError } = await client.from('social_profiles').upsert({
    id: userId,
    username,
    display_name: displayName,
    bio: 'Smoke test social real',
    goal: 'validar comunidade',
    is_coach: isCoach,
    is_public: true,
  });
  if (profileError) throw profileError;

  return { client, userId };
}

async function main() {
  if (isPlaceholder()) {
    console.log('SKIP: configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY reais para rodar o smoke test social.');
    return;
  }

  const suffix = Date.now();
  const password = `Smoke-${suffix}-Aa1!`;
  const service = serviceRoleKey
    ? createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;

  const createdUserIds = [];

  try {
    const coach = await signUpAndProfile(
      `coach-${suffix}@example.com`,
      password,
      `coach_${suffix}`,
      `Coach ${suffix}`,
      true,
    );
    createdUserIds.push(coach.userId);

    const athlete = await signUpAndProfile(
      `athlete-${suffix}@example.com`,
      password,
      `athlete_${suffix}`,
      `Athlete ${suffix}`,
    );
    createdUserIds.push(athlete.userId);

    const { data: post, error: postError } = await coach.client
      .from('social_posts')
      .insert({
        author_id: coach.userId,
        type: 'text',
        title: 'Smoke post social real',
        body: 'Post criado pelo smoke test.',
        visibility: 'public',
      })
      .select()
      .single();
    if (postError) throw postError;

    const { error: likeError } = await athlete.client.from('social_post_likes').insert({
      post_id: post.id,
      user_id: athlete.userId,
    });
    if (likeError) throw likeError;

    const { error: commentError } = await athlete.client.from('social_post_comments').insert({
      post_id: post.id,
      author_id: athlete.userId,
      body: 'Comentário smoke.',
    });
    if (commentError) throw commentError;

    const { data: group, error: groupError } = await coach.client
      .from('training_groups')
      .insert({
        owner_id: coach.userId,
        name: 'Grupo smoke',
        description: 'Grupo privado smoke',
        invite_code: `smoke-${suffix}`,
        is_private: true,
      })
      .select()
      .single();
    if (groupError) throw groupError;

    const { error: ownerMemberError } = await coach.client.from('training_group_members').insert({
      group_id: group.id,
      user_id: coach.userId,
      role: 'owner',
    });
    if (ownerMemberError) throw ownerMemberError;

    const { error: joinError } = await athlete.client.rpc('join_training_group_by_invite', {
      p_invite_code: group.invite_code,
    });
    if (joinError) throw joinError;

    const { error: messageError } = await athlete.client.from('training_group_messages').insert({
      group_id: group.id,
      author_id: athlete.userId,
      body: 'Mensagem smoke no grupo.',
    });
    if (messageError) throw messageError;

    const { error: coachStudentError } = await coach.client.from('coach_students').insert({
      coach_id: coach.userId,
      student_id: athlete.userId,
      status: 'active',
    });
    if (coachStudentError) throw coachStudentError;

    const { error: noteError } = await coach.client.from('coach_private_notes').insert({
      coach_id: coach.userId,
      student_id: athlete.userId,
      note: 'Nota privada smoke.',
    });
    if (noteError) throw noteError;

    const { error: assignmentError } = await coach.client.from('coach_workout_assignments').insert({
      coach_id: coach.userId,
      student_id: athlete.userId,
      title: 'Treino smoke',
      workout_json: { source: 'smoke', blocks: [{ order: 1, description: 'Agachamento 3x5' }] },
    });
    if (assignmentError) throw assignmentError;

    const { error: reportError } = await athlete.client.from('social_content_reports').insert({
      reporter_id: athlete.userId,
      target_type: 'post',
      target_id: post.id,
      reason: 'spam',
      details: 'Smoke test denúncia.',
    });
    if (reportError) throw reportError;

    console.log('OK: login, perfil, post, like, comentário, grupo, convite, chat, coach e denúncia validados.');
  } finally {
    if (service) {
      for (const userId of createdUserIds) {
        await service.auth.admin.deleteUser(userId);
      }
    } else {
      console.log('WARN: SUPABASE_SERVICE_ROLE_KEY ausente; usuários smoke não foram removidos automaticamente.');
    }
  }
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
