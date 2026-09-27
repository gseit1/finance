import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createSupabaseClient(token);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('date, type, amount, description, notes, accounts(name), categories(name)')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 500 });
    }

    // Build CSV string
    const headers = ['Date', 'Type', 'Amount', 'Account', 'Category', 'Description', 'Notes'];
    const rows = (transactions || []).map((t: any) => [
      new Date(t.date).toISOString().split('T')[0],
      t.type,
      t.amount,
      `"${(t.accounts?.name || '').replace(/"/g, '""')}"`,
      `"${(t.categories?.name || 'Uncategorized').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Export failed' }, { status: 500 });
  }
}
