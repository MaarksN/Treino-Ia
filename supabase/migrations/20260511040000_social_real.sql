create extension if not exists pgcrypto;

create table if not exists public.social_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  bio text,
  avatar_url text,
  city text,
  goal text,
  is_coach boolean not null default false,
  is_public boolean not null default true,
  total_workouts integer not null default 0 check (total_workouts >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  best_streak integer not null default 0 check (best_streak >= 0),
  total_volume numeric not null default 0 check (total_volume >= 0),
  weekly_volume numeric not null default 0 check (weekly_volume >= 0),
  last_workout_at timestamptz,
  badges jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.social_profiles add column if not exists weekly_volume numeric not null default 0;
alter table public.social_profiles add column if not exists last_workout_at timestamptz;

create table if not exists public.social_follows (
  follower_id uuid not null references public.social_profiles(id) on delete cascade,
  following_id uuid not null references public.social_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.training_groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.social_profiles(id) on delete cascade,
  name text not null,
  description text,
  invite_code text unique not null,
  is_private boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.social_profiles(id) on delete cascade,
  type text not null check (type in ('workout', 'pr', 'badge', 'challenge', 'text')),
  title text not null,
  body text,
  metric_label text,
  metric_value text,
  visibility text not null default 'public' check (visibility in ('public', 'followers', 'private', 'group')),
  group_id uuid references public.training_groups(id) on delete cascade,
  workout_template_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.social_post_likes (
  post_id uuid not null references public.social_posts(id) on delete cascade,
  user_id uuid not null references public.social_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.social_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.social_posts(id) on delete cascade,
  author_id uuid not null references public.social_profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.training_group_members (
  group_id uuid not null references public.training_groups(id) on delete cascade,
  user_id uuid not null references public.social_profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'coach', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.training_group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.training_groups(id) on delete cascade,
  author_id uuid not null references public.social_profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.group_challenges (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.training_groups(id) on delete cascade,
  name text not null,
  description text,
  target integer not null check (target > 0),
  metric text not null check (metric in ('workouts', 'volume', 'streak')),
  starts_at date not null,
  ends_at date not null,
  badge_reward text,
  created_at timestamptz not null default now()
);

create table if not exists public.group_challenge_progress (
  challenge_id uuid not null references public.group_challenges(id) on delete cascade,
  user_id uuid not null references public.social_profiles(id) on delete cascade,
  current integer not null default 0 check (current >= 0),
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

create table if not exists public.coach_students (
  coach_id uuid not null references public.social_profiles(id) on delete cascade,
  student_id uuid not null references public.social_profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('pending', 'active', 'archived')),
  created_at timestamptz not null default now(),
  primary key (coach_id, student_id),
  check (coach_id <> student_id)
);

create table if not exists public.coach_private_notes (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.social_profiles(id) on delete cascade,
  student_id uuid not null references public.social_profiles(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.coach_workout_assignments (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.social_profiles(id) on delete cascade,
  student_id uuid not null references public.social_profiles(id) on delete cascade,
  title text not null,
  workout_json jsonb not null,
  status text not null default 'assigned' check (status in ('assigned', 'accepted', 'completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.public_workout_templates (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.social_profiles(id) on delete cascade,
  title text not null,
  description text,
  goal text,
  level text,
  workout_json jsonb not null,
  likes_count integer not null default 0 check (likes_count >= 0),
  created_at timestamptz not null default now()
);

create index if not exists social_profiles_username_idx on public.social_profiles (username);
create index if not exists social_profiles_volume_idx on public.social_profiles (total_volume desc);
create index if not exists social_posts_public_created_idx on public.social_posts (visibility, created_at desc);
create index if not exists social_posts_author_created_idx on public.social_posts (author_id, created_at desc);
create index if not exists social_post_comments_post_idx on public.social_post_comments (post_id, created_at);
create index if not exists social_post_likes_post_idx on public.social_post_likes (post_id);
create index if not exists training_groups_invite_idx on public.training_groups (invite_code);
create index if not exists training_group_members_user_idx on public.training_group_members (user_id);
create index if not exists training_group_messages_group_idx on public.training_group_messages (group_id, created_at);
create index if not exists coach_students_student_idx on public.coach_students (student_id);
create index if not exists coach_notes_pair_idx on public.coach_private_notes (coach_id, student_id, created_at desc);
create index if not exists coach_assignments_pair_idx on public.coach_workout_assignments (coach_id, student_id, created_at desc);

do $$
declare
  realtime_table text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach realtime_table in array array[
      'social_posts',
      'social_post_likes',
      'social_post_comments',
      'training_group_messages'
    ]
    loop
      if not exists (
        select 1
        from pg_publication_rel publication_rel
        join pg_publication publication on publication.oid = publication_rel.prpubid
        join pg_class class on class.oid = publication_rel.prrelid
        join pg_namespace namespace on namespace.oid = class.relnamespace
        where publication.pubname = 'supabase_realtime'
          and namespace.nspname = 'public'
          and class.relname = realtime_table
      ) then
        execute format('alter publication supabase_realtime add table public.%I', realtime_table);
      end if;
    end loop;
  end if;
end $$;

alter table public.social_profiles enable row level security;
alter table public.social_follows enable row level security;
alter table public.social_posts enable row level security;
alter table public.social_post_likes enable row level security;
alter table public.social_post_comments enable row level security;
alter table public.training_groups enable row level security;
alter table public.training_group_members enable row level security;
alter table public.training_group_messages enable row level security;
alter table public.group_challenges enable row level security;
alter table public.group_challenge_progress enable row level security;
alter table public.coach_students enable row level security;
alter table public.coach_private_notes enable row level security;
alter table public.coach_workout_assignments enable row level security;
alter table public.public_workout_templates enable row level security;

create or replace function public.is_training_group_member(target_group_id uuid, target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.training_group_members member
    where member.group_id = target_group_id
      and member.user_id = target_user_id
  );
$$;

create or replace function public.is_training_group_admin(target_group_id uuid, target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.training_group_members member
    where member.group_id = target_group_id
      and member.user_id = target_user_id
      and member.role in ('owner', 'coach')
  );
$$;

drop policy if exists "profiles public read" on public.social_profiles;
drop policy if exists "profiles self upsert" on public.social_profiles;
drop policy if exists social_profiles_select_public_or_self on public.social_profiles;
drop policy if exists social_profiles_insert_self on public.social_profiles;
drop policy if exists social_profiles_update_self on public.social_profiles;
create policy social_profiles_select_public_or_self on public.social_profiles
  for select using (is_public = true or auth.uid() = id);
create policy social_profiles_insert_self on public.social_profiles
  for insert with check (auth.uid() = id);
create policy social_profiles_update_self on public.social_profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "follows self" on public.social_follows;
drop policy if exists social_follows_select_authenticated on public.social_follows;
drop policy if exists social_follows_insert_self on public.social_follows;
drop policy if exists social_follows_delete_self on public.social_follows;
create policy social_follows_select_authenticated on public.social_follows
  for select using (auth.role() = 'authenticated');
create policy social_follows_insert_self on public.social_follows
  for insert with check (auth.uid() = follower_id);
create policy social_follows_delete_self on public.social_follows
  for delete using (auth.uid() = follower_id);

drop policy if exists "social public read" on public.social_posts;
drop policy if exists "social own insert" on public.social_posts;
drop policy if exists social_posts_select_visible on public.social_posts;
drop policy if exists social_posts_insert_own on public.social_posts;
drop policy if exists social_posts_update_own on public.social_posts;
drop policy if exists social_posts_delete_own on public.social_posts;
create policy social_posts_select_visible on public.social_posts
  for select using (
    visibility = 'public'
    or author_id = auth.uid()
    or (visibility = 'group' and public.is_training_group_member(group_id, auth.uid()))
  );
create policy social_posts_insert_own on public.social_posts
  for insert with check (
    author_id = auth.uid()
    and (
      visibility = 'public'
      or (visibility = 'group' and public.is_training_group_member(group_id, auth.uid()))
    )
  );
create policy social_posts_update_own on public.social_posts
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy social_posts_delete_own on public.social_posts
  for delete using (author_id = auth.uid());

drop policy if exists "likes read" on public.social_post_likes;
drop policy if exists "likes self" on public.social_post_likes;
drop policy if exists social_post_likes_select_visible on public.social_post_likes;
drop policy if exists social_post_likes_insert_self on public.social_post_likes;
drop policy if exists social_post_likes_delete_self on public.social_post_likes;
create policy social_post_likes_select_visible on public.social_post_likes
  for select using (true);
create policy social_post_likes_insert_self on public.social_post_likes
  for insert with check (auth.uid() = user_id);
create policy social_post_likes_delete_self on public.social_post_likes
  for delete using (auth.uid() = user_id);

drop policy if exists "comments read" on public.social_post_comments;
drop policy if exists "comments self insert" on public.social_post_comments;
drop policy if exists social_post_comments_select_visible on public.social_post_comments;
drop policy if exists social_post_comments_insert_self on public.social_post_comments;
create policy social_post_comments_select_visible on public.social_post_comments
  for select using (true);
create policy social_post_comments_insert_self on public.social_post_comments
  for insert with check (auth.uid() = author_id);

drop policy if exists "groups member read" on public.training_groups;
drop policy if exists "groups create" on public.training_groups;
drop policy if exists training_groups_select_member_or_public on public.training_groups;
drop policy if exists training_groups_insert_owner on public.training_groups;
drop policy if exists training_groups_update_owner on public.training_groups;
create policy training_groups_select_member_or_public on public.training_groups
  for select using (is_private = false or public.is_training_group_member(id, auth.uid()));
create policy training_groups_insert_owner on public.training_groups
  for insert with check (owner_id = auth.uid());
create policy training_groups_update_owner on public.training_groups
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "group members read" on public.training_group_members;
drop policy if exists "group member self insert" on public.training_group_members;
drop policy if exists training_group_members_select_related on public.training_group_members;
drop policy if exists training_group_members_insert_self on public.training_group_members;
create policy training_group_members_select_related on public.training_group_members
  for select using (user_id = auth.uid() or public.is_training_group_member(group_id, auth.uid()));
create policy training_group_members_insert_self on public.training_group_members
  for insert with check (user_id = auth.uid());

drop policy if exists "group messages members" on public.training_group_messages;
drop policy if exists "group messages insert members" on public.training_group_messages;
drop policy if exists training_group_messages_select_members on public.training_group_messages;
drop policy if exists training_group_messages_insert_members on public.training_group_messages;
create policy training_group_messages_select_members on public.training_group_messages
  for select using (public.is_training_group_member(group_id, auth.uid()));
create policy training_group_messages_insert_members on public.training_group_messages
  for insert with check (author_id = auth.uid() and public.is_training_group_member(group_id, auth.uid()));

drop policy if exists "challenges members read" on public.group_challenges;
drop policy if exists "challenges owner coach insert" on public.group_challenges;
drop policy if exists group_challenges_select_members on public.group_challenges;
drop policy if exists group_challenges_insert_owner_coach on public.group_challenges;
create policy group_challenges_select_members on public.group_challenges
  for select using (public.is_training_group_member(group_id, auth.uid()));
create policy group_challenges_insert_owner_coach on public.group_challenges
  for insert with check (public.is_training_group_admin(group_id, auth.uid()));

drop policy if exists "challenge progress self" on public.group_challenge_progress;
drop policy if exists group_challenge_progress_self on public.group_challenge_progress;
create policy group_challenge_progress_self on public.group_challenge_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "coach relation read" on public.coach_students;
drop policy if exists "coach relation write" on public.coach_students;
drop policy if exists coach_students_select_related on public.coach_students;
drop policy if exists coach_students_insert_coach on public.coach_students;
drop policy if exists coach_students_update_coach on public.coach_students;
create policy coach_students_select_related on public.coach_students
  for select using (coach_id = auth.uid() or student_id = auth.uid());
create policy coach_students_insert_coach on public.coach_students
  for insert with check (coach_id = auth.uid());
create policy coach_students_update_coach on public.coach_students
  for update using (coach_id = auth.uid()) with check (coach_id = auth.uid());

drop policy if exists "coach notes private" on public.coach_private_notes;
drop policy if exists coach_private_notes_private on public.coach_private_notes;
create policy coach_private_notes_private on public.coach_private_notes
  for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());

drop policy if exists "coach assignments read" on public.coach_workout_assignments;
drop policy if exists "coach assignments write" on public.coach_workout_assignments;
drop policy if exists coach_workout_assignments_select_related on public.coach_workout_assignments;
drop policy if exists coach_workout_assignments_insert_coach on public.coach_workout_assignments;
drop policy if exists coach_workout_assignments_update_related on public.coach_workout_assignments;
create policy coach_workout_assignments_select_related on public.coach_workout_assignments
  for select using (coach_id = auth.uid() or student_id = auth.uid());
create policy coach_workout_assignments_insert_coach on public.coach_workout_assignments
  for insert with check (coach_id = auth.uid());
create policy coach_workout_assignments_update_related on public.coach_workout_assignments
  for update using (coach_id = auth.uid() or student_id = auth.uid());

drop policy if exists "templates public read" on public.public_workout_templates;
drop policy if exists "templates own insert" on public.public_workout_templates;
drop policy if exists public_workout_templates_select_public on public.public_workout_templates;
drop policy if exists public_workout_templates_insert_own on public.public_workout_templates;
create policy public_workout_templates_select_public on public.public_workout_templates
  for select using (true);
create policy public_workout_templates_insert_own on public.public_workout_templates
  for insert with check (author_id = auth.uid());

create or replace function public.join_training_group_by_invite(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_group_id uuid;
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado.';
  end if;

  select id
    into target_group_id
  from public.training_groups
  where invite_code = lower(trim(p_invite_code))
  limit 1;

  if target_group_id is null then
    raise exception 'Convite inválido ou expirado.';
  end if;

  insert into public.training_group_members (group_id, user_id, role)
  values (target_group_id, current_user_id, 'member')
  on conflict (group_id, user_id) do nothing;

  return target_group_id;
end;
$$;

create or replace function public.get_group_leaderboard(p_group_id uuid, p_metric text)
returns table (
  user_id uuid,
  username text,
  display_name text,
  avatar_url text,
  total_volume numeric,
  current_streak integer,
  total_workouts integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_training_group_member(p_group_id, auth.uid()) then
    raise exception 'Usuário sem acesso ao ranking do grupo.';
  end if;

  return query
  with weekly as (
    select
      sessions.user_id,
      coalesce(sum(sessions.volume_load), 0) as weekly_volume,
      count(*)::integer as weekly_workouts
    from public.workout_execution_sessions sessions
    where sessions.completed_at >= date_trunc('week', now())
    group by sessions.user_id
  )
  select
    profile.id as user_id,
    profile.username,
    profile.display_name,
    profile.avatar_url,
    coalesce(weekly.weekly_volume, 0) as total_volume,
    profile.current_streak,
    case
      when p_metric = 'workouts' then coalesce(weekly.weekly_workouts, 0)
      else profile.total_workouts
    end as total_workouts
  from public.training_group_members member
  join public.social_profiles profile on profile.id = member.user_id
  left join weekly on weekly.user_id = member.user_id
  where member.group_id = p_group_id
  order by
    case when p_metric = 'streak' then profile.current_streak end desc nulls last,
    case when p_metric = 'workouts' then coalesce(weekly.weekly_workouts, 0) end desc nulls last,
    case when p_metric = 'volume' then coalesce(weekly.weekly_volume, 0) end desc nulls last,
    profile.display_name asc;
end;
$$;

create or replace function public.sync_social_profile_from_workout_execution()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.social_profiles
  set
    total_workouts = total_workouts + 1,
    total_volume = total_volume + greatest(new.volume_load, 0),
    weekly_volume = case
      when new.completed_at >= date_trunc('week', now()) then weekly_volume + greatest(new.volume_load, 0)
      else weekly_volume
    end,
    last_workout_at = greatest(coalesce(last_workout_at, new.completed_at), new.completed_at),
    updated_at = now()
  where id = new.user_id;

  return new;
end;
$$;

drop trigger if exists workout_execution_social_profile_sync on public.workout_execution_sessions;
create trigger workout_execution_social_profile_sync
after insert on public.workout_execution_sessions
for each row execute function public.sync_social_profile_from_workout_execution();
