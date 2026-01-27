-- Create the entries table to store microapp data
create table entries (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- Can be uuid if strictly linking to auth.users
  microapp_id text not null,
  data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table entries enable row level security;

-- Policy to allow users to see only their own entries (if using Supabase Auth)
create policy "Users can see their own entries"
on entries for select
using (auth.uid()::text = user_id);

create policy "Users can insert their own entries"
on entries for insert
with check (auth.uid()::text = user_id);

create policy "Users can update their own entries"
on entries for update
using (auth.uid()::text = user_id);

create policy "Users can delete their own entries"
on entries for delete
using (auth.uid()::text = user_id);

-- Body system extensions: libraries, live sessions, and goals
create table if not exists public.exercise_library (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  primary_muscles text[] default '{}',
  secondary_muscles text[] default '{}',
  equipment text default '',
  pattern text,
  modality text check (modality in ('time','reps')) not null default 'reps',
  default_duration_sec integer,
  default_reps integer,
  weight_recommendation text,
  difficulty text check (difficulty in ('easy','medium','hard')),
  energy_band text check (energy_band in ('low','medium','high')),
  tags text[] default '{}',
  cues text,
  instructions text,
  video_url text,
  rest_default_sec integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_exercise_library_name on public.exercise_library using gin (name gin_trgm_ops);
create index if not exists idx_exercise_library_tags on public.exercise_library using gin (tags);

create table if not exists public.food_library (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  default_serving_grams numeric,
  calories numeric,
  protein numeric,
  carbs numeric,
  fats numeric,
  micros jsonb,
  tags text[] default '{}',
  source_url text,
  brand text,
  created_at timestamptz default now()
);

create index if not exists idx_food_library_name on public.food_library using gin (name gin_trgm_ops);
create index if not exists idx_food_library_tags on public.food_library using gin (tags);

create table if not exists public.meal_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  user_id uuid,
  items jsonb,
  total_calories numeric,
  total_protein numeric,
  total_carbs numeric,
  total_fats numeric,
  tags text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  routine_name text,
  energy_level text check (energy_level in ('low','medium','high')),
  started_at timestamptz default now(),
  completed_at timestamptz
);

create index if not exists idx_live_sessions_user on public.live_sessions (user_id, started_at desc);

create table if not exists public.exercise_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.live_sessions(id) on delete cascade,
  exercise_id uuid references public.exercise_library(id),
  user_id uuid not null,
  mode text check (mode in ('time','reps')) not null,
  target_time_sec integer,
  target_reps integer,
  actual_time_sec integer,
  actual_reps integer,
  weight numeric,
  rpe numeric,
  intensity text check (intensity in ('easy','medium','hard')),
  energy_at_start text check (energy_at_start in ('low','medium','high')),
  completed_at timestamptz default now()
);

create index if not exists idx_exercise_sets_user on public.exercise_sets (user_id, completed_at desc);
create index if not exists idx_exercise_sets_exercise on public.exercise_sets (exercise_id);

create table if not exists public.fitness_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  goal text not null,
  timeframe text,
  priority text check (priority in ('Low','Medium','High')),
  created_at timestamptz default now()
);
