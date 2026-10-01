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
import { EditTransactionModal } from '../components/EditTransactionModal';
import { DeleteTransactionModal } from '../components/DeleteTransactionModal';
import { AppTopHeader } from '../components/AppTopHeader';
import { useTheme } from '../theme/ThemeContext';
import {
  SearchIcon,
  PlusIcon,
} from '../components/VectorIcons';
import { KineticProgressBar } from '../components/KineticProgressBar';

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
  onUpdateTransaction?: (tx: Transaction) => void;
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
  onUpdateTransaction,
  onDeleteTransaction,
  onOpenProfile,
  onMenuPress,
  avatarUrl,
}) => {
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState<TxFilter>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach((tx) => {
    if (tx.type === 'income') totalIncome += tx.amount;
    if (tx.type === 'expense') totalExpense += tx.amount;
  });
  const netCashflow = totalIncome - totalExpense;
  const flowTotal = totalIncome + totalExpense;
  const flowRatio = flowTotal > 0 ? Math.min(1, Math.max(0, totalIncome / flowTotal)) : 0.5;

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
    setDeletingTx(tx);
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

        {/* Pure Pink Hero Card with Kinetic Cashflow Progress */}
        <View style={[styles.heroCard, { backgroundColor: theme.brandPink, borderWidth: 0 }]}>
          <View style={styles.heroTopRow}>
            <Text style={[styles.heroEyebrow, { color: 'rgba(255, 255, 255, 0.85)' }]}>
              ΤΑΜΕΙΑΚΟ ΙΣΟΖΥΓΙΟ
            </Text>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>
                {transactions.length} ΣΥΝΑΛΛΑΓΕΣ
              </Text>
            </View>
          </View>

          <Text style={styles.heroAmount}>
            {netCashflow >= 0 ? '+' : '−'}€{Math.abs(netCashflow).toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <Text style={styles.heroAmountPeriod}>
              {' '}{netCashflow >= 0 ? 'πλεόνασμα' : 'έλλειμμα'}
            </Text>
          </Text>

          {/* Kinetic Progress Bar of Cashflow Balance */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>ΙΣΟΖΥΓΙΟ ΕΙΣΡΟΩΝ / ΕΚΡΟΩΝ</Text>
              <Text style={styles.progressPercent}>{Math.round(flowRatio * 100)}% εισροές</Text>
            </View>
            <KineticProgressBar
              progress={flowRatio}
              height={4}
              trackColor="rgba(255, 255, 255, 0.25)"
              fillColor="#FFFFFF"
              duration={900}
            />
          </View>

          {/* Metric Sub-strip */}
          <View style={styles.heroMetricsStrip}>
            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricLabel}>ΣΥΝΟΛΟ ΕΙΣΡΟΩΝ</Text>
              <Text style={[styles.heroMetricValue, { color: '#A7F3D0' }]}>
                +€{totalIncome.toLocaleString('el-GR', { minimumFractionDigits: 0 })}
              </Text>
            </View>
            <View style={styles.heroMetricDivider} />
            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricLabel}>ΣΥΝΟΛΟ ΕΚΡΟΩΝ</Text>
              <Text style={[styles.heroMetricValue, { color: '#FECDD3' }]}>
                −€{totalExpense.toLocaleString('el-GR', { minimumFractionDigits: 0 })}
              </Text>
            </View>
            <View style={styles.heroMetricDivider} />
            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricLabel}>ΜΕΣΗ ΣΥΝΑΛΛΑΓΗ</Text>
              <Text style={styles.heroMetricValue}>
                €{transactions.length > 0 ? Math.round((totalIncome + totalExpense) / transactions.length) : 0}
              </Text>
            </View>
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
                  onPress={() => setEditingTx(tx)}
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

      <EditTransactionModal
        visible={!!editingTx}
        transaction={editingTx}
        categories={categories}
        accounts={accounts}
        onClose={() => setEditingTx(null)}
        onSave={(updated) => {
          onUpdateTransaction?.(updated);
        }}
        onRequestDelete={(tx) => {
          setDeletingTx(tx);
        }}
      />

      <DeleteTransactionModal
        visible={!!deletingTx}
        transaction={deletingTx}
        onClose={() => setDeletingTx(null)}
        onConfirmDelete={(id) => {
          onDeleteTransaction?.(id);
        }}
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
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  heroEyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  heroPillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroAmount: {
    fontFamily: fonts.heading,
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginBottom: 12,
  },
  heroAmountPeriod: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.80)',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: 'rgba(255, 255, 255, 0.80)',
  },
  progressPercent: {
    fontFamily: fonts.heading,
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroMetricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
  },
  heroMetricCol: {
    flex: 1,
    alignItems: 'center',
  },
  heroMetricLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 3,
  },
  heroMetricValue: {
    fontFamily: fonts.heading,
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroMetricDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
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