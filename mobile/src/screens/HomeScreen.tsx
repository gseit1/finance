import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { BalanceCard } from '../components/BalanceCard';
import { SpendingBreakdown } from '../components/SpendingBreakdown';
import { TransactionList } from '../components/TransactionList';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { SetBudgetModal } from '../components/SetBudgetModal';
import { AppTopHeader } from '../components/AppTopHeader';
import { Transaction, Account, Category, Budget, TransactionType, RecurringRule } from '../types';

const MONO_FONT = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

interface HomeScreenProps {
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  transactions: Transaction[];
  recurringRules?: RecurringRule[];
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
  onAddAccount?: () => void;
  onAddRecurring?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onOpenProfile?: () => void;
  userName?: string;
  avatarUrl?: string | null;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  accounts,
  categories,
  budgets,
  transactions,
  recurringRules = [],
  onAddTransaction,
  onSaveBudget,
  onDeleteBudget,
  onOpenAccounts,
  onAddAccount,
  onAddRecurring,
  onRefresh,
  refreshing = false,
  onOpenProfile,
  userName,
  avatarUrl,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [selectedBudgetCategoryId, setSelectedBudgetCategoryId] = useState<string | undefined>();

  // Exact net balance calculated from all accounts
  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  // Cashflow calculations
  let income = 0;
  let expense = 0;
  transactions.forEach((tx) => {
    if (tx.type === 'income') income += tx.amount;
    if (tx.type === 'expense') expense += tx.amount;
  });

  // Upcoming bills sorted by next run date
  const upcomingBills = recurringRules
    .filter((r) => r.is_active && r.type === 'expense')
    .slice(0, 3);

  return (
    <View style={styles.container}>
      {/* Precision 1-Line Status Bar Header */}
      <AppTopHeader
        title="Ledger"
        showPulse
        onProfilePress={onOpenProfile}
        avatarUrl={avatarUrl}
        userName={userName}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFFFFF"
              colors={['#FFFFFF']}
            />
          ) : undefined
        }
      >
        {/* // 01. NET LIQUIDITY POSITION */}
        <BalanceCard
          totalBalance={totalBalance}
          monthlyIncome={income}
          monthlyExpense={expense}
          onAddTransaction={() => setModalVisible(true)}
          onOptionsPress={() => setModalVisible(true)}
        />

        {/* // 02. BUDGET ALLOCATIONS */}
        <SpendingBreakdown
          budgets={budgets}
          onOpenSetBudget={(catId) => {
            setSelectedBudgetCategoryId(catId);
            setBudgetModalVisible(true);
          }}
        />

        {/* // 03. RECENT ACTIVITY */}
        <TransactionList transactions={transactions.slice(0, 10)} />

        {/* // 04. REPOSITORIES & VAULTS */}
        <View style={styles.sectionLedger}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionEyebrow}>// 04. REPOSITORIES & VAULTS</Text>
            <TouchableOpacity onPress={onOpenAccounts} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.actionLinkText}>[ MANAGE › ]</Text>
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
                style={styles.accountMiniCard}
                onPress={onOpenAccounts}
                activeOpacity={0.75}
              >
                <View style={styles.accountMiniTop}>
                  <View style={[styles.accountColorSquare, { backgroundColor: acc.color || '#FFFFFF' }]} />
                  <Text style={styles.accountTypeMini}>{(acc.type || 'bank').toUpperCase()}</Text>
                </View>
                <Text style={styles.accountMiniName} numberOfLines={1}>{acc.name}</Text>
                <Text style={[styles.accountMiniBalance, acc.balance < 0 && { color: colors.outflow }]}>
                  {acc.balance < 0 ? '-' : ''}€{Math.abs(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Quick Add Account Button */}
            <TouchableOpacity
              style={styles.addAccountMiniCard}
              onPress={onAddAccount || onOpenAccounts}
              activeOpacity={0.75}
            >
              <Text style={styles.plusIcon}>+</Text>
              <Text style={styles.addAccountText}>[ + NEW ]</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* // 05. SCHEDULED COMMITMENTS */}
        <View style={styles.sectionLedger}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionEyebrow}>// 05. SCHEDULED COMMITMENTS</Text>
            <TouchableOpacity onPress={onOpenAccounts} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.actionLinkText}>[ ALL BILLS › ]</Text>
            </TouchableOpacity>
          </View>

          {upcomingBills.length === 0 ? (
            <TouchableOpacity
              style={styles.emptyDashedBox}
              onPress={onAddRecurring || onOpenAccounts}
              activeOpacity={0.75}
            >
              <Text style={styles.emptyTitle}>NO ACTIVE RECURRING COMMITMENTS</Text>
              <Text style={styles.emptySubtext}>Tap to schedule subscriptions, rent, and utility commitments</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.recurringList}>
              {upcomingBills.map((bill, index) => {
                const isLast = index === upcomingBills.length - 1;
                return (
                  <View key={bill.id} style={[styles.recurringItemRow, !isLast && styles.itemBorderBottom]}>
                    <View style={styles.billInfo}>
                      <Text style={styles.billDescription}>{bill.description}</Text>
                      <Text style={styles.billDate}>Next: {bill.next_run_date} · {bill.frequency.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.billAmount}>-€{bill.amount.toFixed(2)}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Transaction Logging Modal */}
      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={onAddTransaction}
        initialType="expense"
        categories={categories}
        accounts={accounts}
      />

      {/* Budget Limit Setting & Editing Modal */}
      <SetBudgetModal
        visible={budgetModalVisible}
        onClose={() => setBudgetModalVisible(false)}
        onSave={(b) => {
          onSaveBudget?.(b);
          setBudgetModalVisible(false);
        }}
        onDelete={(catId) => {
          onDeleteBudget?.(catId);
          setBudgetModalVisible(false);
        }}
        categories={categories}
        budgets={budgets}
        initialCategoryId={selectedBudgetCategoryId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  sectionLedger: {
    backgroundColor: '#080808',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(39, 39, 42, 0.7)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionEyebrow: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#71717A',
    textTransform: 'uppercase',
  },
  actionLinkText: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    fontWeight: '700',
    color: '#A1A1AA',
    letterSpacing: 0.5,
  },
  accountsScroll: {
    paddingRight: 10,
  },
  accountMiniCard: {
    backgroundColor: '#101012',
    borderRadius: 10,
    padding: 12,
    width: 140,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  accountMiniTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  accountColorSquare: {
    width: 6,
    height: 6,
    borderRadius: 1,
    marginRight: 6,
  },
  accountTypeMini: {
    fontFamily: MONO_FONT,
    fontSize: 9,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 0.8,
  },
  accountMiniName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  accountMiniBalance: {
    fontFamily: MONO_FONT,
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  addAccountMiniCard: {
    backgroundColor: '#101012',
    borderRadius: 10,
    padding: 12,
    width: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#27272A',
  },
  plusIcon: {
    fontFamily: MONO_FONT,
    fontSize: 16,
    color: '#A1A1AA',
    marginBottom: 2,
    fontWeight: '700',
  },
  addAccountText: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    fontWeight: '700',
    color: '#A1A1AA',
    letterSpacing: 0.5,
  },
  emptyDashedBox: {
    borderWidth: 1,
    borderColor: '#27272A',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(24, 24, 27, 0.2)',
  },
  emptyTitle: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    fontWeight: '700',
    color: '#A1A1AA',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#52525B',
    marginTop: 4,
    textAlign: 'center',
  },
  recurringList: {
    backgroundColor: 'transparent',
  },
  recurringItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#18181B',
  },
  billInfo: {
    flex: 1,
    marginRight: 10,
  },
  billDescription: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  billDate: {
    fontFamily: MONO_FONT,
    color: '#71717A',
    fontSize: 11,
  },
  billAmount: {
    fontFamily: MONO_FONT,
    color: colors.outflow,
    fontSize: 13,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
});

