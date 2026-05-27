-- CareControl AI — Migration 001: Profiles (Life Atlas Care Passport)
-- This is the brukare's identity, their family members, and staff

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  date_of_birth date,
  birthplace text,
  languages text[] default '{sv}',
  primary_language text default 'sv',
  photo_url text,
  life_story text,
  medications text[] default '{}',
  allergies text[] default '{}',
  preferences text default '',
  role text not null check (role in ('brukare', 'anhorig', 'staff')),
  -- anhörig links to their brukare. Staff links per-visit, not here.
  linked_brukare_id uuid references public.profiles(id),
  -- Simple 4-digit code for staff doorstep access
  access_code text default lpad(floor(random() * 10000)::text, 4, '0'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_profiles_user_id on public.profiles(user_id);
create unique index idx_profiles_user_role on public.profiles(user_id, role);
create index idx_profiles_linked on public.profiles(linked_brukare_id);
create index idx_profiles_access_code on public.profiles(access_code);

-- RLS
alter table public.profiles enable row level security;

-- You can always see your own profile
create policy "Users see own profile"
  on public.profiles for select
  using (user_id = auth.uid());

-- Anhörig can see their linked brukare's profile
create policy "Anhörig sees linked brukare"
  on public.profiles for select
  using (id in (
    select linked_brukare_id from public.profiles where user_id = auth.uid()
  ));

-- Staff can see any brukare by access_code (handled in app logic, not RLS)
-- We add a permissive policy for staff role
create policy "Staff sees brukare via app"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'staff'
    )
    and role = 'brukare'
  );

-- Users can update their own profile
create policy "Users update own profile"
  on public.profiles for update
  using (user_id = auth.uid());

-- Anhörig can update their linked brukare
create policy "Anhörig updates linked brukare"
  on public.profiles for update
  using (id in (
    select linked_brukare_id from public.profiles where user_id = auth.uid()
  ));

-- Users can insert their own profile
create policy "Users insert own profile"
  on public.profiles for insert
  with check (user_id = auth.uid());

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at();
