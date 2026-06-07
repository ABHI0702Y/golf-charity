-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- CHARITIES
-- ============================================================
create table public.charities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  images text[] default '{}',
  featured boolean default false,
  website text,
  created_at timestamptz default now()
);

-- ============================================================
-- PROFILES  (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'subscriber' check (role in ('subscriber', 'admin')),
  charity_id uuid references public.charities(id),
  charity_percentage integer not null default 10 check (charity_percentage >= 10 and charity_percentage <= 100),
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_subscription_id text unique,
  plan text not null check (plan in ('monthly', 'yearly')),
  status text not null default 'inactive' check (status in ('active', 'inactive', 'cancelled', 'lapsed')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- GOLF SCORES  (max 5 per user, rolling)
-- ============================================================
create table public.golf_scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null check (score >= 1 and score <= 45),
  played_at date not null,
  created_at timestamptz default now()
);

-- Trigger: enforce max 5 scores, delete oldest on insert
create or replace function enforce_rolling_scores()
returns trigger as $$
declare
  score_count integer;
  oldest_id uuid;
begin
  select count(*) into score_count from public.golf_scores where user_id = new.user_id;
  if score_count >= 5 then
    select id into oldest_id from public.golf_scores
    where user_id = new.user_id
    order by played_at asc, created_at asc
    limit 1;
    delete from public.golf_scores where id = oldest_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_rolling_scores
before insert on public.golf_scores
for each row execute function enforce_rolling_scores();

-- ============================================================
-- DRAWS
-- ============================================================
create table public.draws (
  id uuid primary key default uuid_generate_v4(),
  month text not null unique,  -- format: "2026-06"
  status text not null default 'draft' check (status in ('draft', 'simulated', 'published')),
  draw_type text not null default 'random' check (draw_type in ('random', 'algorithmic')),
  drawn_numbers integer[] default '{}',
  jackpot_rollover numeric(10,2) default 0,
  total_pool numeric(10,2) default 0,
  active_subscribers integer default 0,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- DRAW RESULTS
-- ============================================================
create table public.draw_results (
  id uuid primary key default uuid_generate_v4(),
  draw_id uuid not null references public.draws(id) on delete cascade,
  match_type integer not null check (match_type in (3, 4, 5)),
  user_ids uuid[] default '{}',
  prize_pool numeric(10,2) default 0,
  prize_per_winner numeric(10,2) default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- WINNER VERIFICATIONS
-- ============================================================
create table public.winner_verifications (
  id uuid primary key default uuid_generate_v4(),
  draw_result_id uuid not null references public.draw_results(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  proof_url text,
  admin_status text not null default 'pending' check (admin_status in ('pending', 'approved', 'rejected')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  admin_note text,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  unique(draw_result_id, user_id)
);

-- ============================================================
-- CHARITY DONATIONS  (independent, not tied to gameplay)
-- ============================================================
create table public.charity_donations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  charity_id uuid not null references public.charities(id),
  amount numeric(10,2) not null check (amount > 0),
  stripe_payment_intent_id text,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  created_at timestamptz default now()
);

-- ============================================================
-- JACKPOT LEDGER
-- ============================================================
create table public.jackpot_ledger (
  id uuid primary key default uuid_generate_v4(),
  draw_id uuid references public.draws(id),
  amount numeric(10,2) not null,
  note text,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.golf_scores enable row level security;
alter table public.charities enable row level security;
alter table public.draws enable row level security;
alter table public.draw_results enable row level security;
alter table public.winner_verifications enable row level security;
alter table public.charity_donations enable row level security;
alter table public.jackpot_ledger enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update all profiles" on public.profiles for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Subscriptions
create policy "Users can view own subscription" on public.subscriptions for select using (user_id = auth.uid());
create policy "Admins can view all subscriptions" on public.subscriptions for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Golf Scores
create policy "Users can view own scores" on public.golf_scores for select using (user_id = auth.uid());
create policy "Users can insert own scores" on public.golf_scores for insert with check (user_id = auth.uid());
create policy "Users can delete own scores" on public.golf_scores for delete using (user_id = auth.uid());
create policy "Admins can view all scores" on public.golf_scores for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can manage all scores" on public.golf_scores for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Charities (public read)
create policy "Anyone can view charities" on public.charities for select using (true);
create policy "Admins can manage charities" on public.charities for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Draws (public read for published)
create policy "Anyone can view published draws" on public.draws for select using (status = 'published');
create policy "Admins can manage draws" on public.draws for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Draw Results
create policy "Anyone can view draw results" on public.draw_results for select using (true);
create policy "Admins can manage draw results" on public.draw_results for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Winner Verifications
create policy "Users can view own verifications" on public.winner_verifications for select using (user_id = auth.uid());
create policy "Users can insert own verifications" on public.winner_verifications for insert with check (user_id = auth.uid());
create policy "Admins can manage all verifications" on public.winner_verifications for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Charity Donations
create policy "Users can view own donations" on public.charity_donations for select using (user_id = auth.uid());
create policy "Users can insert own donations" on public.charity_donations for insert with check (user_id = auth.uid());
create policy "Admins can view all donations" on public.charity_donations for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Jackpot Ledger (admin only)
create policy "Admins can manage jackpot" on public.jackpot_ledger for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ============================================================
-- PROFILE AUTO-CREATE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================================================
-- SEED CHARITIES
-- ============================================================
insert into public.charities (name, description, featured, website) values
('Golf Foundation', 'Supporting young people through golf, helping them develop life skills and opportunities.', true, 'https://golf-foundation.org'),
('Sport Relief', 'Raising money to help people facing incredibly tough circumstances in the UK and around the world.', false, 'https://sportrelief.com'),
('Prostate Cancer UK', 'Fighting prostate cancer through research, support, and awareness in the golf community.', true, 'https://prostatecanceruk.org'),
('Macmillan Cancer Support', 'Providing care and support for people living with cancer.', false, 'https://macmillan.org.uk'),
('Age UK', 'Helping older people love later life, fight loneliness and support independent living.', false, 'https://ageuk.org.uk');
