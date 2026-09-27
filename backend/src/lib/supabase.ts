import { createClient } from '@supabase/supabase-js';

const SUPABASE_DEFAULT_URL = 'https://ebigsqxaicegwcllusrz.supabase.co';
const SUPABASE_DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViaWdzcXhhaWNlZ3djbGx1c3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MTk3MDYsImV4cCI6MjEwNjA5NTcwNn0.L_ImmmF1BJsoJX0zXKxyd_b-gNPcXrvorVzPI3L3Yng';

export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  SUPABASE_DEFAULT_URL;

export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  SUPABASE_DEFAULT_ANON_KEY;

export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Standard client for authenticated user requests (respects RLS)
export const createSupabaseClient = (authToken?: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    },
  });
};

// Admin client with service role key (or fallback to anon key)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
