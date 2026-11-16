-- Create public.dive_voices table for Dive testimonials
create table if not exists public.dive_voices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  country_code text check (country_code is null or char_length(country_code) = 2),
  role text,
  photo_url text not null,
  link_url text not null,
  platform text not null default 'other' check (platform in ('instagram', 'tiktok', 'youtube', 'x', 'other')),
  quote text check (quote is null or char_length(quote) <= 140),
  gifted boolean not null default false,
  consent boolean not null default false,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.dive_voices enable row level security;

-- Admin check matching lib/auth-admin.ts (isUserAdmin)
create or replace function public.is_improve_admin()
returns boolean
language sql
stable
security definer
as $$
  select
    coalesce((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'superadmin'), false)
    or coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false)
    or coalesce((auth.jwt() -> 'user_metadata' ->> 'role') in ('admin', 'superadmin'), false)
    or coalesce((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false)
    or lower(coalesce(auth.jwt() ->> 'email', '')) like '%@improve-club.com';
$$;

-- Anyone can read published & consented voices
create policy "Public can view published consented dive voices"
  on public.dive_voices
  for select
  using (published = true and consent = true);

-- Admins can read all voices (including drafts)
create policy "Admins can view all dive voices"
  on public.dive_voices
  for select
  to authenticated
  using (public.is_improve_admin());

-- Only admins can insert, update, delete
create policy "Admins can insert dive voices"
  on public.dive_voices
  for insert
  to authenticated
  with check (public.is_improve_admin());

create policy "Admins can update dive voices"
  on public.dive_voices
  for update
  to authenticated
  using (public.is_improve_admin())
  with check (public.is_improve_admin());

create policy "Admins can delete dive voices"
  on public.dive_voices
  for delete
  to authenticated
  using (public.is_improve_admin());

-- Public Storage bucket "dive-voices"
insert into storage.buckets (id, name, public)
values ('dive-voices', 'dive-voices', true)
on conflict (id) do update set public = true;

-- Storage policies for "dive-voices" bucket
create policy "Public read access for dive-voices photos"
  on storage.objects
  for select
  using (bucket_id = 'dive-voices');

create policy "Admins can upload dive-voices photos"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'dive-voices' and public.is_improve_admin());

create policy "Admins can update dive-voices photos"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'dive-voices' and public.is_improve_admin());

create policy "Admins can delete dive-voices photos"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'dive-voices' and public.is_improve_admin());
