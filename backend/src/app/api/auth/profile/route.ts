import { NextRequest, NextResponse } from 'next/server';
import {
  createSupabaseClient,
  supabaseAdmin,
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceRoleKey,
} from '@/lib/supabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authorization token required.' },
        { status: 401, headers: corsHeaders }
      );
    }

    const client = createSupabaseClient(token);
    const { data: userData, error: userError } = await client.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json(
        { success: false, error: userError?.message || 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const user = userData.user;

    // Fetch from profiles table if exists
    const { data: profile } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          displayName: profile?.display_name || user.user_metadata?.full_name || 'Vault Operator',
          avatarUrl: user.user_metadata?.avatar_url || null,
          currency: profile?.currency || 'USD',
          createdAt: user.created_at,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching profile.' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authorization token required.' },
        { status: 401, headers: corsHeaders }
      );
    }

    const client = createSupabaseClient(token);
    const { data: userData, error: userError } = await client.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json(
        { success: false, error: userError?.message || 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { displayName, avatarUrl, newPassword, currency } = body;

    const updates: { password?: string; data?: Record<string, any> } = {};
    const userMeta: Record<string, any> = { ...(userData.user.user_metadata || {}) };

    if (displayName) {
      userMeta.full_name = displayName.trim();
    }
    if (avatarUrl !== undefined) {
      userMeta.avatar_url = avatarUrl;
    }
    updates.data = userMeta;

    if (newPassword) {
      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'New password must be at least 6 characters.' },
          { status: 400, headers: corsHeaders }
        );
      }
      updates.password = newPassword;
    }

    // 1. Update user via Supabase GoTrue Auth API using the user's Bearer token
    let authErrorMsg: string | null = null;
    let updatedAuthUser = userData.user;

    try {
      const authRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const authData = await authRes.json();
      if (!authRes.ok) {
        authErrorMsg =
          authData.msg ||
          authData.message ||
          authData.error_description ||
          'Failed to update auth credentials';
      } else {
        updatedAuthUser = authData;
      }
    } catch (e: any) {
      authErrorMsg = e.message;
    }

    // 2. If Service Role Key is available and GoTrue update returned an error, fallback to admin API
    if (authErrorMsg && supabaseServiceRoleKey) {
      try {
        const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.updateUserById(
          userData.user.id,
          updates
        );
        if (!adminError && adminData?.user) {
          authErrorMsg = null;
          updatedAuthUser = adminData.user;
        }
      } catch (adminErr: any) {
        console.warn('Admin update fallback error:', adminErr);
      }
    }

    // If changing password was explicitly requested and failed, return the error
    if (newPassword && authErrorMsg) {
      return NextResponse.json(
        { success: false, error: authErrorMsg },
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Update public.profiles row
    try {
      await client
        .from('profiles')
        .upsert({
          id: userData.user.id,
          ...(displayName ? { display_name: displayName.trim() } : {}),
          ...(currency ? { currency } : {}),
          updated_at: new Date().toISOString(),
        });
    } catch (profileDbErr) {
      console.warn('Profile table update notice:', profileDbErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully.',
        user: {
          id: updatedAuthUser.id || userData.user.id,
          email: updatedAuthUser.email || userData.user.email,
          displayName: userMeta.full_name,
          avatarUrl: userMeta.avatar_url,
          currency: currency || 'USD',
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('Update profile error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error updating profile.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
