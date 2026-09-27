export type TransactionType = 'expense' | 'income' | 'transfer';

export type AccountType = 'cash' | 'bank' | 'credit_card' | 'savings' | 'investment';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  icon: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  category_id?: string;
  type: TransactionType;
  amount: number;
  description: string;
  notes?: string;
  date: string;
  account_name?: string;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
}

export interface Budget {
  id: string;
  category_id: string;
  category_name: string;
  amount: number;
  spent: number;
  color: string;
}

export interface FinancialSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netSavings: number;
  savingsRate: number;
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  category_name?: string;
  color: string;
  icon: string;
  is_completed?: boolean;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';

export interface RecurringRule {
  id: string;
  user_id?: string;
  account_id: string;
  category_id?: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  frequency: RecurringFrequency;
  next_run_date: string;
  is_active: boolean;
  account_name?: string;
  category_name?: string;
  category_color?: string;
}

