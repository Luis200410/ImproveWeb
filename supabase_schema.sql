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
