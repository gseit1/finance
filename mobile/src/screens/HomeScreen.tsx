import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { fonts } from '../theme/typography';
import { BalanceCard } from '../components/BalanceCard';
import { AppTopHeader } from '../components/AppTopHeader';
import { SpendingBreakdown } from '../components/SpendingBreakdown';
import { TransactionList } from '../components/TransactionList';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { SetBudgetModal } from '../components/SetBudgetModal';
import { useTheme } from '../theme/ThemeContext';
import {
  Transaction,
  Account,
  Category,
  Budget,
  TransactionType,
  RecurringRule,
  Task,
  Goal,
} from '../types';

interface HomeScreenProps {
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  transactions: Transaction[];
  recurringRules?: RecurringRule[];
  tasks?: Task[];
  goals?: Goal[];
  onAddTransaction: (tx: {
    type: TransactionType;
    amount: number;
    description: string;
    categoryId: string;
    accountId: string;
  }) => void;
  onSaveBudget?: (budget: { categoryId: string; amount: number }) => void;
  onDeleteBudget?: (categoryId: string) => void;
  onOpenAccounts?: () => void;
  onOpenCalendar?: () => void;
  onOpenTasks?: () => void;
  onOpenExpenses?: () => void;
  onOpenAnalytics?: () => void;
  onOpenGoals?: () => void;
  onAddAccount?: () => void;
  onAddRecurring?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onOpenProfile?: () => void;
  onMenuPress?: () => void;
  userName?: string;
  avatarUrl?: string | null;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  accounts,
  categories,
  budgets,
  transactions,
  recurringRules = [],
  tasks = [],
  goals = [],
  onAddTransaction,
  onSaveBudget,
  onDeleteBudget,
  onOpenAccounts,
  onOpenCalendar,
  onOpenTasks,
  onOpenExpenses,
  onOpenAnalytics,
  onOpenGoals,
  onAddAccount,
  onAddRecurring,
  onRefresh,
  refreshing = false,
  onOpenProfile,
  onMenuPress,
  userName = 'Χρήστης',
  avatarUrl,
}) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [selectedBudgetCategoryId, setSelectedBudgetCategoryId] = useState<string | undefined>();

  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  let income = 0;
  let expense = 0;
  transactions.forEach((tx) => {
    if (tx.type === 'income') income += tx.amount;
    if (tx.type === 'expense') expense += tx.amount;
  });

  const todayIso = new Date().toISOString().split('T')[0];

  const pendingTasks = tasks.filter((t) => !t.completed);
  const todaysFocusTask =
    pendingTasks.find((t) => t.due_date === todayIso) ||
    pendingTasks[0] ||
    tasks[0] ||
    null;

  const firstGoal = goals.length > 0 ? goals[0] : null;

  const tasksDueToday = tasks.filter((t) => t.due_date === todayIso).length;
  const billsDueToday = recurringRules.filter(
    (r) => r.is_active && r.next_run_date === todayIso
  ).length;
  const todayEventsCount = tasksDueToday + billsDueToday;

  const upcomingBill = recurringRules
    .filter((r) => r.is_active && r.type === 'expense')
    .map((r) => {
      let dueNotice = 'Σύντομα';
      try {
        const target = new Date(r.next_run_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        target.setHours(0, 0, 0, 0);
        const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) dueNotice = 'Σήμερα';
        else if (diffDays === 1) dueNotice = 'Αύριο';
        else if (diffDays > 1) dueNotice = `Σε ${diffDays} μέρες`;
      } catch {
        // fallback
      }
      return {
        description: r.description,
        amount: r.amount,
        dueNotice,
      };
    })[0] || null;

  const handleNotificationPress = () => {
    const goalName = firstGoal ? firstGoal.name : 'Πρωταρχικός Στόχος';
    const billDesc = upcomingBill
      ? `${upcomingBill.description} (${upcomingBill.dueNotice})`
      : 'Όλες οι πληρωμές ενήμερες';

    Alert.alert(
      'Ειδοποιήσεις & Υπενθυμίσεις',
      `🎯 Ενεργός Στόχος:\n${goalName}\n\n📅 Ημερολόγιο:\n${tasksDueToday} εργασίες και ${billsDueToday} πληρωμές σήμερα.\n\n💳 Επόμενη Υποχρέωση:\n${billDesc}`,
      [
        { text: 'Ημερολόγιο', onPress: onOpenCalendar },
        { text: 'Εργασίες', onPress: onOpenTasks },
        { text: 'Κλείσιμο', style: 'cancel' },
      ]
    );
  };

  const cleanUserName = (userName || 'Χρήστης')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}👋]/gu, '')
    .trim() || 'Χρήστης';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppTopHeader
        title={`Καλώς, ${cleanUserName}`}
        onMenuPress={onMenuPress}
        onProfilePress={onOpenProfile}
        avatarUrl={avatarUrl}
        userName={cleanUserName}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.textPrimary}
              colors={[theme.textPrimary]}
            />
          ) : undefined
        }
      >
        <BalanceCard
          totalBalance={totalBalance}
          monthlyIncome={income}
          monthlyExpense={expense}
          transactionCount={transactions.length}
          accountCount={accounts.length}
          userName={userName}
          focusTask={todaysFocusTask}
          firstGoal={firstGoal}
          pendingTaskCount={pendingTasks.length}
          todayEventsCount={todayEventsCount}
          upcomingBill={upcomingBill}
          onAddTransaction={() => setModalVisible(true)}
          onOpenTasks={onOpenTasks}
          onOpenExpenses={onOpenExpenses}
          onOpenCalendar={onOpenCalendar}
          onOpenAccounts={onOpenAccounts}
          onOpenAnalytics={onOpenAnalytics}
          onOpenGoals={onOpenGoals}
          onNotificationPress={handleNotificationPress}
          onMenuPress={onMenuPress}
          avatarUrl={avatarUrl}
          onOpenProfile={onOpenProfile}
        />

        {/* Κατανομή Προϋπολογισμού */}
        <SpendingBreakdown
          budgets={budgets}
          onOpenSetBudget={(catId) => {
            setSelectedBudgetCategoryId(catId);
            setBudgetModalVisible(true);
          }}
        />

        {/* Πρόσφατες Συναλλαγές */}
        <TransactionList transactions={transactions.slice(0, 8)} />

        {/* Λογαριασμοί & Πορτοφόλια */}
        <View style={styles.sectionLedger}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Λογαριασμοί & Πορτοφόλια</Text>
            <TouchableOpacity onPress={onOpenAccounts} activeOpacity={0.7}>
              <Text style={[styles.actionLinkText, { color: theme.textPrimary }]}>Διαχείριση ›</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.accountsScroll}
          >
            {accounts.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                style={[styles.accountMiniCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}
                onPress={onOpenAccounts}
                activeOpacity={0.8}
              >
                <View style={styles.accountMiniTop}>
                  <View
                    style={[
                      styles.accountColorSquare,
                      { backgroundColor: acc.color || '#0A0A0A' },
                    ]}
                  />
                  <Text style={[styles.accountTypeMini, { color: theme.textSecondary }]}>
                    {(acc.type || 'bank').toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.accountMiniName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {acc.name}
                </Text>
                <Text style={[styles.accountMiniBalance, { color: acc.balance < 0 ? '#E11D48' : theme.textPrimary }]}>
                  {acc.balance < 0 ? '-' : ''}€{Math.abs(acc.balance).toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={onAddTransaction}
        categories={categories}
        accounts={accounts}
      />

      {onSaveBudget && (
        <SetBudgetModal
          visible={budgetModalVisible}
          onClose={() => setBudgetModalVisible(false)}
          onSave={onSaveBudget}
          onDelete={onDeleteBudget}
          categories={categories}
          budgets={budgets}
          initialCategoryId={selectedBudgetCategoryId}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionLedger: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  actionLinkText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    fontWeight: '600',
  },
  accountsScroll: {
    paddingRight: 20,
    gap: 12,
  },
  accountMiniCard: {
    width: 140,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  accountMiniTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  accountColorSquare: {
    width: 8,
    height: 8,
    borderRadius: 3,
  },
  accountTypeMini: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  accountMiniName: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountMiniBalance: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '900',
  },
});
