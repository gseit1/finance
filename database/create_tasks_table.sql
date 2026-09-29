-- ==============================================================================
-- TASKS & AGENDA TABLE MIGRATION FOR SUPABASE
-- Run this in your Supabase Dashboard SQL Editor (SQL Editor -> New Query -> Run)
-- ==============================================================================

-- 1. Create tasks table
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  due_date date not null default current_date,
  completed boolean default false,
  progress integer default 0 check (progress >= 0 and progress <= 100),
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  category text default 'Work',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create index for fast user and calendar queries
create index if not exists ifs_idx_tasks_user on public.tasks (user_id);
create index if not exists ifs_idx_tasks_due on public.tasks (user_id, due_date);

-- 3. Enable Row-Level Security (RLS)
alter table public.tasks enable row level security;

-- 4. Create RLS Policy ensuring users manage only their own tasks
drop policy if exists "Users can manage their tasks" on public.tasks;
create policy "Users can manage their tasks"
  on public.tasks for all using (auth.uid() = user_id);
