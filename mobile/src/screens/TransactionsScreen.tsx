import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { fonts } from '../theme/typography';
import { Transaction, Category, Account, TransactionType } from '../types';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { AppTopHeader } from '../components/AppTopHeader';
import { useTheme } from '../theme/ThemeContext';
import {
  SearchIcon,
  PlusIcon,
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
  onDeleteTransaction?: (txId: string) => void;
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
  onDeleteTransaction,
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

  const handleRowLongPress = (tx: Transaction) => {
    if (!onDeleteTransaction) return;

    Alert.alert(
      'Διαγραφή Συναλλαγής',
      `Είστε βέβαιοι ότι θέλετε να διαγράψετε τη συναλλαγή "${tx.description || 'Χωρίς περιγραφή'}" ποσού €${tx.amount.toFixed(2)};`,
      [
        { text: 'Ακύρωση', style: 'cancel' },
        {
          text: 'Διαγραφή',
          style: 'destructive',
          onPress: () => onDeleteTransaction(tx.id),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppTopHeader
        title="ΒΙΒΛΙΟ ΣΥΝΑΛΛΑΓΩΝ"
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
              style={[styles.headerIconBtn, { backgroundColor: theme.brandPink, borderColor: theme.brandPink }]}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.85}
            >
              <PlusIcon size={16} color="#FFFFFF" />
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
              placeholder="Αναζήτηση συναλλαγής..."
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

        {/* High-Contrast Cashflow Status Strip */}
        <View style={[styles.cashflowBar, { backgroundColor: theme.brandPink, borderWidth: 0 }]}>
          <View style={styles.cashflowCol}>
            <Text style={[styles.cashflowLabel, { color: 'rgba(255, 255, 255, 0.82)' }]}>ΕΙΣΡΟΕΣ</Text>
            <Text style={[styles.cashflowValue, { color: '#A7F3D0' }]}>
              +€{totalIncome.toLocaleString('el-GR', { minimumFractionDigits: 0 })}
            </Text>
          </View>
          <View style={[styles.cashflowDivider, { backgroundColor: 'rgba(255, 255, 255, 0.22)' }]} />
          <View style={styles.cashflowCol}>
            <Text style={[styles.cashflowLabel, { color: 'rgba(255, 255, 255, 0.82)' }]}>ΕΚΡΟΕΣ</Text>
            <Text style={[styles.cashflowValue, { color: '#FECDD3' }]}>
              −€{totalExpense.toLocaleString('el-GR', { minimumFractionDigits: 0 })}
            </Text>
          </View>
          <View style={[styles.cashflowDivider, { backgroundColor: 'rgba(255, 255, 255, 0.22)' }]} />
          <View style={styles.cashflowCol}>
            <Text style={[styles.cashflowLabel, { color: 'rgba(255, 255, 255, 0.82)' }]}>ΚΑΘΑΡΟ</Text>
            <Text style={[styles.cashflowValue, { color: '#FFFFFF' }]}>
              {netCashflow >= 0 ? '+' : ''}€{netCashflow.toLocaleString('el-GR', { minimumFractionDigits: 0 })}
            </Text>
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
          {(['all', 'expense', 'income', 'transfer'] as TxFilter[]).map((f) => {
            const isActive = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isActive ? theme.brandPink : theme.surface,
                    borderColor: isActive ? theme.brandPink : theme.hairline,
                  },
                ]}
                onPress={() => setActiveFilter(f)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pillText,
                    {
                      color: isActive ? '#FFFFFF' : theme.textSecondary,
                      fontWeight: isActive ? '700' : '600',
                    },
                  ]}
                >
                  {filterLabels[f]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Open Ledger List with Long-Press Delete Trigger */}
        <View style={styles.openLedgerContainer}>
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Δεν βρέθηκαν συναλλαγές</Text>
              <Text style={[styles.emptySubtext, { color: theme.textMuted }]}>
                Πατήστε το κουμπί + για καταχώρηση νέας συναλλαγής.
              </Text>
            </View>
          ) : (
            filteredTransactions.map((tx, index) => {
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';
              const isLast = index === filteredTransactions.length - 1;

              return (
                <TouchableOpacity
                  key={tx.id}
                  activeOpacity={0.65}
                  onLongPress={() => handleRowLongPress(tx)}
                  delayLongPress={350}
                  style={[
                    styles.ledgerRow,
                    { borderBottomColor: theme.hairline },
                    !isLast && { borderBottomWidth: 1 },
                  ]}
                >
                  {/* Subtle Type Dot */}
                  <View
                    style={[
                      styles.typeDot,
                      {
                        backgroundColor: isIncome
                          ? theme.emerald
                          : isTransfer
                            ? theme.brandPink
                            : theme.crimson,
                      },
                    ]}
                  />

                  {/* Center: Description + inline metadata */}
                  <View style={styles.ledgerMiddle}>
                    <Text style={[styles.ledgerTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {tx.description || 'Συναλλαγή'}
                    </Text>
                    <Text style={[styles.ledgerMeta, { color: theme.textMuted }]} numberOfLines={1}>
                      {tx.category_name || 'Γενικά'} · {tx.account_name || '—'} · {formatDate(tx.date)}
                    </Text>
                  </View>

                  {/* Right: Tabular Numerical Amount */}
                  <Text
                    style={[
                      styles.ledgerAmount,
                      {
                        color: isIncome
                          ? theme.emerald
                          : theme.textPrimary,
                      },
                    ]}
                  >
                    {isIncome ? '+' : '−'}€{tx.amount.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Bottom Dock Spacing */}
        <View style={{ height: 110 }} />
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
    paddingTop: 8,
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
  cashflowBar: {
    flexDirection: 'row',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
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
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  cashflowValue: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  filterPillsRow: {
    gap: 8,
    paddingBottom: 14,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  openLedgerContainer: {
    paddingTop: 4,
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  ledgerMeta: {
    fontFamily: fonts.body,
    fontSize: 11.5,
  },
  ledgerAmount: {
    fontFamily: fonts.heading,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.2,
    flexShrink: 0,
  },
  emptyContainer: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySubtext: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    textAlign: 'center',
  },
});