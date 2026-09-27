import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper for CORS headers
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
    const { email, password } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Master key / password is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. If service role key is configured, check if user exists and auto-confirm if unconfirmed
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = userList?.users?.find(
          (u) => u.email?.toLowerCase() === cleanEmail
        );
        if (existingUser && !existingUser.email_confirmed_at) {
          // Auto-confirm the user!
          await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            email_confirm: true,
          });
        }
      } catch (adminErr) {
        console.warn('Auto-confirm attempt error:', adminErr);
      }
    }

    // 2. Perform sign in with password
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      let errorMsg = error.message;
      const lower = errorMsg.toLowerCase();

      if (lower.includes('invalid login credentials') || lower.includes('not confirmed')) {
        errorMsg = 'Invalid credentials or unconfirmed email. In Supabase: (1) Go to Authentication -> Users and click "... > Confirm User", or (2) Go to Authentication -> Providers -> Email and turn OFF "Confirm email".';
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMsg,
          raw_error: error.message,
        },
        { status: 401, headers: corsHeaders }
      );
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { success: false, error: 'Unable to authenticate credentials.' },
        { status: 401, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Authentication successful. Access granted.',
        user: {
          id: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          expires_in: data.session.expires_in,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('Sign in error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error during authentication.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
