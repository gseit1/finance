import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, full_name } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Master key / password must be at least 6 characters.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const displayName = full_name?.trim() || 'Vault Operator';

    // 1. If service role key is configured, use admin API to auto-confirm user and bypass email limits
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password,
          email_confirm: true,
          user_metadata: { full_name: displayName },
        });

        if (!adminError && adminData.user) {
          // Sign in to get full session tokens
          const { data: sessionData } = await supabaseAdmin.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          return NextResponse.json(
            {
              success: true,
              message: 'Vault initialized and confirmed.',
              user: adminData.user,
              session: sessionData?.session || null,
            },
            { status: 201, headers: corsHeaders }
          );
        }
      } catch (adminErr) {
        console.warn('Admin user creation fallback to standard signUp:', adminErr);
      }
    }

    // 2. Standard signUp
    const { data, error } = await supabaseAdmin.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: displayName },
      },
    });

    if (error) {
      const errorMsg = error.message.toLowerCase();

      // If user is already registered or rate-limited on confirmation email, try signing in directly
      if (errorMsg.includes('already') || errorMsg.includes('rate limit')) {
        const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!signInError && signInData?.user && signInData?.session) {
          return NextResponse.json(
            {
              success: true,
              message: 'Vault unlocked with existing credentials.',
              user: signInData.user,
              session: signInData.session,
            },
            { status: 200, headers: corsHeaders }
          );
        }
      }

      if (errorMsg.includes('rate limit')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Supabase email rate limit exceeded (max 3 emails/hour on free tier). In Supabase Dashboard: go to Authentication -> Providers -> Email and turn OFF "Confirm email" for instant unlimited signups.',
            rate_limited: true,
          },
          { status: 429, headers: corsHeaders }
        );
      }

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { success: false, error: 'User registration failed.' },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: data.session
          ? 'Vault initialized successfully.'
          : 'Vault initialized. Please verify your email if confirmation is enabled, or disable confirmation in Supabase dashboard.',
        user: {
          id: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata,
        },
        session: data.session
          ? {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_at: data.session.expires_at,
              expires_in: data.session.expires_in,
            }
          : null,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('Sign up error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error during registration.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
