import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { Transaction, Category, Account, TransactionType } from '../types';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { AppTopHeader } from '../components/AppTopHeader';

interface ExpensesScreenProps {
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
  avatarUrl?: string | null;
}

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({
  transactions,
  categories,
  accounts,
  onAddTransaction,
  onOpenProfile,
  avatarUrl,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);

  const changeMonth = (delta: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setMonth(nextDate.getMonth() + delta);
    setSelectedDate(nextDate);
  };

  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return (
      selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth()
    );
  }, [selectedDate]);

  const monthName = useMemo(() => {
    return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [selectedDate]);

  // Filter transactions for this specific month & year
  const monthlyExpenses = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    return transactions.filter((tx) => {
      if (tx.type !== 'expense') return false;
      const txDate = new Date(tx.date);
      return txDate.getFullYear() === year && txDate.getMonth() === month;
    });
  }, [transactions, selectedDate]);

  // Aggregate Top Expense Categories
  const categoryBreakdown = useMemo(() => {
    const totals: Record<string, { category: Category; total: number; count: number }> = {};
    let totalMonthlyAmount = 0;

    monthlyExpenses.forEach((tx) => {
      totalMonthlyAmount += tx.amount;
      const catId = tx.category_id || 'other';
      const catObj =
        categories.find((c) => c.id === catId) || {
          id: 'other',
          name: tx.category_name || 'Other',
          type: 'expense' as const,
          icon: 'tag',
          color: '#FAFAFA',
        };

      if (!totals[catId]) {
        totals[catId] = { category: catObj, total: 0, count: 0 };
      }
      totals[catId].total += tx.amount;
      totals[catId].count += 1;
    });

    const list = Object.values(totals).map((item) => ({
      ...item,
      percentage: totalMonthlyAmount > 0 ? (item.total / totalMonthlyAmount) * 100 : 0,
    }));

    return {
      list: list.sort((a, b) => b.total - a.total),
      totalMonthlyAmount,
    };
  }, [monthlyExpenses, categories]);

  // Filtered transactions based on Category Chip
  const displayTransactions = useMemo(() => {
    if (selectedCategoryId === 'all') {
      return monthlyExpenses;
    }
    return monthlyExpenses.filter((tx) => tx.category_id === selectedCategoryId);
  }, [monthlyExpenses, selectedCategoryId]);

  const daysInMonth = useMemo(() => {
    return new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  }, [selectedDate]);

  const dailyAverage = useMemo(() => {
    return categoryBreakdown.totalMonthlyAmount > 0
      ? (categoryBreakdown.totalMonthlyAmount / daysInMonth).toFixed(2)
      : '0.00';
  }, [categoryBreakdown.totalMonthlyAmount, daysInMonth]);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <View style={styles.container}>
      {/* Global Notch & Status Bar Protected Top Header */}
      <AppTopHeader
        title="Spending"
        showPulse
        onProfilePress={onOpenProfile}
        avatarUrl={avatarUrl}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Month Navigator */}
        <View style={styles.monthNav}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => changeMonth(-1)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.monthCenter}>
            <Text style={styles.monthTitle}>{monthName}</Text>
            {!isCurrentMonth && (
              <TouchableOpacity onPress={() => setSelectedDate(new Date())}>
                <Text style={styles.todayText}>CURRENT MONTH</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => changeMonth(1)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 3-Column Unified Data Strip Card */}
        <View style={styles.dataStripCard}>
          <View style={styles.dataCol}>
            <Text style={styles.dataLabel}>TOTAL SPENT</Text>
            <Text style={[styles.dataValue, { color: colors.outflow }]}>
              ${categoryBreakdown.totalMonthlyAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.dataDivider} />

          <View style={styles.dataCol}>
            <Text style={styles.dataLabel}>DAILY AVG</Text>
            <Text style={styles.dataValue}>${dailyAverage}</Text>
          </View>

          <View style={styles.dataDivider} />

          <View style={styles.dataCol}>
            <Text style={styles.dataLabel}>COUNT</Text>
            <Text style={styles.dataValue}>{monthlyExpenses.length}</Text>
          </View>
        </View>

        {/* Top Expense Categories (Hairline Minimalist List) */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>TOP CATEGORIES</Text>

          {categoryBreakdown.list.length === 0 ? (
            <View style={styles.minimalEmptyBox}>
              <View style={styles.emptyGlyph}>
                <View style={styles.emptyGlyphBar} />
                <View style={[styles.emptyGlyphBar, { height: 10 }]} />
                <View style={[styles.emptyGlyphBar, { height: 6 }]} />
              </View>
              <Text style={styles.emptyText}>No activity recorded for {monthName}.</Text>
            </View>
          ) : (
            categoryBreakdown.list.slice(0, 4).map((item, index) => {
              const isOver = item.percentage >= 90;
              const isLast = index === Math.min(categoryBreakdown.list.length, 4) - 1;

              return (
                <View key={item.category.id} style={[styles.categoryRow, !isLast && styles.itemDivider]}>
                  <View style={styles.categoryTop}>
                    <Text style={styles.categoryName}>{item.category.name}</Text>
                    <Text style={styles.categoryFigures}>
                      ${item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                      <Text style={styles.categoryPercentage}>({item.percentage.toFixed(0)}%)</Text>
                    </Text>
                  </View>

                  {/* 3px Hairline Track */}
                  <View style={styles.track}>
                    <View
                      style={[
                        styles.fill,
                        {
                          width: `${Math.min(item.percentage, 100)}%`,
                          backgroundColor: isOver ? colors.outflow : '#FAFAFA',
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Minimal Category Filter Pills */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>FILTER CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsRow}>
            <TouchableOpacity
              style={[
                styles.filterPill,
                selectedCategoryId === 'all' && styles.activeFilterPill,
              ]}
              onPress={() => setSelectedCategoryId('all')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedCategoryId === 'all' && styles.activeFilterPillText,
                ]}
              >
                All ({monthlyExpenses.length})
              </Text>
            </TouchableOpacity>

            {expenseCategories.map((c) => {
              const isSelected = selectedCategoryId === c.id;
              const count = monthlyExpenses.filter((t) => t.category_id === c.id).length;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.filterPill,
                    isSelected && styles.activeFilterPill,
                  ]}
                  onPress={() => setSelectedCategoryId(c.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      isSelected && styles.activeFilterPillText,
                    ]}
                  >
                    {c.name} {count > 0 ? `(${count})` : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Unified Transactions Feed */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>
            ENTRIES ({displayTransactions.length})
          </Text>

          {displayTransactions.length === 0 ? (
            <View style={styles.minimalEmptyBox}>
              <Text style={styles.emptyText}>No matching expenses for this filter.</Text>
            </View>
          ) : (
            displayTransactions.map((tx, index) => {
              const isLast = index === displayTransactions.length - 1;
              return (
                <View key={tx.id} style={[styles.txItem, !isLast && styles.itemDivider]}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.iconLetter}>
                      {(tx.category_name || 'EX').slice(0, 1).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.txDetails}>
                    <Text style={styles.txDescription}>{tx.description}</Text>
                    <Text style={styles.txMeta}>
                      {tx.category_name} • {tx.account_name} •{' '}
                      {new Date(tx.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>

                  <Text style={styles.txAmount}>-${tx.amount.toFixed(2)}</Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+ Log Expense</Text>
      </TouchableOpacity>

      {/* Add Expense Modal */}
      <AddExpenseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={onAddTransaction}
        categories={categories}
        accounts={accounts}
        defaultDate={selectedDate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141416',
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 14,
  },
  arrowButton: {
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  arrowText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#A1A1AA',
  },
  monthCenter: {
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FAFAFA',
    letterSpacing: -0.3,
  },
  todayText: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#FAFAFA',
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 1,
  },
  dataStripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141416',
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 20,
  },
  dataCol: {
    flex: 1,
    alignItems: 'center',
  },
  dataLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1,
    color: '#71717A',
    fontWeight: '700',
    marginBottom: 4,
  },
  dataValue: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '800',
    color: '#FAFAFA',
    fontVariant: ['tabular-nums'],
  },
  dataDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionEyebrow: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#71717A',
    fontWeight: '700',
    marginBottom: 8,
  },
  categoryRow: {
    paddingVertical: 10,
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FAFAFA',
  },
  categoryFigures: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#FAFAFA',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  categoryPercentage: {
    fontSize: 10,
    color: '#71717A',
    fontWeight: '500',
  },
  track: {
    height: 3,
    backgroundColor: '#27272A',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 1.5,
  },
  pillsRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 6,
  },
  activeFilterPill: {
    borderColor: '#FAFAFA',
    backgroundColor: 'rgba(250, 250, 250, 0.1)',
  },
  filterPillText: {
    fontSize: 11,
    color: '#71717A',
    fontWeight: '600',
  },
  activeFilterPillText: {
    color: '#FAFAFA',
    fontWeight: '700',
  },
  minimalEmptyBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGlyph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 16,
    gap: 3,
    marginBottom: 8,
  },
  emptyGlyphBar: {
    width: 3,
    height: 16,
    backgroundColor: '#27272A',
    borderRadius: 1.5,
  },
  emptyText: {
    fontSize: 13,
    color: '#71717A',
    letterSpacing: -0.2,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconLetter: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
    color: '#FAFAFA',
  },
  txDetails: {
    flex: 1,
  },
  txDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FAFAFA',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  txMeta: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#71717A',
  },
  txAmount: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
    color: '#FAFAFA',
    fontVariant: ['tabular-nums'],
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 92,
    right: 20,
    backgroundColor: '#FAFAFA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    color: '#09090B',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
