import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { Transaction, Category, Account, TransactionType } from '../types';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { AppTopHeader } from '../components/AppTopHeader';
import {
  SearchIcon,
  PlusIcon,
  CheckIcon,
} from '../components/VectorIcons';

interface TransactionsScreenProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onAddTransaction: (tx: {
    type: TransactionType;
    amount: number;
    description: string;
    categoryId: string;
    accountId: string;
    date?: string;
  }) => void;
  onOpenProfile?: () => void;
  onMenuPress?: () => void;
  avatarUrl?: string | null;
}

type TxFilter = 'all' | 'expense' | 'income' | 'transfer';

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  transactions,
  categories,
  accounts,
  onAddTransaction,
  onOpenProfile,
  onMenuPress,
  avatarUrl,
}) => {
  const [activeFilter, setActiveFilter] = useState<TxFilter>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Cashflow totals
  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach((tx) => {
    if (tx.type === 'income') totalIncome += tx.amount;
    if (tx.type === 'expense') totalExpense += tx.amount;
  });
  const netCashflow = totalIncome - totalExpense;

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (activeFilter === 'expense' && tx.type !== 'expense') return false;
      if (activeFilter === 'income' && tx.type !== 'income') return false;
      if (activeFilter === 'transfer' && tx.type !== 'transfer') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mDesc = (tx.description || '').toLowerCase().includes(q);
        const mCat = (tx.category_name || '').toLowerCase().includes(q);
        const mAcc = (tx.account_name || '').toLowerCase().includes(q);
        if (!mDesc && !mCat && !mAcc) return false;
      }
      return true;
    });
  }, [transactions, activeFilter, searchQuery]);

  return (
    <View style={styles.container}>
      <AppTopHeader
        title=""
        onMenuPress={onMenuPress}
        onProfilePress={onOpenProfile}
        avatarUrl={avatarUrl}
        rightAction={
          <View style={styles.headerRightGroup}>
            <TouchableOpacity
              style={styles.searchIconButton}
              onPress={() => setIsSearching(!isSearching)}
              activeOpacity={0.7}
            >
              <SearchIcon size={18} color="#111827" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addIconButton}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.85}
            >
              <PlusIcon size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>Transactions Ledger</Text>
        </View>

        {/* 3 Summary Stat Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Inflow</Text>
            <Text style={[styles.summaryNumber, { color: '#059669' }]}>
              +€{totalIncome.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Outflow</Text>
            <Text style={[styles.summaryNumber, { color: '#E11D48' }]}>
              -€{totalExpense.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Net Cashflow</Text>
            <Text
              style={[
                styles.summaryNumber,
                { color: netCashflow >= 0 ? '#059669' : '#E11D48' },
              ]}
            >
              €{netCashflow.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        {isSearching && (
          <View style={styles.searchBarContainer}>
            <SearchIcon size={16} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search description, category, account..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearch}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
          {(['all', 'expense', 'income', 'transfer'] as TxFilter[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.pill, activeFilter === f && styles.activePill]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, activeFilter === f && styles.activePillText]}>
                {f === 'all'
                  ? `All (${transactions.length})`
                  : f === 'expense'
                    ? 'Expenses'
                    : f === 'income'
                      ? 'Income'
                      : 'Transfers'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transactions List */}
        <View style={styles.taskList}>
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Transactions Found</Text>
              <Text style={styles.emptySubtext}>Tap the + button to record a financial transaction.</Text>
            </View>
          ) : (
            filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';
              return (
                <View key={tx.id} style={styles.taskCard}>
                  <View style={styles.radioWrapper}>
                    {isIncome ? (
                      <View style={styles.checkedCircle}>
                        <CheckIcon size={12} color="#FFFFFF" />
                      </View>
                    ) : (
                      <View style={styles.uncheckedCircle} />
                    )}
                  </View>

                  <View style={styles.taskDetails}>
                    <Text style={styles.taskTitle} numberOfLines={1}>
                      {tx.description || 'Transaction'}
                    </Text>
                    <View style={styles.metaRow}>
                      <View style={styles.categoryPill}>
                        <Text style={styles.categoryPillText}>{tx.category_name || 'General'}</Text>
                      </View>
                      <Text style={styles.accNameText}>{tx.account_name}</Text>
                    </View>
                  </View>

                  <View style={styles.taskRight}>
                    <Text
                      style={[
                        styles.txAmount,
                        isIncome
                          ? styles.incomeAmount
                          : isTransfer
                            ? styles.transferAmount
                            : styles.expenseAmount,
                      ]}
                    >
                      {isIncome ? '+' : '-'}€{tx.amount.toFixed(2)}
                    </Text>
                    <Text style={styles.txDate}>{new Date(tx.date).toLocaleDateString()}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={onAddTransaction}
        categories={categories}
        accounts={accounts}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  addIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  titleRow: {
    marginBottom: 16,
  },
  screenTitle: {
    fontFamily: fonts.heading,
    fontSize: 26,
    fontWeight: '900',
    color: '#0A0A0A',
    letterSpacing: -0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  summaryLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    fontWeight: '600',
    color: '#71717A',
    marginBottom: 4,
  },
  summaryNumber: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '900',
    color: '#0A0A0A',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    gap: 8,
  },
  searchInput: {
    fontFamily: fonts.body,
    flex: 1,
    fontSize: 14,
    color: '#0A0A0A',
    padding: 0,
  },
  clearSearch: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: '#71717A',
    fontWeight: '700',
  },
  filterPillsRow: {
    gap: 8,
    paddingBottom: 16,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  activePill: {
    backgroundColor: '#0A0A0A',
    borderColor: '#0A0A0A',
  },
  pillText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    fontWeight: '600',
    color: '#71717A',
  },
  activePillText: {
    color: '#FFFFFF',
  },
  taskList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioWrapper: {
    marginRight: 12,
  },
  uncheckedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#D4D4D8',
  },
  checkedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskDetails: {
    flex: 1,
    paddingRight: 8,
  },
  taskTitle: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#F4F4F5',
  },
  categoryPillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    fontWeight: '600',
    color: '#71717A',
  },
  accNameText: {
    fontFamily: fonts.bodyLight,
    fontSize: 11,
    color: '#71717A',
    fontWeight: '500',
  },
  taskRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '900',
  },
  expenseAmount: {
    color: '#E11D48',
  },
  incomeAmount: {
    color: '#059669',
  },
  transferAmount: {
    color: '#0A0A0A',
  },
  txDate: {
    fontSize: 11,
    color: '#71717A',
    marginTop: 4,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0A0A',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#71717A',
    textAlign: 'center',
  },
});
