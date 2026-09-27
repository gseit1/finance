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
} from 'react-native';
import { colors } from '../theme/colors';
import { BalanceCard } from '../components/BalanceCard';
import { SpendingBreakdown } from '../components/SpendingBreakdown';
import { TransactionList } from '../components/TransactionList';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { SetBudgetModal } from '../components/SetBudgetModal';
import { AppTopHeader } from '../components/AppTopHeader';
import { Transaction, Account, Category, Budget, TransactionType } from '../types';

interface HomeScreenProps {
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  transactions: Transaction[];
  onAddTransaction: (tx: {
    type: TransactionType;
    amount: number;
    description: string;
    categoryId: string;
    accountId: string;
  }) => void;
  onSaveBudget?: (budget: { categoryId: string; amount: number }) => void;
  onDeleteBudget?: (categoryId: string) => void;
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
  onAddTransaction,
  onSaveBudget,
  onDeleteBudget,
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

  return (
    <View style={styles.container}>
      {/* Global Notch & Status Bar Protected Top Header */}
      <AppTopHeader
        title="Ledger"
        showPulse
        onProfilePress={onOpenProfile}
        avatarUrl={avatarUrl}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FAFAFA"
              colors={['#FAFAFA']}
            />
          ) : undefined
        }
      >
        {/* Welcome Salutation: Hello + User Name */}
        <View style={styles.salutationRow}>
          <Text style={styles.salutationEyebrow}>PORTFOLIO VAULT</Text>
          <Text style={styles.salutationText}>
            Hello, <Text style={styles.salutationHighlight}>{userName || 'Operator'}</Text> 👋
          </Text>
        </View>

        {/* Net Balance Card */}
        <BalanceCard
          totalBalance={totalBalance}
          monthlyIncome={income}
          monthlyExpense={expense}
          onAddTransaction={() => setModalVisible(true)}
          onOptionsPress={() => setModalVisible(true)}
        />

        {/* High-Density Monthly Budgets with hairline progress tracks */}
        <SpendingBreakdown
          budgets={budgets}
          onOpenSetBudget={(catId) => {
            setSelectedBudgetCategoryId(catId);
            setBudgetModalVisible(true);
          }}
        />

        {/* Recent Activity Ledger */}
        <TransactionList transactions={transactions.slice(0, 10)} />
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
    backgroundColor: '#09090B',
  },
  salutationRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 2,
  },
  salutationEyebrow: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1.5,
    color: '#71717A',
    fontWeight: '700',
    marginBottom: 2,
  },
  salutationText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#71717A',
    letterSpacing: -0.6,
  },
  salutationHighlight: {
    color: '#FAFAFA',
  },
  scrollContent: {
    paddingBottom: 96,
  },
});
