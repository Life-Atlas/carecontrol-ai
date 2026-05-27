-- CareControl AI — Full schema setup
-- Run against dev Supabase: wubnxmzqxlwktuhbmrdo

-- Drop existing tables if they exist (dev only)
drop table if exists public.ratings cascade;
drop table if exists public.visits cascade;
drop table if exists public.schedules cascade;
drop table if exists public.profiles cascade;
drop function if exists update_updated_at cascade;

-- ============================================================
-- Migration 001: Profiles (Life Atlas Care Passport)
-- ============================================================
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
  linked_brukare_id uuid references public.profiles(id),
  access_code text default lpad(floor(random() * 10000)::text, 4, '0'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_profiles_user_id on public.profiles(user_id);
create unique index idx_profiles_user_role on public.profiles(user_id, role);
create index idx_profiles_linked on public.profiles(linked_brukare_id);
create index idx_profiles_access_code on public.profiles(access_code);

alter table public.profiles enable row level security;

create policy "Users see own profile" on public.profiles for select
  using (user_id = auth.uid());

create policy "Anhörig sees linked brukare" on public.profiles for select
  using (id in (
    select linked_brukare_id from public.profiles where user_id = auth.uid()
  ));

create policy "Staff sees brukare via app" on public.profiles for select
  using (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'staff')
    and role = 'brukare'
  );

create policy "Users update own profile" on public.profiles for update
  using (user_id = auth.uid());

create policy "Anhörig updates linked brukare" on public.profiles for update
  using (id in (
    select linked_brukare_id from public.profiles where user_id = auth.uid()
  ));

create policy "Users insert own profile" on public.profiles for insert
  with check (user_id = auth.uid());

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

-- ============================================================
-- Migration 002: Schedules & Visits
-- ============================================================
create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  brukare_id uuid references public.profiles(id) not null,
  date date not null,
  time_start time not null,
  time_end time,
  staff_name text,
  tasks text[] default '{}',
  status text default 'scheduled'
    check (status in ('scheduled', 'active', 'completed', 'cancelled', 'delayed')),
  notes text,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

create index idx_schedules_brukare_date on public.schedules(brukare_id, date);

alter table public.schedules enable row level security;

create policy "See own/linked schedules" on public.schedules for select
  using (
    brukare_id in (
      select id from public.profiles where user_id = auth.uid()
      union
      select linked_brukare_id from public.profiles where user_id = auth.uid() and linked_brukare_id is not null
    )
  );

create policy "Manage schedules" on public.schedules for all
  using (
    brukare_id in (
      select id from public.profiles where user_id = auth.uid()
      union
      select linked_brukare_id from public.profiles where user_id = auth.uid() and linked_brukare_id is not null
    )
  );

create policy "Staff sees today schedules" on public.schedules for select
  using (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'staff')
    and date = current_date
  );

-- Visits (actual check-in/check-out records)
create table public.visits (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid references public.schedules(id),
  brukare_id uuid references public.profiles(id) not null,
  staff_name text,
  checkin_at timestamptz,
  checkout_at timestamptz,
  tasks_completed text[] default '{}',
  staff_notes text,
  ai_summary text,
  mood_emoji text check (mood_emoji in ('happy', 'neutral', 'sad')),
  created_at timestamptz default now()
);

create index idx_visits_brukare on public.visits(brukare_id);
create index idx_visits_schedule on public.visits(schedule_id);

alter table public.visits enable row level security;

create policy "See visits for own/linked" on public.visits for select
  using (
    brukare_id in (
      select id from public.profiles where user_id = auth.uid()
      union
      select linked_brukare_id from public.profiles where user_id = auth.uid() and linked_brukare_id is not null
    )
  );

create policy "Staff manages visits" on public.visits for all
  using (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'staff')
  );

-- Ratings (Stage 2 ready)
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid references public.visits(id) not null,
  rater_id uuid references auth.users not null,
  rater_role text not null,
  emoji text check (emoji in ('happy', 'neutral', 'sad')),
  overall_score int check (overall_score between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

alter table public.ratings enable row level security;

create policy "Insert own ratings" on public.ratings for insert
  with check (rater_id = auth.uid());

create policy "See ratings for linked brukare" on public.ratings for select
  using (
    visit_id in (
      select v.id from public.visits v
      where v.brukare_id in (
        select id from public.profiles where user_id = auth.uid()
        union
        select linked_brukare_id from public.profiles where user_id = auth.uid() and linked_brukare_id is not null
      )
    )
  );

-- Enable realtime for key tables
alter publication supabase_realtime add table public.schedules;
alter publication supabase_realtime add table public.visits;
