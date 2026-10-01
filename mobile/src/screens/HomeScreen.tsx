import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { fonts } from '../theme/typography';
import { AppTopHeader } from '../components/AppTopHeader';
import { PiggyBankHero } from '../components/PiggyBankHero';
import { KineticProgressBar } from '../components/KineticProgressBar';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { EditTransactionModal } from '../components/EditTransactionModal';
import { DeleteTransactionModal } from '../components/DeleteTransactionModal';
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
  onUpdateTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (txId: string) => void;
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
  onOpenRecurring?: () => void;
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
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onSaveBudget,
  onDeleteBudget,
  onOpenCalendar,
  onOpenExpenses,
  onOpenRecurring,
  onRefresh,
  refreshing = false,
  onOpenProfile,
  onMenuPress,
  userName = 'Χρήστης',
  avatarUrl,
}) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [selectedBudgetCategoryId, setSelectedBudgetCategoryId] = useState<string | undefined>();

  // 1. Total Liquidity
  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  // 2. Month transactions & pacing
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthTransactions = transactions.filter((tx) => {
    try {
      const d = new Date(tx.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    } catch {
      return false;
    }
  });

  const monthlyIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const dayOfMonth = Math.max(1, now.getDate());
  const dailyBurn = monthlyExpense > 0 ? monthlyExpense / dayOfMonth : 0;
  const runwayDays = dailyBurn > 0 ? Math.floor(totalBalance / dailyBurn) : (totalBalance > 0 ? 30 : 0);

  // Status quote based on balance
  const getRunwayQuote = (balance: number) => {
    if (balance >= 700) return 'Μπροσκι ρίχτο έξω, σε παίρνει ακόμα';
    if (balance >= 400) return 'Μπροσκι ο μήνας έχει μέρες ακόμα..τσιλ.';
    if (balance >= 100) return 'Επ δικέ μου, είσαι δυσκολα';
    return 'μπροσκι θες 1 ευρω να παρεις τυροπιτα;';
  };

  // 3. Category lookup map
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const getCategoryName = (catId?: string) => (catId && categoryMap.get(catId)) || 'Γενικά';

  // 4. Scheduled Direct Debits
  const scheduledItems = recurringRules
    .filter((r) => r.is_active && r.type === 'expense')
    .sort((a, b) => new Date(a.next_run_date).getTime() - new Date(b.next_run_date).getTime())
    .slice(0, 3)
    .map((r) => {
      let relativeText = 'Σύντομα';
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(r.next_run_date);
        target.setHours(0, 0, 0, 0);
        const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 0) relativeText = 'Σήμερα';
        else if (diff === 1) relativeText = 'Σε 1 μέρα';
        else if (diff > 1) relativeText = `Σε ${diff} μέρες`;
        else if (diff < 0) relativeText = `${Math.abs(diff)} ημ. πριν`;
      } catch {
        // fallback
      }
      return {
        id: r.id,
        description: r.description,
        amount: r.amount,
        relativeText,
      };
    });

  // 5. Category Pacing items
  const configuredBudgets = budgets.slice(0, 3).map((b) => {
    const cat = categories.find((c) => c.id === b.category_id);
    const spent = monthTransactions
      .filter((t) => t.category_id === b.category_id && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      id: b.id,
      category_id: b.category_id,
      name: b.category_name || cat?.name || 'Κατηγορία',
      spent: b.spent ?? spent,
      limit: b.amount,
    };
  });

  const pacingDisplayItems =
    configuredBudgets.length > 0
      ? configuredBudgets
      : (() => {
          const catTotals: Record<string, number> = {};
          monthTransactions
            .filter((t) => t.type === 'expense')
            .forEach((t) => {
              const cId = t.category_id || 'general';
              catTotals[cId] = (catTotals[cId] || 0) + t.amount;
            });
          return Object.entries(catTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([catId, spent]) => {
              const cat = categories.find((c) => c.id === catId);
              return {
                id: catId,
                category_id: catId,
                name: cat?.name || 'Έξοδα',
                spent,
                limit: Math.max(100, Math.ceil((spent * 1.25) / 50) * 50),
              };
            });
        })();

  const cleanUserName = (userName || 'Χρήστης')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}👋]/gu, '')
    .trim() || 'Χρήστης';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppTopHeader
        title={`Γεια σου ${cleanUserName}`}
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
        {/* ΣΥΝΟΛΙΚΗ ΡΕΥΣΤΟΤΗΤΑ (Fully Pink Background Hero Canvas) */}
        <View style={[styles.heroCanvas, { backgroundColor: theme.brandPink }]}>
          {/* Κύριο υπόλοιπο και 3D Piggy Bank */}
          <View style={styles.balanceCoinRow}>
            <View style={styles.balanceTextCol}>
              <Text style={[styles.totalLiquidityText, { color: '#FFFFFF' }]} numberOfLines={1} adjustsFontSizeToFit>
                €{totalBalance.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={[styles.tierQuoteText, { color: 'rgba(255, 255, 255, 0.92)' }]}>
                {getRunwayQuote(totalBalance)}
              </Text>
            </View>

            <View style={styles.coinStageHolder}>
              <PiggyBankHero width={124} height={74} />
            </View>
          </View>

          {/* Υπο-στήλες: Έσοδα, Έξοδα, Αυτονομία */}
          <View style={[styles.metricsRow, { borderTopColor: 'rgba(255, 255, 255, 0.22)' }]}>
            <View style={styles.metricCol}>
              <Text style={[styles.metricLabel, { color: 'rgba(255, 255, 255, 0.78)' }]}>ΕΣΟΔΑ ΜΗΝΑ</Text>
              <Text style={[styles.metricValue, { color: '#A7F3D0' }]}>
                +€{monthlyIncome.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={[styles.metricDividerVertical, { backgroundColor: 'rgba(255, 255, 255, 0.22)' }]} />
            <View style={styles.metricCol}>
              <Text style={[styles.metricLabel, { color: 'rgba(255, 255, 255, 0.78)' }]}>ΕΞΟΔΑ ΜΗΝΑ</Text>
              <Text style={[styles.metricValue, { color: '#FECDD3' }]}>
                -€{monthlyExpense.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={[styles.metricDividerVertical, { backgroundColor: 'rgba(255, 255, 255, 0.22)' }]} />
            <View style={styles.metricCol}>
              <Text style={[styles.metricLabel, { color: 'rgba(255, 255, 255, 0.78)' }]}>ΑΥΤΟΝΟΜΙΑ</Text>
              <Text style={[styles.metricValue, { color: '#FFFFFF' }]}>
                {runwayDays} {runwayDays === 1 ? 'Ημέρα' : 'Ημέρες'}
              </Text>
            </View>
          </View>
        </View>

        {/* ΠΡΟΓΡΑΜΜΑΤΙΣΜΕΝΕΣ ΟΦΕΙΛΕΣ & ΟΡΙΑ (Ενιαίο μινιμαλιστικό module) */}
        <View style={[styles.unifiedModule, { borderColor: theme.hairline, backgroundColor: theme.surface }]}>
          {/* Αριστερή Στήλη: Προγραμματισμένα */}
          <TouchableOpacity
            style={styles.moduleColumn}
            onPress={onOpenRecurring || onOpenCalendar}
            activeOpacity={0.7}
          >
            <Text style={[styles.moduleTitle, { color: theme.textMuted }]}>ΠΡΟΓΡΑΜΜΑΤΙΣΜΕΝΑ</Text>
            <View style={styles.moduleList}>
              {scheduledItems.length === 0 ? (
                <Text style={[styles.emptyMetaText, { color: theme.textMuted }]}>Όλες οι οφειλές ενήμερες</Text>
              ) : (
                scheduledItems.map((item, idx) => (
                  <View key={item.id || idx} style={styles.scheduledItemLine}>
                    <Text style={[styles.itemText, { color: theme.textPrimary }]} numberOfLines={1}>
                      <Text style={styles.itemBold}>{item.description}</Text>
                      <Text style={{ color: theme.textMuted }}> · </Text>
                      <Text style={{ color: theme.textSecondary }}>{item.relativeText}</Text>
                      <Text style={{ color: theme.textMuted }}> · </Text>
                      <Text style={{ color: theme.crimson, fontWeight: '700' }}>€{item.amount.toFixed(2)}</Text>
                    </Text>
                  </View>
                ))
              )}
            </View>
          </TouchableOpacity>

          {/* Κάθετος διαχωριστής */}
          <View style={[styles.columnDivider, { backgroundColor: theme.hairline }]} />

          {/* Δεξιά Στήλη: Προϋπολογισμός Κατηγοριών */}
          <TouchableOpacity
            style={styles.moduleColumn}
            onPress={onOpenExpenses}
            activeOpacity={0.7}
          >
            <Text style={[styles.moduleTitle, { color: theme.textMuted }]}>ΠΡΟΫΠΟΛΟΓΙΣΜΟΣ</Text>
            <View style={styles.moduleList}>
              {pacingDisplayItems.length === 0 ? (
                <Text style={[styles.emptyMetaText, { color: theme.textMuted }]}>Κανένα ενεργό όριο</Text>
              ) : (
                pacingDisplayItems.map((item, idx) => {
                  const percent = Math.min(100, Math.round((item.spent / (item.limit || 1)) * 100));
                  return (
                    <View key={item.id || idx} style={styles.pacingItemLine}>
                      <Text style={[styles.itemText, { color: theme.textPrimary }]} numberOfLines={1}>
                        <Text style={styles.itemBold}>{item.name}</Text>
                        <Text style={{ color: theme.textSecondary }}>: €{Math.round(item.spent)} / €{Math.round(item.limit)}</Text>
                      </Text>
                      <KineticProgressBar
                        progress={percent / 100}
                        height={3.5}
                        trackColor={theme.track}
                        fillColor={item.spent > item.limit ? theme.crimson : theme.emerald}
                        duration={800}
                        delay={idx * 120}
                        style={{ marginTop: 3 }}
                      />
                    </View>
                  );
                })
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* ΠΡΟΣΦΑΤΕΣ ΣΥΝΑΛΛΑΓΕΣ (Ανοιχτό Ledger χωρίς εξωτερικό κουτί) */}
        <View style={styles.openLedgerSection}>
          <View style={styles.ledgerHeaderRow}>
            <Text style={[styles.ledgerSectionTitle, { color: theme.textPrimary }]}>
              Πρόσφατες Συναλλαγές
            </Text>
            <TouchableOpacity onPress={onOpenExpenses} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.ledgerAllLink, { color: theme.textSecondary }]}>
                ΟΛΕΣ ({transactions.length}) ↗
              </Text>
            </TouchableOpacity>
          </View>

          {/* Γραμμές Συναλλαγών */}
          {transactions.length === 0 ? (
            <View style={styles.emptyLedgerState}>
              <Text style={[styles.emptyMetaText, { color: theme.textMuted }]}>
                Δεν υπάρχουν πρόσφατες συναλλαγές
              </Text>
            </View>
          ) : (
            transactions.slice(0, 7).map((tx, idx, arr) => {
              const isLast = idx === arr.length - 1;
              const isIncome = tx.type === 'income';
              return (
                <TouchableOpacity
                  key={tx.id}
                  style={[
                    styles.ledgerRow,
                    { borderBottomColor: theme.hairline },
                    !isLast && { borderBottomWidth: 1 },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setEditingTx(tx)}
                  onLongPress={() => setDeletingTx(tx)}
                  delayLongPress={350}
                >
                  <View style={styles.ledgerDescCol}>
                    <Text style={[styles.ledgerDescText, { color: theme.textPrimary }]} numberOfLines={1}>
                      {tx.description || 'Συναλλαγή'}
                    </Text>
                    <Text style={[styles.ledgerCategoryText, { color: theme.textMuted }]} numberOfLines={1}>
                      {tx.category_name || getCategoryName(tx.category_id)}
                    </Text>
                  </View>
                  <View style={styles.ledgerAmountCol}>
                    <Text
                      style={[
                        styles.ledgerAmountText,
                        { color: isIncome ? theme.emerald : theme.textPrimary },
                      ]}
                    >
                      {isIncome ? '+' : '-'}€{tx.amount.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 100 }} />
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
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 32,
  },

  // ─── HERO CANVAS (Fully Pink Background Card) ──────────────────────
  heroCanvas: {
    borderRadius: 22,
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 18,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  balanceCoinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 90,
  },
  balanceTextCol: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  totalLiquidityText: {
    fontFamily: fonts.heading,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1.2,
    lineHeight: 44,
  },
  tierQuoteText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  coinStageHolder: {
    width: 126,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 14,
  },
  metricCol: {
    flex: 1,
  },
  metricDividerVertical: {
    width: 1,
    height: 28,
    marginHorizontal: 8,
  },
  metricLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metricValue: {
    fontFamily: fonts.heading,
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: -0.2,
  },

  // ─── UNIFIED 2-COL MODULE (Minimalist, Hairline Divider) ──────────────
  unifiedModule: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  moduleColumn: {
    flex: 1,
  },
  columnDivider: {
    width: 1,
    marginHorizontal: 12,
  },
  moduleTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  moduleList: {
    gap: 8,
  },
  scheduledItemLine: {
    paddingVertical: 1,
  },
  pacingItemLine: {
    gap: 3,
  },
  itemText: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 16,
  },
  itemBold: {
    fontFamily: fonts.bodyBold,
    fontWeight: '700',
  },
  microBarTrack: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
    marginTop: 2,
    width: '100%',
  },
  microBarFill: {
    height: 3,
    borderRadius: 1.5,
  },
  emptyMetaText: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontStyle: 'italic',
    paddingVertical: 6,
  },

  // ─── OPEN LEDGER (Borderless, Continuous List) ────────────────────────
  openLedgerSection: {
    paddingTop: 4,
  },
  ledgerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
  },
  ledgerSectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  ledgerAllLink: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  emptyLedgerState: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  ledgerDescCol: {
    flex: 1,
    paddingRight: 12,
  },
  ledgerDescText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  ledgerCategoryText: {
    fontFamily: fonts.body,
    fontSize: 11.5,
  },
  ledgerAmountCol: {
    alignItems: 'flex-end',
  },
  ledgerAmountText: {
    fontFamily: fonts.heading,
    fontSize: 14,
    fontWeight: '900',
  },
});
