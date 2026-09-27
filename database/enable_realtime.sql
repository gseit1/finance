-- ==============================================================================
-- ENABLE SUPABASE REALTIME REPLICATION FOR INSTANT CROSS-DEVICE SYNC
-- Run this in your Supabase Dashboard SQL Editor (SQL Editor -> New Query -> Run)
-- ==============================================================================

-- Add tables to the supabase_realtime publication
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.accounts;
alter publication supabase_realtime add table public.budgets;
alter publication supabase_realtime add table public.categories;
alter publication supabase_realtime add table public.goals;
alter publication supabase_realtime add table public.recurring_rules;
