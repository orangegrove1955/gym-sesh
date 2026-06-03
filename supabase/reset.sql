-- ============================================================================
-- WARNING: THIS WILL DELETE ALL DATA. Only use for a full reset.
-- ============================================================================

-- Drop trigger and function first
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Drop all tables (CASCADE handles FK dependencies, but ordering for clarity)
drop table if exists public.set_logs cascade;
drop table if exists public.template_exercises cascade;
drop table if exists public.workout_templates cascade;
drop table if exists public.workout_sessions cascade;
drop table if exists public.programs cascade;
drop table if exists public.exercise_library cascade;
drop table if exists public.notification_preferences cascade;
drop table if exists public.push_subscriptions cascade;
drop table if exists public.user_profiles cascade;

-- ============================================================================
-- RECREATE SCHEMA
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

create table public.user_profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table public.exercise_library (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  name text not null,
  muscle_group text not null check (muscle_group in ('chest','back','shoulders','biceps','triceps','quads','hamstrings','glutes','calves','abs','forearms')),
  equipment text not null check (equipment in ('barbell','dumbbell','cable','machine','bodyweight')),
  is_compound boolean not null default false,
  weight_increment numeric not null default 2.5,
  created_at timestamptz default now() not null
);

create table public.programs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  description text,
  is_active boolean not null default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table public.workout_templates (
  id uuid primary key default uuid_generate_v4(),
  program_id uuid not null references public.programs on delete cascade,
  day_number int not null,
  name text not null,
  focus_areas text[] default '{}',
  created_at timestamptz default now() not null
);

create table public.template_exercises (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid not null references public.workout_templates on delete cascade,
  exercise_id uuid not null references public.exercise_library on delete cascade,
  sort_order int not null,
  sets int not null,
  min_reps int not null,
  max_reps int not null,
  is_backoff_set boolean not null default false,
  rest_seconds int not null default 90,
  notes text,
  superset_group int,
  created_at timestamptz default now() not null
);

create table public.workout_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  template_id uuid not null references public.workout_templates on delete cascade,
  started_at timestamptz default now() not null,
  completed_at timestamptz,
  notes text,
  created_at timestamptz default now() not null
);

create table public.set_logs (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.workout_sessions on delete cascade,
  exercise_id uuid not null references public.exercise_library on delete cascade,
  template_exercise_id uuid not null references public.template_exercises on delete cascade,
  set_number int not null,
  prescribed_weight numeric,
  prescribed_reps int,
  actual_weight numeric,
  actual_reps int,
  difficulty text check (difficulty in ('easy','challenging','hard')),
  completed boolean not null default false,
  completed_at timestamptz,
  is_banded boolean not null default false,
  went_to_failure boolean not null default false,
  equipment_used text,
  created_at timestamptz default now() not null
);

create table public.push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz default now() not null,
  unique(user_id, endpoint)
);

create table public.notification_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade unique,
  enabled boolean not null default true,
  schedule_type text not null default 'fixed_days' check (schedule_type in ('fixed_days', 'days_since_workout')),
  fixed_days int[] default '{1,3,5}',
  days_interval int default 2,
  reminder_hour int not null default 9,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================================
-- INDEXES
-- ============================================================================

create index idx_set_logs_session_id on public.set_logs (session_id);
create index idx_set_logs_exercise_id on public.set_logs (exercise_id);
create index idx_workout_sessions_user_started on public.workout_sessions (user_id, started_at);
create index idx_template_exercises_template_sort on public.template_exercises (template_id, sort_order);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.user_profiles enable row level security;
alter table public.exercise_library enable row level security;
alter table public.programs enable row level security;
alter table public.workout_templates enable row level security;
alter table public.template_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.set_logs enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notification_preferences enable row level security;

-- user_profiles
create policy "Users can view own profile" on public.user_profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.user_profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.user_profiles for update using (auth.uid() = id);
create policy "Users can delete own profile" on public.user_profiles for delete using (auth.uid() = id);

-- exercise_library
create policy "Authenticated users can view exercises" on public.exercise_library for select using (auth.role() = 'authenticated');
create policy "Users can insert own exercises" on public.exercise_library for insert with check (auth.uid() = user_id);
create policy "Users can update own exercises" on public.exercise_library for update using (auth.uid() = user_id);
create policy "Users can delete own exercises" on public.exercise_library for delete using (auth.uid() = user_id);

-- programs
create policy "Users can view own programs" on public.programs for select using (auth.uid() = user_id);
create policy "Users can insert own programs" on public.programs for insert with check (auth.uid() = user_id);
create policy "Users can update own programs" on public.programs for update using (auth.uid() = user_id);
create policy "Users can delete own programs" on public.programs for delete using (auth.uid() = user_id);

-- workout_templates
create policy "Users can view own templates" on public.workout_templates for select using (
  exists (select 1 from public.programs where programs.id = workout_templates.program_id and programs.user_id = auth.uid())
);
create policy "Users can insert own templates" on public.workout_templates for insert with check (
  exists (select 1 from public.programs where programs.id = workout_templates.program_id and programs.user_id = auth.uid())
);
create policy "Users can update own templates" on public.workout_templates for update using (
  exists (select 1 from public.programs where programs.id = workout_templates.program_id and programs.user_id = auth.uid())
);
create policy "Users can delete own templates" on public.workout_templates for delete using (
  exists (select 1 from public.programs where programs.id = workout_templates.program_id and programs.user_id = auth.uid())
);

-- template_exercises
create policy "Users can view own template exercises" on public.template_exercises for select using (
  exists (
    select 1 from public.workout_templates wt
    join public.programs p on p.id = wt.program_id
    where wt.id = template_exercises.template_id and p.user_id = auth.uid()
  )
);
create policy "Users can insert own template exercises" on public.template_exercises for insert with check (
  exists (
    select 1 from public.workout_templates wt
    join public.programs p on p.id = wt.program_id
    where wt.id = template_exercises.template_id and p.user_id = auth.uid()
  )
);
create policy "Users can update own template exercises" on public.template_exercises for update using (
  exists (
    select 1 from public.workout_templates wt
    join public.programs p on p.id = wt.program_id
    where wt.id = template_exercises.template_id and p.user_id = auth.uid()
  )
);
create policy "Users can delete own template exercises" on public.template_exercises for delete using (
  exists (
    select 1 from public.workout_templates wt
    join public.programs p on p.id = wt.program_id
    where wt.id = template_exercises.template_id and p.user_id = auth.uid()
  )
);

-- workout_sessions
create policy "Users can view own sessions" on public.workout_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on public.workout_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions" on public.workout_sessions for update using (auth.uid() = user_id);
create policy "Users can delete own sessions" on public.workout_sessions for delete using (auth.uid() = user_id);

-- set_logs
create policy "Users can view own set logs" on public.set_logs for select using (
  exists (select 1 from public.workout_sessions where workout_sessions.id = set_logs.session_id and workout_sessions.user_id = auth.uid())
);
create policy "Users can insert own set logs" on public.set_logs for insert with check (
  exists (select 1 from public.workout_sessions where workout_sessions.id = set_logs.session_id and workout_sessions.user_id = auth.uid())
);
create policy "Users can update own set logs" on public.set_logs for update using (
  exists (select 1 from public.workout_sessions where workout_sessions.id = set_logs.session_id and workout_sessions.user_id = auth.uid())
);
create policy "Users can delete own set logs" on public.set_logs for delete using (
  exists (select 1 from public.workout_sessions where workout_sessions.id = set_logs.session_id and workout_sessions.user_id = auth.uid())
);

-- push_subscriptions & notification_preferences
create policy "Users can manage own subscriptions" on public.push_subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own preferences" on public.notification_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
