create table if not exists public.social_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.social_profiles(id) on delete cascade,
  visibility text not null default 'public' check (visibility in ('public', 'group', 'private')),
  group_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.social_post_comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.social_profiles(id) on delete cascade,
  post_id uuid references public.social_posts(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.public_workout_templates (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.social_profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_training_group_member(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
stable
as $$
  select false;
$$;

create table if not exists public.social_moderators (
  user_id uuid primary key references public.social_profiles(id) on delete cascade,
  role text not null default 'moderator' check (role in ('moderator', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.social_profiles add column if not exists moderation_status text not null default 'visible'
  check (moderation_status in ('visible', 'under_review', 'hidden', 'removed'));
alter table public.social_profiles add column if not exists moderation_reason text;
alter table public.social_profiles add column if not exists moderated_at timestamptz;
alter table public.social_profiles add column if not exists moderated_by uuid references public.social_profiles(id);

alter table public.social_posts add column if not exists moderation_status text not null default 'visible'
  check (moderation_status in ('visible', 'under_review', 'hidden', 'removed'));
alter table public.social_posts add column if not exists moderation_reason text;
alter table public.social_posts add column if not exists moderated_at timestamptz;
alter table public.social_posts add column if not exists moderated_by uuid references public.social_profiles(id);

alter table public.social_post_comments add column if not exists moderation_status text not null default 'visible'
  check (moderation_status in ('visible', 'under_review', 'hidden', 'removed'));
alter table public.social_post_comments add column if not exists moderation_reason text;
alter table public.social_post_comments add column if not exists moderated_at timestamptz;
alter table public.social_post_comments add column if not exists moderated_by uuid references public.social_profiles(id);

alter table public.public_workout_templates add column if not exists moderation_status text not null default 'visible'
  check (moderation_status in ('visible', 'under_review', 'hidden', 'removed'));
alter table public.public_workout_templates add column if not exists moderation_reason text;
alter table public.public_workout_templates add column if not exists moderated_at timestamptz;
alter table public.public_workout_templates add column if not exists moderated_by uuid references public.social_profiles(id);

create table if not exists public.social_content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.social_profiles(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment', 'profile', 'workout_template')),
  target_id uuid not null,
  reason text not null check (
    reason in (
      'spam',
      'harassment',
      'hate',
      'sexual_content',
      'violence',
      'self_harm',
      'illegal_activity',
      'privacy',
      'misinformation',
      'other'
    )
  ),
  details text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'actioned', 'dismissed')),
  moderation_action text not null default 'none' check (
    moderation_action in ('none', 'hidden', 'removed', 'user_warned', 'user_suspended')
  ),
  reviewer_id uuid references public.social_profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);

create index if not exists social_profiles_moderation_status_idx on public.social_profiles (moderation_status);
create index if not exists social_posts_moderation_status_idx on public.social_posts (moderation_status, created_at desc);
create index if not exists social_comments_moderation_status_idx on public.social_post_comments (moderation_status, created_at);
create index if not exists public_templates_moderation_status_idx on public.public_workout_templates (moderation_status, created_at desc);
create index if not exists social_content_reports_target_idx on public.social_content_reports (target_type, target_id, status);
create index if not exists social_content_reports_reviewer_idx on public.social_content_reports (reviewer_id, updated_at desc);

alter table public.social_moderators enable row level security;
alter table public.social_content_reports enable row level security;

create or replace function public.is_social_moderator(target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.social_moderators moderator
    where moderator.user_id = target_user_id
      and moderator.active = true
  );
$$;

drop policy if exists social_moderators_select_self_or_moderator on public.social_moderators;
create policy social_moderators_select_self_or_moderator on public.social_moderators
  for select using (user_id = auth.uid() or public.is_social_moderator(auth.uid()));

drop policy if exists social_content_reports_select_own_or_moderator on public.social_content_reports;
drop policy if exists social_content_reports_insert_own on public.social_content_reports;
drop policy if exists social_content_reports_update_moderator on public.social_content_reports;
create policy social_content_reports_select_own_or_moderator on public.social_content_reports
  for select using (reporter_id = auth.uid() or public.is_social_moderator(auth.uid()));
create policy social_content_reports_insert_own on public.social_content_reports
  for insert with check (reporter_id = auth.uid());
create policy social_content_reports_update_moderator on public.social_content_reports
  for update using (public.is_social_moderator(auth.uid()))
  with check (public.is_social_moderator(auth.uid()));

drop policy if exists social_profiles_select_public_or_self on public.social_profiles;
create policy social_profiles_select_public_or_self on public.social_profiles
  for select using (
    auth.uid() = id
    or public.is_social_moderator(auth.uid())
    or (is_public = true and moderation_status in ('visible', 'under_review'))
  );

drop policy if exists social_profiles_update_self on public.social_profiles;
create policy social_profiles_update_self on public.social_profiles
  for update using (auth.uid() = id and moderation_status <> 'removed')
  with check (auth.uid() = id and moderation_status <> 'removed');

drop policy if exists social_posts_select_visible on public.social_posts;
create policy social_posts_select_visible on public.social_posts
  for select using (
    author_id = auth.uid()
    or public.is_social_moderator(auth.uid())
    or (
      moderation_status in ('visible', 'under_review')
      and (
        visibility = 'public'
        or (visibility = 'group' and public.is_training_group_member(group_id, auth.uid()))
      )
    )
  );

drop policy if exists social_post_comments_select_visible on public.social_post_comments;
create policy social_post_comments_select_visible on public.social_post_comments
  for select using (
    author_id = auth.uid()
    or public.is_social_moderator(auth.uid())
    or moderation_status in ('visible', 'under_review')
  );

drop policy if exists public_workout_templates_select_public on public.public_workout_templates;
create policy public_workout_templates_select_public on public.public_workout_templates
  for select using (
    author_id = auth.uid()
    or public.is_social_moderator(auth.uid())
    or moderation_status in ('visible', 'under_review')
  );

create or replace function public.apply_social_report_threshold()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  report_count integer;
  next_status text;
begin
  select count(distinct reporter_id)
    into report_count
  from public.social_content_reports
  where target_type = new.target_type
    and target_id = new.target_id
    and status in ('open', 'reviewing');

  next_status := case
    when new.target_type = 'profile' and report_count >= 5 then 'hidden'
    when new.target_type <> 'profile' and report_count >= 3 then 'hidden'
    else 'under_review'
  end;

  if new.target_type = 'post' then
    update public.social_posts
    set moderation_status = next_status,
        moderation_reason = new.reason,
        moderated_at = now()
    where id = new.target_id
      and moderation_status not in ('hidden', 'removed');
  elsif new.target_type = 'comment' then
    update public.social_post_comments
    set moderation_status = next_status,
        moderation_reason = new.reason,
        moderated_at = now()
    where id = new.target_id
      and moderation_status not in ('hidden', 'removed');
  elsif new.target_type = 'profile' then
    update public.social_profiles
    set moderation_status = next_status,
        moderation_reason = new.reason,
        moderated_at = now()
    where id = new.target_id
      and moderation_status not in ('hidden', 'removed');
  elsif new.target_type = 'workout_template' then
    update public.public_workout_templates
    set moderation_status = next_status,
        moderation_reason = new.reason,
        moderated_at = now()
    where id = new.target_id
      and moderation_status not in ('hidden', 'removed');
  end if;

  return new;
end;
$$;

drop trigger if exists social_report_threshold on public.social_content_reports;
create trigger social_report_threshold
after insert on public.social_content_reports
for each row execute function public.apply_social_report_threshold();

create or replace function public.resolve_social_report(
  p_report_id uuid,
  p_status text,
  p_action text,
  p_content_status text,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.social_content_reports%rowtype;
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null or not public.is_social_moderator(current_user_id) then
    raise exception 'Usuário sem permissão de moderação.';
  end if;

  if p_status not in ('reviewing', 'actioned', 'dismissed') then
    raise exception 'Status de denúncia inválido.';
  end if;

  if p_action not in ('none', 'hidden', 'removed', 'user_warned', 'user_suspended') then
    raise exception 'Ação de moderação inválida.';
  end if;

  if p_content_status not in ('visible', 'under_review', 'hidden', 'removed') then
    raise exception 'Status de conteúdo inválido.';
  end if;

  select *
    into target
  from public.social_content_reports
  where id = p_report_id;

  if target.id is null then
    raise exception 'Denúncia não encontrada.';
  end if;

  update public.social_content_reports
  set status = p_status,
      moderation_action = p_action,
      reviewer_id = current_user_id,
      reviewed_at = now(),
      updated_at = now()
  where id = p_report_id;

  if target.target_type = 'post' then
    update public.social_posts
    set moderation_status = p_content_status,
        moderation_reason = coalesce(p_reason, target.reason),
        moderated_by = current_user_id,
        moderated_at = now()
    where id = target.target_id;
  elsif target.target_type = 'comment' then
    update public.social_post_comments
    set moderation_status = p_content_status,
        moderation_reason = coalesce(p_reason, target.reason),
        moderated_by = current_user_id,
        moderated_at = now()
    where id = target.target_id;
  elsif target.target_type = 'profile' then
    update public.social_profiles
    set moderation_status = p_content_status,
        moderation_reason = coalesce(p_reason, target.reason),
        moderated_by = current_user_id,
        moderated_at = now()
    where id = target.target_id;
  elsif target.target_type = 'workout_template' then
    update public.public_workout_templates
    set moderation_status = p_content_status,
        moderation_reason = coalesce(p_reason, target.reason),
        moderated_by = current_user_id,
        moderated_at = now()
    where id = target.target_id;
  end if;
end;
$$;
