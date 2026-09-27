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

    // Verify user identity
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const year = parseInt(searchParams.get('year') || `${new Date().getFullYear()}`, 10);
    const month = parseInt(searchParams.get('month') || `${new Date().getMonth() + 1}`, 10);

    const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString();
    const endDate = new Date(Date.UTC(year, month, 1)).toISOString();

    // Query transactions for the specified month
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('id, amount, type, date, category_id, categories(id, name, color, icon)')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lt('date', endDate);

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 500 });
    }

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals: Record<string, { id: string; name: string; color: string; icon: string; total: number }> = {};

    transactions?.forEach((tx: any) => {
      const amount = Number(tx.amount);
      if (tx.type === 'income') {
        totalIncome += amount;
      } else if (tx.type === 'expense') {
        totalExpense += amount;

        const category = tx.categories || { id: 'uncategorized', name: 'Uncategorized', color: '#94A3B8', icon: 'tag' };
        if (!categoryTotals[category.id]) {
          categoryTotals[category.id] = {
            id: category.id,
            name: category.name,
            color: category.color,
            icon: category.icon,
            total: 0,
          };
        }
        categoryTotals[category.id].total += amount;
      }
    });

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

    return NextResponse.json({
      period: { year, month, startDate, endDate },
      summary: {
        totalIncome,
        totalExpense,
        netSavings,
        savingsRate: Number(savingsRate),
        transactionCount: transactions?.length || 0,
      },
      categories: Object.values(categoryTotals).sort((a, b) => b.total - a.total),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
