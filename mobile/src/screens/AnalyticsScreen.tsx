import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { fonts } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';
import { Transaction, Account, Budget, Task, Goal } from '../types';
import { AppTopHeader } from '../components/AppTopHeader';
import {
  BarChartIcon,
  ExpensesIcon,
  CheckIcon,
  ChevronRightIcon,
} from '../components/VectorIcons';

interface AnalyticsScreenProps {
  transactions: Transaction[];
  accounts: Account[];
  budgets?: Budget[];
  tasks?: Task[];
  goals?: Goal[];
  onOpenProfile?: () => void;
  onMenuPress?: () => void;
  avatarUrl?: string | null;
  onOpenTransactions?: () => void;
  onOpenGoals?: () => void;
}

type TimeWindow = 'all' | 'month' | '30d' | '7d';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  transactions = [],
  accounts = [],
  budgets = [],
  tasks = [],
  goals = [],
  onOpenProfile,
  onMenuPress,
  avatarUrl,
  onOpenTransactions,
  onOpenGoals,
}) => {
  const { theme } = useTheme();
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('all');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  // 1. Filter Transactions strictly based on Real Dates & Selected Time Window
  const filteredTransactions = useMemo(() => {
    if (timeWindow === 'all') return transactions;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions.filter((t) => {
      const txDate = new Date(t.date);
      if (isNaN(txDate.getTime())) return true; // keep if invalid date format

      if (timeWindow === 'month') {
        return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
      }

      if (timeWindow === '30d') {
        const diffMs = now.getTime() - txDate.getTime();
        return diffMs >= 0 && diffMs <= 30 * 24 * 60 * 60 * 1000;
      }

      if (timeWindow === '7d') {
        const diffMs = now.getTime() - txDate.getTime();
        return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
      }

      return true;
    });
  }, [transactions, timeWindow]);

  // 2. Real Financial Metrics computed strictly from filtered transactions
  const metrics = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    let expenseTxCount = 0;
    let incomeTxCount = 0;

    filteredTransactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') {
        totalIncome += amt;
        incomeTxCount += 1;
      } else if (tx.type === 'expense') {
        totalExpenses += amt;
        expenseTxCount += 1;
      }
    });

    const netCashflow = totalIncome - totalExpenses;
    const savingsRate =
      totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;
    const avgExpenseTx = expenseTxCount > 0 ? totalExpenses / expenseTxCount : 0;

    return {
      totalIncome,
      totalExpenses,
      netCashflow,
      savingsRate,
      expenseTxCount,
      incomeTxCount,
      totalCount: filteredTransactions.length,
      avgExpenseTx,
    };
  }, [filteredTransactions]);

  // 3. Real 7-Day Spending Breakdown (using real calendar dates & real expenses)
  const last7DaysData = useMemo(() => {
    const days: {
      dayLabel: string;
      dateIso: string;
      displayDate: string;
      amount: number;
    }[] = [];

    const dayNames = ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const dayLabel = i === 0 ? 'Σήμερα' : dayNames[d.getDay()];
      const displayDate = `${d.getDate()}/${d.getMonth() + 1}`;

      // Sum real expenses that match this ISO date string
      const dayExpense = transactions
        .filter((t) => t.type === 'expense' && t.date && t.date.split('T')[0] === iso)
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      days.push({
        dayLabel,
        dateIso: iso,
        displayDate,
        amount: dayExpense,
      });
    }

    const maxDayAmount = Math.max(...days.map((d) => d.amount), 1);

    return { days, maxDayAmount };
  }, [transactions]);

  // 4. Real Category Spending Breakdown
  const categoryBreakdown = useMemo(() => {
    const catMap = new Map<string, { name: string; color: string; amount: number; count: number }>();

    filteredTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const catName = t.category_name || 'Γενικά';
        const color = t.category_color || '#E11D74';
        const amt = Number(t.amount) || 0;

        if (catMap.has(catName)) {
          const prev = catMap.get(catName)!;
          catMap.set(catName, {
            ...prev,
            amount: prev.amount + amt,
            count: prev.count + 1,
          });
        } else {
          catMap.set(catName, {
            name: catName,
            color,
            amount: amt,
            count: 1,
          });
        }
      });

    const items = Array.from(catMap.values()).sort((a, b) => b.amount - a.amount);
    const totalSpent = metrics.totalExpenses;

    return items.map((cat) => ({
      ...cat,
      percentage: totalSpent > 0 ? Math.round((cat.amount / totalSpent) * 100) : 0,
    }));
  }, [filteredTransactions, metrics.totalExpenses]);

  // 5. Real Net Liquidity & Net Worth across Accounts
  const netWorthSummary = useMemo(() => {
    let totalAssets = 0;
    let totalLiabilities = 0;

    accounts.forEach((acc) => {
      const bal = Number(acc.balance) || 0;
      if (bal >= 0) {
        totalAssets += bal;
      } else {
        totalLiabilities += Math.abs(bal);
      }
    });

    const netWorth = totalAssets - totalLiabilities;
    return {
      totalAssets,
      totalLiabilities,
      netWorth,
    };
  }, [accounts]);

  // 6. Real Task Execution Rate
  const taskAnalytics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, rate };
  }, [tasks]);

  // Format currency helper (Greek locale)
  const fmt = (n: number) =>
    `€${Math.abs(n).toLocaleString('el-GR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const totalFlow = metrics.totalIncome + metrics.totalExpenses;
  const incomePercent = totalFlow > 0 ? Math.round((metrics.totalIncome / totalFlow) * 100) : 50;
  const expensePercent = totalFlow > 0 ? 100 - incomePercent : 50;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <AppTopHeader
        title="Αναλύσεις & Κατανοήσεις"
        onMenuPress={onMenuPress}
        onProfilePress={onOpenProfile}
        avatarUrl={avatarUrl}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Time Window Segmented Control */}
        <View style={styles.segmentedControl}>
          {(
            [
              { key: 'all', label: 'Όλες' },
              { key: 'month', label: 'Τρέχων Μήνας' },
              { key: '30d', label: 'Τελ. 30 μέρες' },
              { key: '7d', label: 'Τελ. 7 μέρες' },
            ] as const
          ).map((seg) => {
            const isActive = timeWindow === seg.key;
            return (
              <TouchableOpacity
                key={seg.key}
                style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                onPress={() => setTimeWindow(seg.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.segmentBtnText, isActive && styles.segmentBtnTextActive]}
                >
                  {seg.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 1. Cashflow Summary Hero Card (Pure Pink Hero Canvas) */}
        <View style={[styles.heroCard, { backgroundColor: theme.brandPink, borderWidth: 0 }]}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={[styles.heroLabel, { color: 'rgba(255, 255, 255, 0.85)' }]}>ΚΑΘΑΡΗ ΤΑΜΕΙΑΚΗ ΡΟΗ</Text>
              <Text style={[styles.heroAmount, { color: '#FFFFFF' }]}>
                {metrics.netCashflow < 0 ? '-' : '+'}
                {fmt(metrics.netCashflow)}
              </Text>
            </View>

            <View style={[styles.savingsRateBadge, { backgroundColor: 'rgba(255, 255, 255, 0.20)', borderColor: 'rgba(255, 255, 255, 0.35)' }]}>
              <Text style={[styles.savingsRateLabel, { color: 'rgba(255, 255, 255, 0.85)' }]}>Αποταμίευση</Text>
              <Text style={[styles.savingsRateValue, { color: '#FFFFFF' }]}>{metrics.savingsRate}%</Text>
            </View>
          </View>

          {/* Real Inflow vs Outflow Mini-Cards with clean translucent styling */}
          <View style={styles.flowRow}>
            <View style={[styles.flowCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 0 }]}>
              <View style={styles.flowCardHeader}>
                <View style={[styles.flowDot, { backgroundColor: '#A7F3D0' }]} />
                <Text style={[styles.flowLabel, { color: 'rgba(255, 255, 255, 0.85)' }]}>Συνολικές Εισροές</Text>
              </View>
              <Text style={[styles.flowValue, { color: '#A7F3D0' }]}>
                {fmt(metrics.totalIncome)}
              </Text>
              <Text style={[styles.flowSub, { color: 'rgba(255, 255, 255, 0.70)' }]}>{metrics.incomeTxCount} πιστώσεις</Text>
            </View>

            <View style={[styles.flowCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 0 }]}>
              <View style={styles.flowCardHeader}>
                <View style={[styles.flowDot, { backgroundColor: '#FECDD3' }]} />
                <Text style={[styles.flowLabel, { color: 'rgba(255, 255, 255, 0.85)' }]}>Συνολικές Εκροές</Text>
              </View>
              <Text style={[styles.flowValue, { color: '#FECDD3' }]}>
                {fmt(metrics.totalExpenses)}
              </Text>
              <Text style={[styles.flowSub, { color: 'rgba(255, 255, 255, 0.70)' }]}>{metrics.expenseTxCount} χρεώσεις</Text>
            </View>
          </View>

          {/* Inflow vs Outflow Visual Balance Bar */}
          {totalFlow > 0 && (
            <View style={styles.distributionBlock}>
              <View style={styles.distributionBar}>
                <View
                  style={[styles.distributionSegment, { width: `${incomePercent}%`, backgroundColor: '#A7F3D0' }]}
                />
                <View
                  style={[styles.distributionSegment, { width: `${expensePercent}%`, backgroundColor: '#FECDD3' }]}
                />
              </View>
              <View style={styles.distributionLabels}>
                <Text style={[styles.distributionSubText, { color: 'rgba(255, 255, 255, 0.85)' }]}>Εισροές: {incomePercent}%</Text>
                <Text style={[styles.distributionSubText, { color: 'rgba(255, 255, 255, 0.85)' }]}>Εκροές: {expensePercent}%</Text>
              </View>
            </View>
          )}
        </View>

        {/* 2. 7-Day Real Spending Bar Chart */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderWidth: 0 }]}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={[styles.sectionCardTitle, { color: theme.textPrimary }]}>Ημερήσια Έξοδα 7 Ημερών</Text>
              <Text style={[styles.sectionCardSubtitle, { color: theme.textMuted }]}>
                Καταγεγραμμένα έξοδα ανά ημερολογιακή ημέρα
              </Text>
            </View>
            <View style={[styles.chartBadge, { backgroundColor: theme.track, borderColor: theme.hairline }]}>
              <BarChartIcon size={16} color={theme.brandPink} />
            </View>
          </View>

          {/* Interactive Bar Chart */}
          <View style={styles.barChartContainer}>
            {last7DaysData.days.map((item, idx) => {
              const isSelected = selectedDayIndex === idx;
              const barHeightPct =
                item.amount > 0
                  ? Math.max(12, Math.round((item.amount / last7DaysData.maxDayAmount) * 100))
                  : 4;

              return (
                <TouchableOpacity
                  key={item.dateIso}
                  style={styles.barColumn}
                  onPress={() => setSelectedDayIndex(isSelected ? null : idx)}
                  activeOpacity={0.7}
                >
                  {/* Tooltip on select */}
                  {isSelected && (
                    <View style={[styles.barTooltip, { backgroundColor: theme.textPrimary }]}>
                      <Text style={[styles.barTooltipText, { color: theme.textInverse }]}>{fmt(item.amount)}</Text>
                    </View>
                  )}

                  {/* Bar Fill */}
                  <View style={[styles.barTrack, { backgroundColor: theme.track }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${barHeightPct}%`,
                          backgroundColor:
                            isSelected || item.dayLabel === 'Σήμερα'
                              ? theme.brandPink
                              : item.amount > 0
                              ? `${theme.brandPink}80`
                              : theme.hairline,
                        },
                      ]}
                    />
                  </View>

                  <Text
                    style={[
                      styles.barDayText,
                      { color: isSelected ? theme.textPrimary : theme.textSecondary },
                      isSelected && styles.barDayTextActive,
                    ]}
                  >
                    {item.dayLabel}
                  </Text>
                  <Text style={[styles.barDateText, { color: theme.textMuted }]}>{item.displayDate}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedDayIndex !== null && (
            <View style={[styles.selectedDayDetail, { backgroundColor: theme.track, borderColor: theme.hairline }]}>
              <Text style={[styles.selectedDayDetailText, { color: theme.textSecondary }]}>
                {last7DaysData.days[selectedDayIndex].dayLabel} (
                {last7DaysData.days[selectedDayIndex].dateIso}):{' '}
                <Text style={{ fontWeight: '800', color: theme.textPrimary }}>
                  {fmt(last7DaysData.days[selectedDayIndex].amount)}
                </Text>{' '}
                δαπανήθηκαν
              </Text>
            </View>
          )}
        </View>

        {/* 3. Category Spending Breakdown (Real Data) */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderWidth: 0 }]}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={[styles.sectionCardTitle, { color: theme.textPrimary }]}>Έξοδα ανά Κατηγορία</Text>
              <Text style={[styles.sectionCardSubtitle, { color: theme.textMuted }]}>
                {categoryBreakdown.length} ενεργές κατηγορίες εξόδων στην περίοδο
              </Text>
            </View>
            {onOpenTransactions && (
              <TouchableOpacity onPress={onOpenTransactions} activeOpacity={0.7}>
                <Text style={[styles.actionLinkText, { color: theme.brandPink }]}>Συναλλαγές ›</Text>
              </TouchableOpacity>
            )}
          </View>

          {categoryBreakdown.length === 0 ? (
            <View style={styles.emptyState}>
              <ExpensesIcon size={24} color={theme.textMuted} />
              <Text style={[styles.emptyStateTitle, { color: theme.textPrimary }]}>Χωρίς Δεδομένα Εξόδων</Text>
              <Text style={[styles.emptyStateSub, { color: theme.textSecondary }]}>
                Δεν βρέθηκαν έξοδα για αυτή την περίοδο. Καταχωρίστε μια συναλλαγή για να δείτε την ανάλυση.
              </Text>
            </View>
          ) : (
            <View style={styles.categoryList}>
              {categoryBreakdown.map((cat) => (
                <View key={cat.name} style={styles.catItem}>
                  <View style={styles.catItemTop}>
                    <View style={styles.catItemLeft}>
                      <View
                        style={[styles.catColorDot, { backgroundColor: cat.color }]}
                      />
                      <Text style={[styles.catName, { color: theme.textPrimary }]} numberOfLines={1}>
                        {cat.name}
                      </Text>
                      <Text style={[styles.catCount, { color: theme.textMuted }]}>({cat.count} συναλλ.)</Text>
                    </View>

                    <View style={styles.catItemRight}>
                      <Text style={[styles.catAmount, { color: theme.textPrimary }]}>{fmt(cat.amount)}</Text>
                      <Text style={[styles.catPercent, { color: theme.textSecondary }]}>{cat.percentage}%</Text>
                    </View>
                  </View>

                  {/* Horizontal Bar */}
                  <View style={[styles.catBarTrack, { backgroundColor: theme.track }]}>
                    <View
                      style={[
                        styles.catBarFill,
                        {
                          width: `${Math.min(100, Math.max(3, cat.percentage))}%`,
                          backgroundColor: cat.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 4. Real Net Worth & Liquidity Overview */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderWidth: 0 }]}>
          <Text style={[styles.sectionCardTitle, { color: theme.textPrimary }]}>Καθαρή Ρευστότητα & Περιουσία</Text>
          <Text style={[styles.sectionCardSubtitle, { color: theme.textMuted }]}>
            Συγκεντρωτικά από {accounts.length} συνδεδεμένους λογαριασμούς
          </Text>

          <View style={styles.liquidityGrid}>
            <View style={[styles.liquidityBox, { backgroundColor: theme.emeraldBg }]}>
              <Text style={[styles.liquidityLabel, { color: theme.emerald }]}>ΕΝΕΡΓΗΤΙΚΟ</Text>
              <Text style={[styles.liquidityValue, { color: theme.emerald }]}>
                {fmt(netWorthSummary.totalAssets)}
              </Text>
            </View>

            <View style={[styles.liquidityBox, { backgroundColor: theme.crimsonBg }]}>
              <Text style={[styles.liquidityLabel, { color: theme.crimson }]}>ΥΠΟΧΡΕΩΣΕΙΣ</Text>
              <Text style={[styles.liquidityValue, { color: theme.crimson }]}>
                {fmt(netWorthSummary.totalLiabilities)}
              </Text>
            </View>

            <View style={[styles.liquidityBox, { backgroundColor: theme.track }]}>
              <Text style={[styles.liquidityLabel, { color: theme.textSecondary }]}>ΚΑΘΑΡΗ ΘΕΣΗ</Text>
              <Text style={[styles.liquidityValue, { color: theme.textPrimary }]}>
                {netWorthSummary.netWorth < 0 ? '-' : ''}
                {fmt(netWorthSummary.netWorth)}
              </Text>
            </View>
          </View>
        </View>

        {/* 5. Productivity & Focus Velocity */}
        {tasks.length > 0 && (
          <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderWidth: 0 }]}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={[styles.sectionCardTitle, { color: theme.textPrimary }]}>Παραγωγικότητα & Ρυθμός Εργασιών</Text>
                <Text style={[styles.sectionCardSubtitle, { color: theme.textMuted }]}>
                  {taskAnalytics.completed} από {taskAnalytics.total} ολοκληρώθηκαν ({taskAnalytics.rate}%)
                </Text>
              </View>
              <View style={[styles.checkBadge, { backgroundColor: theme.emeraldBg, borderColor: theme.emeraldBorder }]}>
                <CheckIcon size={14} color={theme.emerald} />
              </View>
            </View>

            <View style={[styles.taskProgressBarTrack, { backgroundColor: theme.track }]}>
              <View
                style={[
                  styles.taskProgressBarFill,
                  { width: `${taskAnalytics.rate}%`, backgroundColor: theme.emerald },
                ]}
              />
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F4F4F5',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  segmentBtnText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    fontWeight: '600',
    color: '#71717A',
  },
  segmentBtnTextActive: {
    fontFamily: fonts.bodyBold,
    color: '#0A0A0A',
    fontWeight: '700',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    fontWeight: '600',
    color: '#71717A',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heroAmount: {
    fontFamily: fonts.heading,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.6,
    marginTop: 4,
  },
  incomeGreen: {
    color: '#059669',
  },
  expenseRed: {
    color: '#E11D48',
  },
  savingsRateBadge: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  savingsRateLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.3,
  },
  savingsRateValue: {
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '900',
    color: '#059669',
    marginTop: 1,
  },
  flowRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  flowCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  inflowCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  outflowCard: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  flowCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  flowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  flowLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    fontWeight: '600',
    color: '#71717A',
  },
  flowValue: {
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '900',
  },
  flowSub: {
    fontFamily: fonts.bodyLight,
    fontSize: 10,
    color: '#A1A1AA',
    marginTop: 2,
    fontWeight: '500',
  },
  distributionBlock: {
    marginTop: 4,
  },
  distributionBar: {
    height: 6,
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#F4F4F5',
  },
  distributionSegment: {
    height: '100%',
  },
  distributionLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  distributionSubText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    fontWeight: '600',
    color: '#71717A',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionCardTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '900',
    color: '#0A0A0A',
    letterSpacing: -0.3,
  },
  sectionCardSubtitle: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  chartBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  actionLinkText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    fontWeight: '600',
    color: '#0A0A0A',
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 24,
    paddingBottom: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  barTrack: {
    width: 18,
    height: 90,
    backgroundColor: '#F4F4F5',
    borderRadius: 9,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    width: '100%',
    borderRadius: 9,
  },
  barDayText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    fontWeight: '600',
    color: '#71717A',
  },
  barDayTextActive: {
    fontFamily: fonts.bodyBold,
    color: '#0A0A0A',
    fontWeight: '800',
  },
  barDateText: {
    fontFamily: fonts.bodyLight,
    fontSize: 9,
    color: '#A1A1AA',
    marginTop: 1,
  },
  barTooltip: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 10,
  },
  barTooltipText: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  selectedDayDetail: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  selectedDayDetailText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#71717A',
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyStateTitle: {
    fontFamily: fonts.heading,
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0A0A',
    marginTop: 4,
  },
  emptyStateSub: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    color: '#71717A',
    textAlign: 'center',
  },
  categoryList: {
    gap: 14,
  },
  catItem: {
    gap: 6,
  },
  catItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  catColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#0A0A0A',
  },
  catCount: {
    fontFamily: fonts.bodyLight,
    fontSize: 11,
    color: '#71717A',
  },
  catItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catAmount: {
    fontFamily: fonts.heading,
    fontSize: 13,
    fontWeight: '900',
    color: '#0A0A0A',
  },
  catPercent: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    fontWeight: '700',
    color: '#71717A',
    minWidth: 32,
    textAlign: 'right',
  },
  catBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F4F4F5',
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  liquidityGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  liquidityBox: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
  },
  liquidityLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    fontWeight: '700',
    color: '#71717A',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  liquidityValue: {
    fontFamily: fonts.heading,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  taskProgressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F4F4F5',
    overflow: 'hidden',
    marginTop: 4,
  },
  taskProgressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#059669',
  },
});
