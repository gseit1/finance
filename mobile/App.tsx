import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { TasksScreen } from './src/screens/TasksScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { AccountsScreen } from './src/screens/AccountsScreen';
import { TransactionsScreen } from './src/screens/TransactionsScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { GoalsScreen } from './src/screens/GoalsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { BottomIslandNav, NavTab } from './src/components/BottomIslandNav';
import { SideDrawerNav } from './src/components/SideDrawerNav';
import { AddAccountModal } from './src/components/AddAccountModal';
import { AddTransactionModal } from './src/components/AddTransactionModal';
import { AddTaskModal } from './src/components/AddTaskModal';
import {
  Transaction,
  Account,
  Category,
  Budget,
  Goal,
  RecurringRule,
  TransactionType,
  Task,
} from './src/types';
import { colors } from './src/theme/colors';
import { isSupabaseConfigured, supabase } from './src/services/supabase';
import { authService } from './src/services/authService';
import { taskService } from './src/services/taskService';

// Default clean user data
const defaultAccounts: Account[] = [
  { id: 'acc-1', name: 'Main Checking', type: 'bank', balance: 0.00, currency: 'EUR', color: '#3B82F6', icon: 'bank' },
];

const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Groceries', type: 'expense', icon: 'shopping-cart', color: '#EF4444' },
  { id: 'cat-2', name: 'Dining Out', type: 'expense', icon: 'coffee', color: '#F97316' },
  { id: 'cat-3', name: 'Housing & Rent', type: 'expense', icon: 'home', color: '#8B5CF6' },
  { id: 'cat-4', name: 'Transportation', type: 'expense', icon: 'car', color: '#06B6D4' },
  { id: 'cat-5', name: 'Entertainment', type: 'expense', icon: 'film', color: '#EC4899' },
  { id: 'cat-6', name: 'Utilities & Bills', type: 'expense', icon: 'zap', color: '#EAB308' },
  { id: 'cat-7', name: 'Salary', type: 'income', icon: 'briefcase', color: '#10B981' },
  { id: 'cat-8', name: 'Investments', type: 'income', icon: 'trending-up', color: '#3B82F6' },
];

const defaultBudgets: Budget[] = [];
const defaultTransactions: Transaction[] = [];
const defaultGoals: Goal[] = [];

type AppFlow = 'welcome' | 'auth' | 'app';

function App(): React.JSX.Element {
  const [flow, setFlow] = useState<AppFlow>('welcome');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  const [accounts, setAccounts] = useState<Account[]>(defaultAccounts);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [budgets, setBudgets] = useState<Budget[]>(defaultBudgets);
  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions);
  const [goals, setGoals] = useState<Goal[]>(defaultGoals);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [addAccountModalVisible, setAddAccountModalVisible] = useState<boolean>(false);
  const [isGlobalTxModalOpen, setIsGlobalTxModalOpen] = useState<boolean>(false);
  const [isGlobalTaskModalOpen, setIsGlobalTaskModalOpen] = useState<boolean>(false);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);

  const supabaseActive = isSupabaseConfigured();

  const isUUID = (str?: string): boolean => {
    return Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));
  };

  // Unified data synchronization with Supabase PostgreSQL
  const syncUserData = async (userId: string) => {
    if (!supabaseActive || !userId) return;

    try {
      await authService.ensureSupabaseSession();

      // 1. Fetch Categories (Ensuring real Supabase UUIDs)
      let liveCategories: Category[] = [];
      const { data: dbCats, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (dbCats && dbCats.length > 0) {
        liveCategories = dbCats.map((c: any) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          icon: c.icon || 'tag',
          color: c.color || (c.type === 'income' ? '#10B981' : '#EF4444'),
        }));
        setCategories(liveCategories);
      } else {
        // Fallback: seed default categories directly into Supabase with user_id
        const seedCategories = [
          { user_id: userId, name: 'Groceries & Food', type: 'expense', icon: 'shopping-cart', color: '#EF4444' },
          { user_id: userId, name: 'Dining & Drinks', type: 'expense', icon: 'coffee', color: '#F97316' },
          { user_id: userId, name: 'Housing & Rent', type: 'expense', icon: 'home', color: '#8B5CF6' },
          { user_id: userId, name: 'Transportation', type: 'expense', icon: 'car', color: '#06B6D4' },
          { user_id: userId, name: 'Utilities & Bills', type: 'expense', icon: 'zap', color: '#EAB308' },
          { user_id: userId, name: 'Entertainment', type: 'expense', icon: 'film', color: '#EC4899' },
          { user_id: userId, name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#6366F1' },
          { user_id: userId, name: 'Salary', type: 'income', icon: 'briefcase', color: '#10B981' },
          { user_id: userId, name: 'Investments', type: 'income', icon: 'trending-up', color: '#3B82F6' },
        ];
        const { data: insertedCats } = await supabase.from('categories').insert(seedCategories).select();
        if (insertedCats && insertedCats.length > 0) {
          liveCategories = insertedCats.map((c: any) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            icon: c.icon || 'tag',
            color: c.color,
          }));
          setCategories(liveCategories);
        }
      }

      // 2. Fetch Accounts (Ensuring real Supabase UUIDs)
      let liveAccounts: Account[] = [];
      const { data: dbAccs, error: accErr } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at');

      if (dbAccs && dbAccs.length > 0) {
        liveAccounts = dbAccs.map((a: any) => ({
          id: a.id,
          name: a.name,
          type: a.type || 'bank',
          balance: Number(a.balance) || 0,
          currency: a.currency || 'EUR',
          color: a.color || '#3B82F6',
          icon: a.icon || 'bank',
        }));
        setAccounts(liveAccounts);
      } else {
        // Fallback: seed default bank account directly into Supabase with user_id
        const { data: insertedAccs } = await supabase
          .from('accounts')
          .insert([
            { user_id: userId, name: 'Cash', type: 'cash', balance: 0.0, color: '#10B981', icon: 'cash', currency: 'EUR' },
            { user_id: userId, name: 'Bank Account', type: 'bank', balance: 0.0, color: '#3B82F6', icon: 'bank', currency: 'EUR' },
          ])
          .select();
        if (insertedAccs && insertedAccs.length > 0) {
          liveAccounts = insertedAccs.map((a: any) => ({
            id: a.id,
            name: a.name,
            type: a.type,
            balance: Number(a.balance) || 0,
            currency: 'EUR',
            color: a.color,
            icon: a.icon,
          }));
          setAccounts(liveAccounts);
        }
      }

      // 3. Fetch Transactions from Supabase
      const { data: dbTxs } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      const mappedTxs: Transaction[] = (dbTxs || []).map((t: any) => {
        const cat = liveCategories.find((c) => c.id === t.category_id);
        const acc = liveAccounts.find((a) => a.id === t.account_id);
        return {
          id: t.id,
          account_id: t.account_id,
          category_id: t.category_id,
          type: t.type,
          amount: Number(t.amount),
          description: t.description || '',
          notes: t.notes,
          date: t.date,
          account_name: acc?.name || 'Account',
          category_name: cat?.name || 'General',
          category_color: cat?.color || colors.primary,
        };
      });
      setTransactions(mappedTxs);

      // 4. Fetch Budgets from Supabase
      const { data: dbBudgets } = await supabase.from('budgets').select('*');
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const mappedBudgets: Budget[] = (dbBudgets || []).map((b: any) => {
        const cat = liveCategories.find((c) => c.id === b.category_id);
        const spent = mappedTxs
          .filter((t) => {
            if (t.type !== 'expense' || t.category_id !== b.category_id) return false;
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          id: b.id,
          category_id: b.category_id,
          category_name: cat?.name || 'General',
          amount: Number(b.amount),
          spent,
          color: cat?.color || colors.primary,
        };
      });
      setBudgets(mappedBudgets);

      // 5. Fetch Goals (With multi-tier database & metadata persistence)
      try {
        let loadedGoals: Goal[] | null = null;
        const { data: dbGoals, error: goalsErr } = await supabase.from('goals').select('*');
        if (!goalsErr && dbGoals && dbGoals.length > 0) {
          loadedGoals = dbGoals.map((g: any) => ({
            id: g.id,
            name: g.name,
            target_amount: Number(g.target_amount),
            current_amount: Number(g.current_amount),
            target_date: g.target_date,
            color: g.color || '#6366F1',
            icon: g.icon || '🎯',
            is_completed: g.is_completed || false,
          }));
        }

        // Tier 2: Check database user_metadata if table doesn't exist
        if (!loadedGoals) {
          const { data: userData } = await supabase.auth.getUser();
          const metaGoals = userData?.user?.user_metadata?.user_goals;
          if (Array.isArray(metaGoals) && metaGoals.length > 0) {
            loadedGoals = metaGoals;
          }
        }

        // Tier 3: Local cached goals
        if (!loadedGoals) {
          const cachedGoals = await AsyncStorage.getItem(`@finance_goals_${userId}`);
          if (cachedGoals) loadedGoals = JSON.parse(cachedGoals);
        }

        if (loadedGoals) {
          setGoals(loadedGoals);
        }
      } catch (goalsCatchErr) {
        console.warn('Goals fetch notice:', goalsCatchErr);
        const cachedGoals = await AsyncStorage.getItem(`@finance_goals_${userId}`);
        if (cachedGoals) setGoals(JSON.parse(cachedGoals));
      }

      // 6. Fetch Recurring Rules from Supabase
      try {
        const { data: dbRules, error: rulesErr } = await supabase
          .from('recurring_rules')
          .select('*')
          .order('next_run_date', { ascending: true });

        if (!rulesErr && dbRules && dbRules.length > 0) {
          const mappedRules: RecurringRule[] = dbRules.map((r: any) => ({
            id: r.id,
            user_id: r.user_id,
            account_id: r.account_id,
            category_id: r.category_id,
            description: r.description,
            amount: Number(r.amount),
            type: r.type,
            frequency: r.frequency,
            next_run_date: r.next_run_date,
            is_active: r.is_active,
          }));
          setRecurringRules(mappedRules);
        } else {
          setRecurringRules([]);
        }
      } catch (rulesCatchErr) {
        console.warn('Recurring rules fetch notice:', rulesCatchErr);
      }

      // 7. Fetch Tasks from taskService
      try {
        const liveTasks = await taskService.getTasks(userId);
        setTasks(liveTasks);
      } catch (tasksCatchErr) {
        console.warn('Tasks fetch notice:', tasksCatchErr);
      }
    } catch (err) {
      console.warn('Sync user data failed:', err);
    }
  };

  // Restore authenticated session on cold app launch
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        if (supabaseActive) {
          // 1. Check existing Supabase session
          const { data, error } = await supabase.auth.getSession();
          if (!error && data?.session?.user) {
            if (isMounted) {
              setCurrentUser(data.session.user);
              setFlow('app');
              setIsAuthChecking(false);
            }
            await syncUserData(data.session.user.id);
            return;
          }

          // 2. Ensure session restored from stored auth tokens
          const sessionRestored = await authService.ensureSupabaseSession();
          if (sessionRestored) {
            const { data: restoredData } = await supabase.auth.getSession();
            if (restoredData?.session?.user) {
              if (isMounted) {
                setCurrentUser(restoredData.session.user);
                setFlow('app');
                setIsAuthChecking(false);
              }
              await syncUserData(restoredData.session.user.id);
              return;
            }
          }
        }

        // 3. Fallback to cached user object
        const cachedUser = await authService.getCurrentUser();
        if (cachedUser && isMounted) {
          setCurrentUser(cachedUser);
          setFlow('app');
          if (supabaseActive) {
            await authService.ensureSupabaseSession();
          }
          await syncUserData(cachedUser.id);
        }
      } catch (err) {
        console.warn('Session restoration failed:', err);
      } finally {
        if (isMounted) {
          setIsAuthChecking(false);
        }
      }
    };

    restoreSession();

    if (supabaseActive) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          if (isMounted) {
            setCurrentUser(session.user);
            setFlow('app');
          }
          await syncUserData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setCurrentUser(null);
            setFlow('welcome');
          }
        }
      });

      return () => {
        isMounted = false;
        authListener?.subscription?.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Multi-device real-time sync: listens to Supabase PostgreSQL changes & app foreground events
  useEffect(() => {
    if (!currentUser?.id) return;

    // 1. Sync immediately whenever the app is brought to the foreground / unlocked
    const appStateSub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active' && currentUser?.id) {
        syncUserData(currentUser.id);
      }
    });

    // 2. Real-time WebSocket channel for instant cross-device updates
    let realtimeChannel: any = null;
    if (supabaseActive && currentUser?.id) {
      realtimeChannel = supabase
        .channel(`multi-device-sync-${currentUser.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'transactions' },
          () => {
            syncUserData(currentUser.id);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'budgets' },
          () => {
            syncUserData(currentUser.id);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'accounts' },
          () => {
            syncUserData(currentUser.id);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'goals' },
          () => {
            syncUserData(currentUser.id);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'recurring_rules' },
          () => {
            syncUserData(currentUser.id);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasks' },
          () => {
            syncUserData(currentUser.id);
          }
        )
        .subscribe();
    }

    return () => {
      appStateSub.remove();
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [currentUser?.id, supabaseActive]);

  // Initial load of tasks
  useEffect(() => {
    taskService.getTasks(currentUser?.id).then((t) => setTasks(t)).catch(() => {});
  }, [currentUser?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (currentUser?.id) {
      await syncUserData(currentUser.id);
    } else {
      const liveTasks = await taskService.getTasks();
      setTasks(liveTasks);
    }
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleSaveTransaction = async (newTx: {
    type: TransactionType;
    amount: number;
    description: string;
    categoryId: string;
    accountId: string;
    date?: string;
  }) => {
    await authService.ensureSupabaseSession();

    // 1. Resolve Account with valid UUID
    let account = accounts.find((a) => a.id === newTx.accountId);
    if (!account || !isUUID(account.id)) {
      account = accounts.find((a) => isUUID(a.id));
    }

    // If no valid UUID account in state, fetch or create one in Supabase
    if (supabaseActive && currentUser?.id && (!account || !isUUID(account?.id))) {
      try {
        const { data: dbAccs } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', currentUser.id)
          .limit(1);

        if (dbAccs && dbAccs.length > 0) {
          account = {
            id: dbAccs[0].id,
            name: dbAccs[0].name,
            type: dbAccs[0].type || 'bank',
            balance: Number(dbAccs[0].balance) || 0,
            currency: dbAccs[0].currency || 'USD',
            color: dbAccs[0].color || '#3B82F6',
            icon: dbAccs[0].icon || 'bank',
          };
        } else {
          const { data: newAcc } = await supabase
            .from('accounts')
            .insert({
              user_id: currentUser.id,
              name: 'Cash',
              type: 'cash',
              balance: 0.0,
              currency: 'USD',
              color: '#10B981',
              icon: 'cash',
            })
            .select()
            .single();

          if (newAcc) {
            account = {
              id: newAcc.id,
              name: newAcc.name,
              type: newAcc.type,
              balance: Number(newAcc.balance) || 0,
              currency: 'USD',
              color: newAcc.color,
              icon: newAcc.icon,
            };
          }
        }
        if (account) {
          setAccounts((prev) => [account!, ...prev.filter((a) => isUUID(a.id))]);
        }
      } catch (err) {
        console.warn('Failed to resolve account in Supabase:', err);
      }
    }

    // 2. Resolve Category with valid UUID
    let category = categories.find((c) => c.id === newTx.categoryId);
    let resolvedCategoryId: string | null = null;
    if (category && isUUID(category.id)) {
      resolvedCategoryId = category.id;
    } else {
      const matchCat = categories.find((c) => c.type === newTx.type && isUUID(c.id));
      if (matchCat) {
        category = matchCat;
        resolvedCategoryId = matchCat.id;
      }
    }

    const tempId = `tx-${Date.now()}`;
    const txDate = newTx.date || new Date().toISOString();

    const localTransaction: Transaction = {
      id: tempId,
      account_id: account?.id || '',
      category_id: resolvedCategoryId || '',
      type: newTx.type,
      amount: newTx.amount,
      description: newTx.description,
      date: txDate,
      account_name: account?.name || 'Account',
      category_name: category?.name || 'General',
      category_color: category?.color || colors.primary,
    };

    setTransactions((prev) => [localTransaction, ...prev]);

    // Update Account balance locally
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === account?.id) {
          const delta = newTx.type === 'income' ? newTx.amount : -newTx.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      })
    );

    // Update Budget spent amount if expense
    if (newTx.type === 'expense' && resolvedCategoryId) {
      setBudgets((prev) =>
        prev.map((b) => {
          if (b.category_id === resolvedCategoryId) {
            return { ...b, spent: b.spent + newTx.amount };
          }
          return b;
        })
      );
    }

    // Persist directly to Supabase with real UUIDs
    if (supabaseActive && currentUser?.id && account?.id && isUUID(account.id)) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            user_id: currentUser.id,
            account_id: account.id,
            category_id: resolvedCategoryId,
            type: newTx.type,
            amount: newTx.amount,
            description: newTx.description,
            date: txDate,
          })
          .select()
          .single();

        if (error) {
          console.error('Supabase transaction insert error:', error.message, error.details);
        } else if (data) {
          // Replace tempId with server-assigned UUID
          setTransactions((prev) =>
            prev.map((t) => (t.id === tempId ? { ...t, id: data.id } : t))
          );
        }
      } catch (e) {
        console.error('Supabase transaction network notice:', e);
      }
    }
  };

  const handleSaveBudget = async (b: { categoryId: string; amount: number }) => {
    await authService.ensureSupabaseSession();

    let resolvedCategoryId = b.categoryId;
    let category = categories.find((c) => c.id === b.categoryId);

    // If categoryId is not a UUID (e.g. 'cat-1'), resolve to real Supabase UUID
    if (!isUUID(resolvedCategoryId)) {
      const match =
        categories.find((c) => isUUID(c.id) && c.name.toLowerCase() === category?.name.toLowerCase()) ||
        categories.find((c) => isUUID(c.id) && c.type === 'expense');
      if (match) {
        resolvedCategoryId = match.id;
        category = match;
      }
    }

    if (supabaseActive && currentUser?.id && !isUUID(resolvedCategoryId)) {
      try {
        const { data: dbCats } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('type', 'expense')
          .limit(1);

        if (dbCats && dbCats.length > 0) {
          resolvedCategoryId = dbCats[0].id;
          category = {
            id: dbCats[0].id,
            name: dbCats[0].name,
            type: dbCats[0].type,
            icon: dbCats[0].icon || 'tag',
            color: dbCats[0].color || colors.primary,
          };
        }
      } catch (err) {
        console.warn('Failed to query categories for budget:', err);
      }
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const spent = transactions
      .filter((t) => {
        if (t.type !== 'expense' || t.category_id !== resolvedCategoryId) return false;
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const tempId = `b-${Date.now()}`;
    setBudgets((prev) => {
      const idx = prev.findIndex((item) => item.category_id === resolvedCategoryId);
      const budgetItem: Budget = {
        id: idx >= 0 ? prev[idx].id : tempId,
        category_id: resolvedCategoryId,
        category_name: category?.name || 'General',
        amount: b.amount,
        spent: spent,
        color: category?.color || colors.primary,
      };

      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = budgetItem;
        return updated;
      }
      return [...prev, budgetItem];
    });

    if (supabaseActive && currentUser?.id && isUUID(resolvedCategoryId)) {
      const firstOfMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
      try {
        const { data, error } = await supabase
          .from('budgets')
          .upsert(
            {
              user_id: currentUser.id,
              category_id: resolvedCategoryId,
              month: firstOfMonth,
              amount: b.amount,
            },
            { onConflict: 'user_id, category_id, month' }
          )
          .select()
          .single();

        if (error) {
          console.error('Supabase budget upsert error:', error.message);
        } else if (data) {
          setBudgets((prev) =>
            prev.map((item) => (item.id === tempId ? { ...item, id: data.id } : item))
          );
        }
      } catch (e) {
        console.error('Supabase budget network notice:', e);
      }
    }
  };

  const handleDeleteBudget = async (categoryId: string) => {
    setBudgets((prev) => prev.filter((b) => b.category_id !== categoryId));
    if (supabaseActive && currentUser?.id && isUUID(categoryId)) {
      try {
        await supabase
          .from('budgets')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('category_id', categoryId);
      } catch (e) {
        console.error('Supabase budget delete notice:', e);
      }
    }
  };

  const handleAddGoal = async (newGoal: Omit<Goal, 'id'>) => {
    await authService.ensureSupabaseSession();

    const tempId = `goal-${Date.now()}`;
    const localGoal: Goal = {
      ...newGoal,
      id: tempId,
      is_completed: (newGoal.current_amount || 0) >= newGoal.target_amount,
    };

    let updatedGoalsList = [localGoal, ...goals];
    setGoals(updatedGoalsList);

    if (currentUser?.id) {
      AsyncStorage.setItem(`@finance_goals_${currentUser.id}`, JSON.stringify(updatedGoalsList));
    }

    if (supabaseActive && currentUser?.id) {
      // 1. Try PostgreSQL public.goals table
      try {
        const { data, error } = await supabase
          .from('goals')
          .insert({
            user_id: currentUser.id,
            name: newGoal.name,
            target_amount: newGoal.target_amount,
            current_amount: newGoal.current_amount || 0,
            target_date: newGoal.target_date || null,
            color: newGoal.color || '#6366F1',
            icon: newGoal.icon || '🎯',
            is_completed: (newGoal.current_amount || 0) >= newGoal.target_amount,
          })
          .select()
          .single();

        if (!error && data) {
          updatedGoalsList = updatedGoalsList.map((g) => (g.id === tempId ? { ...g, id: data.id } : g));
          setGoals(updatedGoalsList);
          AsyncStorage.setItem(`@finance_goals_${currentUser.id}`, JSON.stringify(updatedGoalsList));
        }
      } catch (e) {
        console.warn('Goals Supabase table notice:', e);
      }

      // 2. Also persist to database user_metadata as reliable fallback
      try {
        await supabase.auth.updateUser({
          data: {
            user_goals: updatedGoalsList,
          },
        });
      } catch (metaErr) {
        console.warn('Goals metadata update notice:', metaErr);
      }
    }
  };

  const handleAddFundsToGoal = async (goalId: string, amount: number) => {
    await authService.ensureSupabaseSession();

    let updatedGoal: Goal | undefined;
    const updatedGoalsList = goals.map((g) => {
      if (g.id === goalId) {
        const updatedAmount = g.current_amount + amount;
        const completed = updatedAmount >= g.target_amount;
        updatedGoal = { ...g, current_amount: updatedAmount, is_completed: completed };
        return updatedGoal;
      }
      return g;
    });

    setGoals(updatedGoalsList);
    if (currentUser?.id) {
      AsyncStorage.setItem(`@finance_goals_${currentUser.id}`, JSON.stringify(updatedGoalsList));
    }

    // Record as an expense transaction for account outflow
    const primaryAccount = accounts.find((a) => isUUID(a.id)) || accounts[0];
    const expenseCat = categories.find((c) => c.type === 'expense' && isUUID(c.id)) || categories[0];
    if (primaryAccount) {
      handleSaveTransaction({
        type: 'expense',
        amount: amount,
        description: `Savings goal: ${updatedGoal?.name || 'Vault'}`,
        categoryId: expenseCat?.id || '',
        accountId: primaryAccount.id,
      });
    }

    if (supabaseActive && currentUser?.id) {
      // 1. Try public.goals table update if it's a real UUID
      if (isUUID(goalId)) {
        try {
          await supabase
            .from('goals')
            .update({
              current_amount: updatedGoal?.current_amount || 0,
              is_completed: updatedGoal?.is_completed || false,
            })
            .eq('id', goalId)
            .eq('user_id', currentUser.id);
        } catch (e) {
          console.warn('Goals Supabase table update notice:', e);
        }
      }

      // 2. Persist to database user_metadata
      try {
        await supabase.auth.updateUser({
          data: {
            user_goals: updatedGoalsList,
          },
        });
      } catch (metaErr) {
        console.warn('Goals metadata update notice:', metaErr);
      }
    }
  };

  const handleAddAccount = async (newAcc: Omit<Account, 'id'>) => {
    await authService.ensureSupabaseSession();
    const tempId = `acc-${Date.now()}`;
    const localAcc: Account = {
      ...newAcc,
      id: tempId,
    };
    setAccounts((prev) => [...prev, localAcc]);

    if (supabaseActive && currentUser?.id) {
      try {
        const { data, error } = await supabase
          .from('accounts')
          .insert({
            user_id: currentUser.id,
            name: newAcc.name,
            type: newAcc.type,
            balance: newAcc.balance || 0,
            currency: newAcc.currency || 'EUR',
            color: newAcc.color || '#3B82F6',
            icon: newAcc.icon || 'bank',
          })
          .select()
          .single();

        if (!error && data) {
          setAccounts((prev) =>
            prev.map((a) => (a.id === tempId ? { ...a, id: data.id } : a))
          );
        } else if (error) {
          console.error('Supabase account insert error:', error.message);
        }
      } catch (err) {
        console.warn('Add account network error:', err);
      }
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    if (supabaseActive && currentUser?.id && isUUID(accountId)) {
      try {
        await supabase
          .from('accounts')
          .delete()
          .eq('id', accountId)
          .eq('user_id', currentUser.id);
      } catch (err) {
        console.warn('Delete account error:', err);
      }
    }
  };

  const handleAddRecurringRule = async (newRule: Omit<RecurringRule, 'id'>) => {
    await authService.ensureSupabaseSession();
    const tempId = `rec-${Date.now()}`;
    const localRule: RecurringRule = {
      ...newRule,
      id: tempId,
    };
    setRecurringRules((prev) => [...prev, localRule]);

    if (supabaseActive && currentUser?.id) {
      try {
        const accId = isUUID(newRule.account_id) ? newRule.account_id : null;
        const catId = isUUID(newRule.category_id) ? newRule.category_id : null;

        const { data, error } = await supabase
          .from('recurring_rules')
          .insert({
            user_id: currentUser.id,
            account_id: accId,
            category_id: catId,
            description: newRule.description,
            amount: newRule.amount,
            type: newRule.type,
            frequency: newRule.frequency,
            next_run_date: newRule.next_run_date,
            is_active: newRule.is_active,
          })
          .select()
          .single();

        if (!error && data) {
          setRecurringRules((prev) =>
            prev.map((r) => (r.id === tempId ? { ...r, id: data.id } : r))
          );
        } else if (error) {
          console.error('Supabase recurring rule insert error:', error.message);
        }
      } catch (err) {
        console.warn('Add recurring rule network error:', err);
      }
    }
  };

  const handleToggleRecurringRule = async (ruleId: string, isActive: boolean) => {
    setRecurringRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, is_active: isActive } : r))
    );

    if (supabaseActive && currentUser?.id && isUUID(ruleId)) {
      try {
        await supabase
          .from('recurring_rules')
          .update({ is_active: isActive })
          .eq('id', ruleId)
          .eq('user_id', currentUser.id);
      } catch (err) {
        console.warn('Toggle recurring rule error:', err);
      }
    }
  };

  const handleDeleteRecurringRule = async (ruleId: string) => {
    setRecurringRules((prev) => prev.filter((r) => r.id !== ruleId));

    if (supabaseActive && currentUser?.id && isUUID(ruleId)) {
      try {
        await supabase
          .from('recurring_rules')
          .delete()
          .eq('id', ruleId)
          .eq('user_id', currentUser.id);
      } catch (err) {
        console.warn('Delete recurring rule error:', err);
      }
    }
  };

  const handleAddTask = async (newTaskData: Omit<Task, 'id'>) => {
    try {
      const created = await taskService.createTask(currentUser?.id, newTaskData);
      setTasks((prev) => [created, ...prev]);
    } catch (err) {
      console.warn('Add task error:', err);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const updated = await taskService.toggleTask(currentUser?.id, taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      console.warn('Toggle task error:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(currentUser?.id, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.warn('Delete task error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (e) {
      // fallback
    }
    setCurrentUser(null);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setRecurringRules([]);
    setTasks([]);
    setAccounts([
      { id: 'acc-1', name: 'Main Checking', type: 'bank', balance: 0.00, currency: 'EUR', color: '#3B82F6', icon: 'bank' },
    ]);
    setCurrentTab('home');
    setFlow('welcome');
  };

  const userDisplayName =
    currentUser?.user_metadata?.full_name ||
    currentUser?.user_metadata?.name ||
    (currentUser?.email ? currentUser.email.split('@')[0] : 'Hitesh Tapaniya');

  const userAvatarUrl = currentUser?.user_metadata?.avatar_url || null;

  if (isAuthChecking) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.appContainer}>
        {/* Flow 1: Welcome Onboarding Screen */}
        {flow === 'welcome' && (
          <WelcomeScreen
            onGetStarted={() => {
              setAuthMode('signup');
              setFlow('auth');
            }}
            onSignIn={() => {
              setAuthMode('signin');
              setFlow('auth');
            }}
          />
        )}

        {/* Flow 2: Unified Auth (Sign In / Register) Screen */}
        {flow === 'auth' && (
          <AuthScreen
            initialMode={authMode}
            onAuthenticated={async () => {
              if (supabaseActive) {
                await authService.ensureSupabaseSession();
              }
              const user = await authService.getCurrentUser();
              if (user) {
                setCurrentUser(user);
                await syncUserData(user.id);
              }
              setFlow('app');
            }}
            onBackToWelcome={() => setFlow('welcome')}
          />
        )}

        {/* Flow 3: Main Financial Ledger Application */}
        {flow === 'app' && (
          <View style={styles.screenWrapper}>
            {currentTab === 'home' && (
              <HomeScreen
                accounts={accounts}
                categories={categories}
                budgets={budgets}
                transactions={transactions}
                recurringRules={recurringRules}
                tasks={tasks}
                goals={goals}
                onAddTransaction={handleSaveTransaction}
                onSaveBudget={handleSaveBudget}
                onDeleteBudget={handleDeleteBudget}
                onOpenAccounts={() => setCurrentTab('accounts')}
                onOpenCalendar={() => setCurrentTab('calendar')}
                onOpenTasks={() => setCurrentTab('tasks')}
                onOpenExpenses={() => setCurrentTab('transactions')}
                onOpenAnalytics={() => setCurrentTab('analytics')}
                onOpenGoals={() => setCurrentTab('goals')}
                onAddAccount={() => setAddAccountModalVisible(true)}
                onAddRecurring={() => setCurrentTab('calendar')}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                onOpenProfile={() => setCurrentTab('profile')}
                onMenuPress={() => setDrawerVisible(true)}
                userName={userDisplayName}
                avatarUrl={userAvatarUrl}
              />
            )}

            {currentTab === 'tasks' && (
              <TasksScreen
                tasks={tasks}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onOpenProfile={() => setCurrentTab('profile')}
                onMenuPress={() => setDrawerVisible(true)}
                avatarUrl={userAvatarUrl}
              />
            )}

            {currentTab === 'calendar' && (
              <CalendarScreen
                tasks={tasks}
                recurringRules={recurringRules}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onOpenProfile={() => setCurrentTab('profile')}
                onMenuPress={() => setDrawerVisible(true)}
                avatarUrl={userAvatarUrl}
              />
            )}

            {currentTab === 'accounts' && (
              <AccountsScreen
                accounts={accounts}
                onAddAccount={handleAddAccount}
                onDeleteAccount={handleDeleteAccount}
                onOpenProfile={() => setCurrentTab('profile')}
                onMenuPress={() => setDrawerVisible(true)}
                avatarUrl={userAvatarUrl}
              />
            )}

            {currentTab === 'transactions' && (
              <TransactionsScreen
                transactions={transactions}
                categories={categories}
                accounts={accounts}
                onAddTransaction={handleSaveTransaction}
                onOpenProfile={() => setCurrentTab('profile')}
                onMenuPress={() => setDrawerVisible(true)}
                avatarUrl={userAvatarUrl}
              />
            )}

            {currentTab === 'analytics' && (
              <AnalyticsScreen
                transactions={transactions}
                accounts={accounts}
                budgets={budgets}
                tasks={tasks}
                goals={goals}
                onOpenProfile={() => setCurrentTab('profile')}
                onMenuPress={() => setDrawerVisible(true)}
                avatarUrl={userAvatarUrl}
                onOpenTransactions={() => setCurrentTab('transactions')}
                onOpenGoals={() => setCurrentTab('goals')}
              />
            )}

            {currentTab === 'goals' && (
              <GoalsScreen
                goals={goals}
                onAddGoal={handleAddGoal}
                onAddFundsToGoal={handleAddFundsToGoal}
                onOpenProfile={() => setCurrentTab('profile')}
                onMenuPress={() => setDrawerVisible(true)}
                avatarUrl={userAvatarUrl}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileScreen
                onBack={() => setCurrentTab('home')}
                onSignOut={handleSignOut}
                onProfileUpdated={(updatedUser) => {
                  setCurrentUser((prev: any) => ({
                    ...prev,
                    ...updatedUser,
                    user_metadata: {
                      ...prev?.user_metadata,
                      ...updatedUser?.user_metadata,
                    },
                  }));
                }}
              />
            )}

            {/* Global Add Account Modal */}
            <AddAccountModal
              visible={addAccountModalVisible}
              onClose={() => setAddAccountModalVisible(false)}
              onSave={handleAddAccount}
            />

            {/* Global Quick Dispatch Transaction Modal */}
            <AddTransactionModal
              visible={isGlobalTxModalOpen}
              onClose={() => setIsGlobalTxModalOpen(false)}
              onSave={handleSaveTransaction}
              initialType="expense"
              categories={categories}
              accounts={accounts}
            />

            {/* Global Add Task Modal */}
            <AddTaskModal
              visible={isGlobalTaskModalOpen}
              onClose={() => setIsGlobalTaskModalOpen(false)}
              onSave={handleAddTask}
            />

            {/* Side Navigation Drawer */}
            <SideDrawerNav
              visible={drawerVisible}
              onClose={() => setDrawerVisible(false)}
              currentRoute={currentTab}
              onNavigate={(route) => setCurrentTab(route)}
              userName={userDisplayName}
              userEmail={currentUser?.email}
              avatarUrl={userAvatarUrl}
              tasksCount={tasks.filter((t) => !t.completed).length}
              accountsCount={accounts.length}
              transactionsCount={transactions.length}
              goalsCount={goals.length}
              onSignOut={handleSignOut}
              onQuickAddTransaction={() => setIsGlobalTxModalOpen(true)}
              onQuickAddTask={() => setIsGlobalTaskModalOpen(true)}
              onQuickAddAccount={() => setAddAccountModalVisible(true)}
            />

            {/* Floating 5-Tab Navigation Bar matching Mockup */}
            <BottomIslandNav
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              onQuickLog={() => setIsGlobalTxModalOpen(true)}
            />
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    position: 'relative',
  },
  screenWrapper: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
