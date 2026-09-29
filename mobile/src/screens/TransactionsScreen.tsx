import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { fonts } from '../theme/typography';
import { Transaction, Category, Account, TransactionType } from '../types';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { AppTopHeader } from '../components/AppTopHeader';
import { useTheme } from '../theme/ThemeContext';
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
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState<TxFilter>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach((tx) => {
    if (tx.type === 'income') totalIncome += tx.amount;
    if (tx.type === 'expense') totalExpense += tx.amount;
  });
  const netCashflow = totalIncome - totalExpense;

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (activeFilter === 'expense' && tx.type !== 'expense') return false;
      if (activeFilter === 'income' && tx.type !== 'income') return false;
      if (activeFilter === 'transfer' && tx.type !== 'transfer') return false;
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

  const filterLabels: Record<TxFilter, string> = {
    all: `Όλες (${transactions.length})`,
    expense: 'Έξοδα',
    income: 'Έσοδα',
    transfer: 'Μεταφορές',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppTopHeader
        title="Βιβλίο Συναλλαγών"
        onMenuPress={onMenuPress}
        onProfilePress={onOpenProfile}
        avatarUrl={avatarUrl}
        rightAction={
          <View style={styles.headerRightGroup}>
            <TouchableOpacity
              style={[styles.searchIconButton, { backgroundColor: theme.iconButtonBg, borderColor: theme.iconButtonBorder }]}
              onPress={() => setIsSearching(!isSearching)}
              activeOpacity={0.7}
            >
              <SearchIcon size={18} color={theme.iconButtonColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addIconButton, { backgroundColor: theme.buttonPrimaryBg }]}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.85}
            >
              <PlusIcon size={16} color={theme.buttonPrimaryText} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Συνολικές Εισροές</Text>
            <Text style={[styles.summaryNumber, { color: theme.emerald }]}>
              +€{totalIncome.toLocaleString('el-GR', { minimumFractionDigits: 0 })}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Συνολικές Εκροές</Text>
            <Text style={[styles.summaryNumber, { color: theme.crimson }]}>
              -€{totalExpense.toLocaleString('el-GR', { minimumFractionDigits: 0 })}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Καθαρή Ταμειακή Ροή</Text>
            <Text style={[styles.summaryNumber, { color: netCashflow >= 0 ? theme.emerald : theme.crimson }]}>
              €{netCashflow.toLocaleString('el-GR', { minimumFractionDigits: 0 })}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        {isSearching && (
          <View style={[styles.searchBarContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
            <SearchIcon size={16} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.inputText }]}
              placeholder="Αναζήτηση περιγραφής, κατηγορίας..."
              placeholderTextColor={theme.inputPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={[styles.clearSearch, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
          {(['all', 'expense', 'income', 'transfer'] as TxFilter[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.pill,
                { backgroundColor: theme.pillBg, borderColor: theme.hairline },
                activeFilter === f && { backgroundColor: theme.buttonPrimaryBg, borderColor: theme.buttonPrimaryBg },
              ]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.pillText,
                { color: theme.pillText },
                activeFilter === f && { color: theme.buttonPrimaryText },
              ]}>
                {filterLabels[f]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transactions List */}
        <View style={styles.taskList}>
          {filteredTransactions.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Δεν βρέθηκαν συναλλαγές</Text>
              <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Πατήστε + για να καταχωρήσετε νέα συναλλαγή.</Text>
            </View>
          ) : (
            filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';
              return (
                <View key={tx.id} style={[styles.taskCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
                  <View style={styles.radioWrapper}>
                    {isIncome ? (
                      <View style={[styles.checkedCircle, { backgroundColor: theme.emerald }]}>
                        <CheckIcon size={12} color="#FFFFFF" />
                      </View>
                    ) : (
                      <View style={[styles.uncheckedCircle, { borderColor: theme.hairline }]} />
                    )}
                  </View>

                  <View style={styles.taskDetails}>
                    <Text style={[styles.taskTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {tx.description || 'Συναλλαγή'}
                    </Text>
                    <View style={styles.metaRow}>
                      <View style={[styles.categoryPill, { backgroundColor: theme.track }]}>
                        <Text style={[styles.categoryPillText, { color: theme.textSecondary }]}>{tx.category_name || 'Γενικά'}</Text>
                      </View>
                      <Text style={[styles.accNameText, { color: theme.textSecondary }]}>{tx.account_name}</Text>
                    </View>
                  </View>

                  <View style={styles.taskRight}>
                    <Text
                      style={[
                        styles.txAmount,
                        isIncome
                          ? { color: theme.emerald }
                          : isTransfer
                            ? { color: theme.textPrimary }
                            : { color: theme.crimson },
                      ]}
                    >
                      {isIncome ? '+' : '-'}€{tx.amount.toFixed(2)}
                    </Text>
                    <Text style={[styles.txDate, { color: theme.textMuted }]}>
                      {new Date(tx.date).toLocaleDateString('el-GR')}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  addIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
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
    borderWidth: 1,
  },
  summaryLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryNumber: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '900',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 16,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    fontFamily: fonts.body,
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  clearSearch: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
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
    borderWidth: 1,
  },
  pillText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    fontWeight: '600',
  },
  taskList: {
    gap: 12,
  },
  taskCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
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
  },
  checkedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
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
  },
  categoryPillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    fontWeight: '600',
  },
  accNameText: {
    fontFamily: fonts.bodyLight,
    fontSize: 11,
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
  txDate: {
    fontSize: 11,
    marginTop: 4,
  },
  emptyContainer: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: 'center',
  },
});
