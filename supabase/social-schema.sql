create extension if not exists "pgcrypto";

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
  total_workouts integer not null default 0,
  current_streak integer not null default 0,
  best_streak integer not null default 0,
  total_volume numeric not null default 0,
  badges jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_follows (
  follower_id uuid not null references public.social_profiles(id) on delete cascade,
  following_id uuid not null references public.social_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
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
  group_id uuid,
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

create table if not exists public.training_groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.social_profiles(id) on delete cascade,
  name text not null,
  description text,
  invite_code text unique not null,
  is_private boolean not null default true,
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
  target integer not null,
  metric text not null check (metric in ('workouts', 'volume', 'streak')),
  starts_at date not null,
  ends_at date not null,
  badge_reward text,
  created_at timestamptz not null default now()
);

create table if not exists public.group_challenge_progress (
  challenge_id uuid not null references public.group_challenges(id) on delete cascade,
  user_id uuid not null references public.social_profiles(id) on delete cascade,
  current integer not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

create table if not exists public.coach_students (
  coach_id uuid not null references public.social_profiles(id) on delete cascade,
  student_id uuid not null references public.social_profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('pending', 'active', 'archived')),
  created_at timestamptz not null default now(),
  primary key (coach_id, student_id)
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
  likes_count integer not null default 0,
  created_at timestamptz not null default now()
);

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

create policy "profiles public read" on public.social_profiles
for select using (is_public = true or auth.uid() = id);

create policy "profiles self upsert" on public.social_profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "social public read" on public.social_posts
for select using (visibility = 'public' or author_id = auth.uid());

create policy "social own insert" on public.social_posts
for insert with check (author_id = auth.uid());

create policy "likes read" on public.social_post_likes
for select using (true);

create policy "likes self" on public.social_post_likes
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "comments read" on public.social_post_comments
for select using (true);

create policy "comments self insert" on public.social_post_comments
for insert with check (author_id = auth.uid());

create policy "follows self" on public.social_follows
for all using (follower_id = auth.uid()) with check (follower_id = auth.uid());

create policy "groups member read" on public.training_groups
for select using (
  exists (
    select 1 from public.training_group_members m
    where m.group_id = id and m.user_id = auth.uid()
  )
  or is_private = false
);

create policy "groups create" on public.training_groups
for insert with check (owner_id = auth.uid());

create policy "group members read" on public.training_group_members
for select using (true);

create policy "group member self insert" on public.training_group_members
for insert with check (user_id = auth.uid());

create policy "group messages members" on public.training_group_messages
for select using (
  exists (
    select 1 from public.training_group_members m
    where m.group_id = group_id and m.user_id = auth.uid()
  )
);

create policy "group messages insert members" on public.training_group_messages
for insert with check (
  author_id = auth.uid()
  and exists (
    select 1 from public.training_group_members m
    where m.group_id = group_id and m.user_id = auth.uid()
  )
);

create policy "challenges members read" on public.group_challenges
for select using (
  exists (
    select 1 from public.training_group_members m
    where m.group_id = group_id and m.user_id = auth.uid()
  )
);

create policy "challenges owner coach insert" on public.group_challenges
for insert with check (
  exists (
    select 1 from public.training_group_members m
    where m.group_id = group_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'coach')
  )
);

create policy "challenge progress self" on public.group_challenge_progress
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "coach relation read" on public.coach_students
for select using (coach_id = auth.uid() or student_id = auth.uid());

create policy "coach relation write" on public.coach_students
for insert with check (coach_id = auth.uid());

create policy "coach notes private" on public.coach_private_notes
for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());

create policy "coach assignments read" on public.coach_workout_assignments
for select using (coach_id = auth.uid() or student_id = auth.uid());

create policy "coach assignments write" on public.coach_workout_assignments
for insert with check (coach_id = auth.uid());

create policy "templates public read" on public.public_workout_templates
for select using (true);

create policy "templates own insert" on public.public_workout_templates
for insert with check (author_id = auth.uid());
