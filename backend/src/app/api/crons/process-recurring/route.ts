import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to advance the next run date based on rule frequency
function calculateNextDate(currentDateStr: string, frequency: string): string {
  const date = new Date(currentDateStr);
  switch (frequency) {
    case 'daily':
      date.setUTCDate(date.getUTCDate() + 1);
      break;
    case 'weekly':
      date.setUTCDate(date.getUTCDate() + 7);
      break;
    case 'bi-weekly':
      date.setUTCDate(date.getUTCDate() + 14);
      break;
    case 'monthly':
      date.setUTCMonth(date.getUTCMonth() + 1);
      break;
    case 'yearly':
      date.setUTCFullYear(date.getUTCFullYear() + 1);
      break;
    default:
      date.setUTCMonth(date.getUTCMonth() + 1);
  }
  return date.toISOString().split('T')[0];
}

export async function GET(request: NextRequest) {
  // Validate Vercel Cron header or Bearer secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    // 1. Fetch active recurring rules that are due on or before today
    const { data: dueRules, error: fetchError } = await supabaseAdmin
      .from('recurring_rules')
      .select('*')
      .eq('is_active', true)
      .lte('next_run_date', today);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!dueRules || dueRules.length === 0) {
      return NextResponse.json({ message: 'No recurring transactions due today', count: 0 });
    }

    const createdTransactions = [];

    // 2. Process each due rule
    for (const rule of dueRules) {
      // Advance to next schedule date FIRST to avoid race conditions with realtime subscribers
      const nextDate = calculateNextDate(rule.next_run_date, rule.frequency);
      const { error: updateError } = await supabaseAdmin
        .from('recurring_rules')
        .update({ next_run_date: nextDate })
        .eq('id', rule.id);

      if (updateError) {
        console.error(`Failed to advance next_run_date for rule ${rule.id}:`, updateError.message);
        continue;
      }

      // Insert the actual transaction
      const { data: newTx, error: txError } = await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: rule.user_id,
          account_id: rule.account_id,
          category_id: rule.category_id,
          type: rule.type,
          amount: rule.amount,
          description: `${rule.description} (Auto)`,
          is_recurring: true,
          date: new Date().toISOString(),
        })
        .select()
        .single();

      if (!txError && newTx) {
        createdTransactions.push(newTx);
      } else if (txError) {
        console.error(`Failed to insert transaction for rule ${rule.id}:`, txError.message);
      }
    }

    return NextResponse.json({
      message: 'Recurring transactions processed successfully',
      processedCount: createdTransactions.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error executing cron' }, { status: 500 });
  }
}
