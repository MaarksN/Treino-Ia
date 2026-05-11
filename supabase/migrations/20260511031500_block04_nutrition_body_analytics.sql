create extension if not exists pgcrypto;

create table if not exists public.nutrition_macro_targets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  calories integer not null check (calories between 0 and 12000),
  protein integer not null check (protein between 0 and 1000),
  carbs integer not null check (carbs between 0 and 2000),
  fat integer not null check (fat between 0 and 1000),
  updated_at timestamptz not null default now()
);

create table if not exists public.nutrition_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_date date not null,
  meal_type text not null check (meal_type in ('Café da manhã', 'Almoço', 'Jantar', 'Lanche', 'Pré-treino', 'Pós-treino')),
  description text not null check (char_length(description) between 2 and 2000),
  estimated_calories integer check (estimated_calories between 0 and 8000),
  estimated_protein integer check (estimated_protein between 0 and 400),
  estimated_carbs integer check (estimated_carbs between 0 and 800),
  estimated_fat integer check (estimated_fat between 0 and 400),
  ai_analysis text,
  created_at timestamptz not null default now()
);

create table if not exists public.nutrition_supplements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  supplement_date date not null default current_date,
  name text not null check (char_length(name) between 2 and 160),
  dose text not null default '',
  timing text not null default '',
  taken boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.nutrition_favorite_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 160),
  calories integer not null default 0 check (calories between 0 and 8000),
  protein integer not null default 0 check (protein between 0 and 400),
  carbs integer not null default 0 check (carbs between 0 and 800),
  fat integer not null default 0 check (fat between 0 and 400),
  created_at timestamptz not null default now()
);

create table if not exists public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  metric_date date not null,
  weight numeric check (weight between 20 and 350),
  body_fat_percent numeric check (body_fat_percent between 3 and 80),
  chest numeric check (chest between 20 and 220),
  waist numeric check (waist between 20 and 220),
  hip numeric check (hip between 20 and 240),
  arm numeric check (arm between 10 and 100),
  thigh numeric check (thigh between 20 and 140),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.body_progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  photo_date date not null,
  month_key text not null check (month_key ~ '^\d{4}-\d{2}$'),
  angle text not null default 'front' check (angle in ('front', 'side', 'back', 'other')),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  storage_path text not null,
  ai_analysis text,
  created_at timestamptz not null default now()
);

create table if not exists public.body_recomposition_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 160),
  target_date date not null,
  status text not null default 'active' check (status in ('active', 'completed', 'paused')),
  start_weight numeric check (start_weight between 20 and 350),
  target_weight numeric check (target_weight between 20 and 350),
  start_body_fat_percent numeric check (start_body_fat_percent between 3 and 80),
  target_body_fat_percent numeric check (target_body_fat_percent between 3 and 80),
  start_waist numeric check (start_waist between 20 and 220),
  target_waist numeric check (target_waist between 20 and 220),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    target_weight is not null
    or target_body_fat_percent is not null
    or target_waist is not null
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'body-progress-photos',
  'body-progress-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create index if not exists nutrition_meals_user_date_idx
  on public.nutrition_meals (user_id, meal_date desc);

create index if not exists nutrition_supplements_user_date_idx
  on public.nutrition_supplements (user_id, supplement_date desc);

create index if not exists body_metrics_user_date_idx
  on public.body_metrics (user_id, metric_date desc);

create index if not exists body_progress_photos_user_month_idx
  on public.body_progress_photos (user_id, month_key desc);

create index if not exists body_recomposition_goals_user_status_idx
  on public.body_recomposition_goals (user_id, status);

alter table public.nutrition_macro_targets enable row level security;
alter table public.nutrition_meals enable row level security;
alter table public.nutrition_supplements enable row level security;
alter table public.nutrition_favorite_foods enable row level security;
alter table public.body_metrics enable row level security;
alter table public.body_progress_photos enable row level security;
alter table public.body_recomposition_goals enable row level security;

drop policy if exists nutrition_macro_targets_own_select on public.nutrition_macro_targets;
create policy nutrition_macro_targets_own_select
  on public.nutrition_macro_targets for select
  using (auth.uid() = user_id);

drop policy if exists nutrition_macro_targets_own_insert on public.nutrition_macro_targets;
create policy nutrition_macro_targets_own_insert
  on public.nutrition_macro_targets for insert
  with check (auth.uid() = user_id);

drop policy if exists nutrition_macro_targets_own_update on public.nutrition_macro_targets;
create policy nutrition_macro_targets_own_update
  on public.nutrition_macro_targets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists nutrition_meals_own_select on public.nutrition_meals;
create policy nutrition_meals_own_select
  on public.nutrition_meals for select
  using (auth.uid() = user_id);

drop policy if exists nutrition_meals_own_insert on public.nutrition_meals;
create policy nutrition_meals_own_insert
  on public.nutrition_meals for insert
  with check (auth.uid() = user_id);

drop policy if exists nutrition_supplements_own_select on public.nutrition_supplements;
create policy nutrition_supplements_own_select
  on public.nutrition_supplements for select
  using (auth.uid() = user_id);

drop policy if exists nutrition_supplements_own_insert on public.nutrition_supplements;
create policy nutrition_supplements_own_insert
  on public.nutrition_supplements for insert
  with check (auth.uid() = user_id);

drop policy if exists nutrition_favorite_foods_own_select on public.nutrition_favorite_foods;
create policy nutrition_favorite_foods_own_select
  on public.nutrition_favorite_foods for select
  using (auth.uid() = user_id);

drop policy if exists nutrition_favorite_foods_own_insert on public.nutrition_favorite_foods;
create policy nutrition_favorite_foods_own_insert
  on public.nutrition_favorite_foods for insert
  with check (auth.uid() = user_id);

drop policy if exists body_metrics_own_select on public.body_metrics;
create policy body_metrics_own_select
  on public.body_metrics for select
  using (auth.uid() = user_id);

drop policy if exists body_metrics_own_insert on public.body_metrics;
create policy body_metrics_own_insert
  on public.body_metrics for insert
  with check (auth.uid() = user_id);

drop policy if exists body_metrics_own_update on public.body_metrics;
create policy body_metrics_own_update
  on public.body_metrics for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists body_progress_photos_own_select on public.body_progress_photos;
create policy body_progress_photos_own_select
  on public.body_progress_photos for select
  using (auth.uid() = user_id);

drop policy if exists body_progress_photos_own_insert on public.body_progress_photos;
create policy body_progress_photos_own_insert
  on public.body_progress_photos for insert
  with check (
    auth.uid() = user_id
    and storage_path like (auth.uid()::text || '/%')
  );

drop policy if exists body_recomposition_goals_own_select on public.body_recomposition_goals;
create policy body_recomposition_goals_own_select
  on public.body_recomposition_goals for select
  using (auth.uid() = user_id);

drop policy if exists body_recomposition_goals_own_insert on public.body_recomposition_goals;
create policy body_recomposition_goals_own_insert
  on public.body_recomposition_goals for insert
  with check (auth.uid() = user_id);

drop policy if exists body_recomposition_goals_own_update on public.body_recomposition_goals;
create policy body_recomposition_goals_own_update
  on public.body_recomposition_goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists body_progress_photos_storage_own_select on storage.objects;
create policy body_progress_photos_storage_own_select
  on storage.objects for select
  using (
    bucket_id = 'body-progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists body_progress_photos_storage_own_insert on storage.objects;
create policy body_progress_photos_storage_own_insert
  on storage.objects for insert
  with check (
    bucket_id = 'body-progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists body_progress_photos_storage_own_update on storage.objects;
create policy body_progress_photos_storage_own_update
  on storage.objects for update
  using (
    bucket_id = 'body-progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'body-progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
