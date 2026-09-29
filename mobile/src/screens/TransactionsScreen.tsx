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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('el-GR', { day: 'numeric', month: 'short' });
    } catch {
      return dateString;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppTopHeader
        title="Συναλλαγές"
        onMenuPress={onMenuPress}
        onProfilePress={onOpenProfile}
        avatarUrl={avatarUrl}
        rightAction={
          <View style={styles.headerRightGroup}>
            <TouchableOpacity
              style={[styles.headerIconBtn, { backgroundColor: theme.iconButtonBg, borderColor: theme.iconButtonBorder }]}
              onPress={() => setIsSearching(!isSearching)}
              activeOpacity={0.7}
            >
              <SearchIcon size={17} color={theme.iconButtonColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerIconBtn, { backgroundColor: theme.buttonPrimaryBg }]}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.85}
            >
              <PlusIcon size={16} color={theme.buttonPrimaryText} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Search Bar */}
        {isSearching && (
          <View style={[styles.searchBarContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
            <SearchIcon size={14} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.inputText }]}
              placeholder="Αναζήτηση..."
              placeholderTextColor={theme.inputPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={[styles.clearSearch, { color: theme.textMuted }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Cashflow summary — inline, not 3 cards */}
        <View style={[styles.cashflowBar, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
          <View style={styles.cashflowCol}>
            <Text style={[styles.cashflowLabel, { color: theme.textMuted }]}>Εισροές</Text>
            <Text style={[styles.cashflowValue, { color: theme.emerald }]}>
              +€{totalIncome.toLocaleString('el-GR', { minimumFractionDigits: 0 })}
            </Text>
          </View>
          <View style={[styles.cashflowDivider, { backgroundColor: theme.hairline }]} />
          <View style={styles.cashflowCol}>
            <Text style={[styles.cashflowLabel, { color: theme.textMuted }]}>Εκροές</Text>
            <Text style={[styles.cashflowValue, { color: theme.crimson }]}>
              −€{totalExpense.toLocaleString('el-GR', { minimumFractionDigits: 0 })}
            </Text>
          </View>
          <View style={[styles.cashflowDivider, { backgroundColor: theme.hairline }]} />
          <View style={styles.cashflowCol}>
            <Text style={[styles.cashflowLabel, { color: theme.textMuted }]}>Καθαρό</Text>
            <Text style={[styles.cashflowValue, { color: netCashflow >= 0 ? theme.emerald : theme.crimson }]}>
              €{netCashflow.toLocaleString('el-GR', { minimumFractionDigits: 0 })}
            </Text>
          </View>
        </View>

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

        {/* ─── Continuous Ledger List ─── */}
        {filteredTransactions.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Δεν βρέθηκαν συναλλαγές</Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Πατήστε + για να καταχωρήσετε νέα συναλλαγή.</Text>
          </View>
        ) : (
          <View style={[styles.ledgerContainer, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
            {filteredTransactions.map((tx, index) => {
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';
              const isLast = index === filteredTransactions.length - 1;
              return (
                <View
                  key={tx.id}
                  style={[
                    styles.ledgerRow,
                    !isLast && { borderBottomWidth: 1, borderBottomColor: theme.hairlineFaint },
                  ]}
                >
                  {/* Left: subtle income/expense indicator dot */}
                  <View style={[
                    styles.typeDot,
                    {
                      backgroundColor: isIncome ? theme.emerald : isTransfer ? theme.textMuted : theme.crimson,
                    },
                  ]} />

                  {/* Center: Description + inline metadata */}
                  <View style={styles.ledgerMiddle}>
                    <Text style={[styles.ledgerTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {tx.description || 'Συναλλαγή'}
                    </Text>
                    <Text style={[styles.ledgerMeta, { color: theme.textMuted }]} numberOfLines={1}>
                      {tx.category_name || 'Γενικά'} · {tx.account_name || '—'} · {formatDate(tx.date)}
                    </Text>
                  </View>

                  {/* Right: amount */}
                  <Text
                    style={[
                      styles.ledgerAmount,
                      {
                        color: isIncome
                          ? theme.emerald
                          : isTransfer
                            ? theme.textPrimary
                            : theme.crimson,
                      },
                    ]}
                  >
                    {isIncome ? '+' : '−'}€{tx.amount.toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

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
  container: { flex: 1 },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12,
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
    fontSize: 13,
    fontWeight: '700',
  },
  // Inline cashflow summary bar — single card, 3 columns
  cashflowBar: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  cashflowCol: {
    flex: 1,
    alignItems: 'center',
  },
  cashflowDivider: {
    width: 1,
    marginVertical: 2,
  },
  cashflowLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  cashflowValue: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  filterPillsRow: {
    gap: 7,
    paddingBottom: 14,
  },
  pill: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    fontWeight: '600',
  },
  // Continuous ledger
  ledgerContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  typeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
    flexShrink: 0,
  },
  ledgerMiddle: {
    flex: 1,
    paddingRight: 10,
  },
  ledgerTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  ledgerMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 1,
    letterSpacing: 0,
  },
  ledgerAmount: {
    fontFamily: fonts.heading,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
    flexShrink: 0,
  },
  emptyContainer: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyTitle: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtext: {
    fontFamily: fonts.body,
    fontSize: 13,
    textAlign: 'center',
  },
});
