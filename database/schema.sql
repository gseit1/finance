-- ==============================================================================
-- PERSONAL FINANCE APP - SUPABASE POSTGRESQL SCHEMA
-- Complete schema with Row Level Security (RLS), Triggers, and Default Categories
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. USER PROFILES
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  currency text default 'USD',
  monthly_budget_start_day integer default 1 check (monthly_budget_start_day between 1 and 31),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ACCOUNTS / WALLETS (Cash, Bank, Credit Card, Savings)
create table if not exists public.accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text not null check (type in ('cash', 'bank', 'credit_card', 'savings', 'investment')),
  balance numeric(14, 2) not null default 0.00,
  currency text default 'USD',
  color text default '#4F46E5',
  icon text default 'wallet',
  is_archived boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. CATEGORIES (Income & Expense)
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text not null check (type in ('expense', 'income')),
  icon text default 'tag',
  color text default '#10B981',
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TRANSACTIONS
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  account_id uuid references public.accounts on delete cascade not null,
  category_id uuid references public.categories on delete set null,
  type text not null check (type in ('expense', 'income', 'transfer')),
  amount numeric(14, 2) not null check (amount > 0),
  description text,
  notes text,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  to_account_id uuid references public.accounts on delete set null, -- used for transfers
  is_recurring boolean default false,
  receipt_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. MONTHLY BUDGETS
create table if not exists public.budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories on delete cascade not null,
  month date not null, -- First day of month (e.g., 2026-10-01)
  amount numeric(14, 2) not null check (amount > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, category_id, month)
);

-- 7. RECURRING BILLS & SUBSCRIPTIONS
create table if not exists public.recurring_rules (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  account_id uuid references public.accounts on delete cascade not null,
  category_id uuid references public.categories on delete set null,
  description text not null,
  amount numeric(14, 2) not null check (amount > 0),
  type text not null check (type in ('expense', 'income')),
  frequency text not null check (frequency in ('daily', 'weekly', 'bi-weekly', 'monthly', 'yearly')),
  next_run_date date not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. FINANCIAL GOALS & TARGETS
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

-- ==============================================================================
-- INDEXES FOR FAST MOBILE QUERIES
-- ==============================================================================
create index ifs_idx_tx_user_date on public.transactions (user_id, date desc);
create index ifs_idx_tx_account on public.transactions (account_id);
create index ifs_idx_tx_category on public.transactions (category_id);
create index ifs_idx_accounts_user on public.accounts (user_id);
create index ifs_idx_categories_user on public.categories (user_id);
create index ifs_idx_budgets_user_month on public.budgets (user_id, month);
create index ifs_idx_goals_user on public.goals (user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures users can ONLY see, edit, and delete their own financial records.
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.recurring_rules enable row level security;
alter table public.goals enable row level security;

-- Goals Policies
create policy "Users can manage their goals"
  on public.goals for all using (auth.uid() = user_id);

-- Profiles Policies
create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Accounts Policies
create policy "Users can manage their accounts"
  on public.accounts for all using (auth.uid() = user_id);

-- Categories Policies
create policy "Users can manage their categories"
  on public.categories for all using (auth.uid() = user_id);

-- Transactions Policies
create policy "Users can manage their transactions"
  on public.transactions for all using (auth.uid() = user_id);

-- Budgets Policies
create policy "Users can manage their budgets"
  on public.budgets for all using (auth.uid() = user_id);

-- Recurring Rules Policies
create policy "Users can manage their recurring rules"
  on public.recurring_rules for all using (auth.uid() = user_id);

-- ==============================================================================
-- DATABASE TRIGGERS & FUNCTIONS
-- ==============================================================================

-- 1. Automatically update account balance on transaction changes
create or replace function public.handle_transaction_balance_change()
returns trigger as $$
begin
  -- IF INSERTING A NEW TRANSACTION
  if (TG_OP = 'INSERT') then
    if (new.type = 'expense') then
      update public.accounts set balance = balance - new.amount where id = new.account_id;
    elsif (new.type = 'income') then
      update public.accounts set balance = balance + new.amount where id = new.account_id;
    elsif (new.type = 'transfer') then
      update public.accounts set balance = balance - new.amount where id = new.account_id;
      if (new.to_account_id is not null) then
        update public.accounts set balance = balance + new.amount where id = new.to_account_id;
      end if;
    end if;

  -- IF DELETING A TRANSACTION (Revert balance)
  elsif (TG_OP = 'DELETE') then
    if (old.type = 'expense') then
      update public.accounts set balance = balance + old.amount where id = old.account_id;
    elsif (old.type = 'income') then
      update public.accounts set balance = balance - old.amount where id = old.account_id;
    elsif (old.type = 'transfer') then
      update public.accounts set balance = balance + old.amount where id = old.account_id;
      if (old.to_account_id is not null) then
        update public.accounts set balance = balance - old.amount where id = old.to_account_id;
      end if;
    end if;

  -- IF UPDATING A TRANSACTION
  elsif (TG_OP = 'UPDATE') then
    -- Revert old amount
    if (old.type = 'expense') then
      update public.accounts set balance = balance + old.amount where id = old.account_id;
    elsif (old.type = 'income') then
      update public.accounts set balance = balance - old.amount where id = old.account_id;
    elsif (old.type = 'transfer') then
      update public.accounts set balance = balance + old.amount where id = old.account_id;
      if (old.to_account_id is not null) then
        update public.accounts set balance = balance - old.amount where id = old.to_account_id;
      end if;
    end if;

    -- Apply new amount
    if (new.type = 'expense') then
      update public.accounts set balance = balance - new.amount where id = new.account_id;
    elsif (new.type = 'income') then
      update public.accounts set balance = balance + new.amount where id = new.account_id;
    elsif (new.type = 'transfer') then
      update public.accounts set balance = balance - new.amount where id = new.account_id;
      if (new.to_account_id is not null) then
        update public.accounts set balance = balance + new.amount where id = new.to_account_id;
      end if;
    end if;
  end if;

  return null;
end;
$$ language plpgsql security definer;

create or replace trigger tr_update_account_balance
after insert or update or delete on public.transactions
for each row execute function public.handle_transaction_balance_change();

-- 2. Seed default categories when a new user registers
create or replace function public.seed_new_user_categories()
returns trigger as $$
begin
  -- Create profile
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'User'));

  -- Default Accounts
  insert into public.accounts (user_id, name, type, balance, color, icon)
  values 
    (new.id, 'Cash', 'cash', 0.00, '#10B981', 'cash'),
    (new.id, 'Bank Account', 'bank', 0.00, '#3B82F6', 'bank');

  -- Default Expense Categories
  insert into public.categories (user_id, name, type, icon, color, is_default)
  values
    (new.id, 'Groceries & Food', 'expense', 'shopping-cart', '#EF4444', true),
    (new.id, 'Dining & Drinks', 'expense', 'coffee', '#F97316', true),
    (new.id, 'Housing & Rent', 'expense', 'home', '#8B5CF6', true),
    (new.id, 'Transportation', 'expense', 'car', '#06B6D4', true),
    (new.id, 'Utilities & Bills', 'expense', 'zap', '#EAB308', true),
    (new.id, 'Entertainment', 'expense', 'film', '#EC4899', true),
    (new.id, 'Health & Medical', 'expense', 'heart-pulse', '#14B8A6', true),
    (new.id, 'Shopping', 'expense', 'shopping-bag', '#6366F1', true);

  -- Default Income Categories
  insert into public.categories (user_id, name, type, icon, color, is_default)
  values
    (new.id, 'Salary', 'income', 'briefcase', '#10B981', true),
    (new.id, 'Investments', 'income', 'trending-up', '#3B82F6', true),
    (new.id, 'Side Hustle / Freelance', 'income', 'laptop', '#8B5CF6', true),
    (new.id, 'Other Income', 'income', 'plus-circle', '#64748B', true);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users registration
create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute function public.seed_new_user_categories();
