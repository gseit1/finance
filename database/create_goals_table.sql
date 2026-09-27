-- ==============================================================================
-- FINANCIAL GOALS TABLE & POLICIES MIGRATION FOR SUPABASE
-- Run this in your Supabase Dashboard SQL Editor (SQL Editor -> New Query -> Run)
-- ==============================================================================

-- 1. Create goals table
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  target_amount numeric(14, 2) not null check (target_amount > 0),
  current_amount numeric(14, 2) not null default 0.00,
  target_date text,
  color text default '#6366F1',
  icon text default '🎯',
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create index for fast user lookup
create index if not exists ifs_idx_goals_user on public.goals (user_id);

-- 3. Enable Row-Level Security (RLS)
alter table public.goals enable row level security;

-- 4. Create RLS Policy ensuring users manage only their own goals
drop policy if exists "Users can manage their goals" on public.goals;
create policy "Users can manage their goals"
  on public.goals for all using (auth.uid() = user_id);
