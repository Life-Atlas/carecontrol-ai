-- CareControl AI — Migration 002: Schedules & Visits

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

-- See schedules for own brukare or linked brukare
create policy "See own/linked schedules"
  on public.schedules for select
  using (
    brukare_id in (
      select id from public.profiles where user_id = auth.uid()
      union
      select linked_brukare_id from public.profiles where user_id = auth.uid() and linked_brukare_id is not null
    )
  );

-- Anhörig and brukare can manage schedules
create policy "Manage schedules"
  on public.schedules for all
  using (
    brukare_id in (
      select id from public.profiles where user_id = auth.uid()
      union
      select linked_brukare_id from public.profiles where user_id = auth.uid() and linked_brukare_id is not null
    )
  );

-- Staff can see schedules for today (for brukare they're visiting)
create policy "Staff sees today schedules"
  on public.schedules for select
  using (
    exists (
      select 1 from public.profiles where user_id = auth.uid() and role = 'staff'
    )
    and date = current_date
  );

-- Visits table (actual check-in/check-out records)
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

create policy "See visits for own/linked"
  on public.visits for select
  using (
    brukare_id in (
      select id from public.profiles where user_id = auth.uid()
      union
      select linked_brukare_id from public.profiles where user_id = auth.uid() and linked_brukare_id is not null
    )
  );

create policy "Staff manages visits"
  on public.visits for all
  using (
    exists (
      select 1 from public.profiles where user_id = auth.uid() and role = 'staff'
    )
  );

-- Ratings (Stage 2 — but create table now so schema is stable)
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

create policy "Insert own ratings"
  on public.ratings for insert
  with check (rater_id = auth.uid());

create policy "See ratings for linked brukare"
  on public.ratings for select
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
