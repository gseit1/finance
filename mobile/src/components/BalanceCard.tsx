import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { Task, Goal } from '../types';
import {
  CheckIcon,
  AccountsIcon,
  ExpensesIcon,
  ChevronRightIcon,
  PlusIcon,
  BellIcon,
} from './VectorIcons';
import { KineticVaultToken } from './KineticVaultToken';

interface BalanceCardProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  transactionCount?: number;
  accountCount?: number;
  userName?: string;
  focusTask?: Task | null;
  firstGoal?: Goal | null;
  pendingTaskCount?: number;
  todayEventsCount?: number;
  upcomingBill?: { description: string; amount: number; dueNotice: string } | null;
  onAddTransaction: () => void;
  onOpenTasks?: () => void;
  onOpenExpenses?: () => void;
  onOpenAccounts?: () => void;
  onOpenCalendar?: () => void;
  onOpenAnalytics?: () => void;
  onOpenGoals?: () => void;
  onNotificationPress?: () => void;
  onMenuPress?: () => void;
  avatarUrl?: string | null;
  onOpenProfile?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  totalBalance,
  monthlyIncome,
  monthlyExpense,
  transactionCount = 12,
  accountCount = 4,
  userName = 'Hitesh Tapaniya',
  focusTask,
  firstGoal,
  pendingTaskCount = 4,
  todayEventsCount = 2,
  upcomingBill,
  onAddTransaction,
  onOpenTasks,
  onOpenExpenses,
  onOpenAccounts,
  onOpenCalendar,
  onOpenAnalytics,
  onOpenGoals,
  onNotificationPress,
  onMenuPress,
  avatarUrl,
  onOpenProfile,
}) => {
  // Clean currency formatter
  const formatCurrency = (val: number) => {
    return `€${Math.abs(val).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  // Calculation of remaining days in current month (until next payment/month-end)
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, lastDayOfMonth - today.getDate());
  const dailyAllowance = Math.max(0, Math.round(totalBalance / daysRemaining));
  const monthDay = today.getDate();
  const monthProgress = Math.min(100, Math.max(0, Math.round((monthDay / lastDayOfMonth) * 100)));

  // Financial Tier determination based on current balance and remaining days
  const getFinancialStatus = (balance: number) => {
    if (balance >= 700) {
      return {
        tier: 1,
        quote: 'Μπροσκι ρίχτο έξω, σε παίρνει ακόμα',
        badge: 'Άνετος',
        badgeColor: '#ECFDF5',
        badgeTextColor: '#059669',
        badgeBorder: '#A7F3D0',
        progressColor: '#059669',
      };
    } else if (balance >= 400) {
      return {
        tier: 2,
        quote: 'Μπροσκι ο μήνας έχει μέρες ακόμα..τσιλ.',
        badge: 'Τσιλ',
        badgeColor: '#F4F4F5',
        badgeTextColor: '#52525B',
        badgeBorder: '#E4E4E7',
        progressColor: '#71717A',
      };
    } else if (balance >= 100) {
      return {
        tier: 3,
        quote: 'Επ δικέ μου, είσαι δυσκολα',
        badge: 'Προσοχή',
        badgeColor: '#FFFBEB',
        badgeTextColor: '#B45309',
        badgeBorder: '#FDE68A',
        progressColor: '#D97706',
      };
    } else {
      return {
        tier: 4,
        quote: 'μπροσκι θες 1 ευρω να παρεις τυροπιτα;',
        badge: 'Τυρόπιτα Mode',
        badgeColor: '#FFF1F2',
        badgeTextColor: '#E11D48',
        badgeBorder: '#FECDD3',
        progressColor: '#E11D48',
      };
    }
  };

  const status = getFinancialStatus(totalBalance);

  return (
    <View style={styles.container}>
      {/* 1. Hero Card: Financial Status Tier & Monthly Runway */}
      <TouchableOpacity
        style={styles.heroCard}
        activeOpacity={0.92}
        onPress={onOpenAccounts || onOpenAnalytics || onOpenExpenses}
      >
        {/* Left Side: Greek Status Tier Quote & Monthly Runway */}
        <View style={styles.heroLeftContent}>
          <View style={styles.heroTopStatusRow}>
            <Text style={styles.heroLabel}>RUNWAY ΜΗΝΑ</Text>
            <View
              style={[
                styles.tierBadge,
                {
                  backgroundColor: status.badgeColor,
                  borderColor: status.badgeBorder,
                },
              ]}
            >
              <Text style={[styles.tierBadgeText, { color: status.badgeTextColor }]}>
                {status.badge}
              </Text>
            </View>
          </View>

          <Text style={styles.heroTitle} numberOfLines={3}>
            "{status.quote}"
          </Text>

          <Text style={styles.heroMetricsSub}>
            €{dailyAllowance}/ημέρα • {daysRemaining} μέρες για πληρωμή
          </Text>

          <View style={styles.heroProgressBlock}>
            <View style={styles.heroProgressRow}>
              <View style={styles.heroProgressBarTrack}>
                <View
                  style={[
                    styles.heroProgressBarFill,
                    {
                      width: `${monthProgress}%`,
                      backgroundColor: status.progressColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.heroProgressPercent}>
                {daysRemaining} {daysRemaining === 1 ? 'μέρα' : 'μέρες'}
              </Text>
            </View>
          </View>
        </View>

        {/* Right Side: Kinetic Vault & Floating Euro Token */}
        <View style={styles.heroVaultWrapper} pointerEvents="none">
          <KineticVaultToken />
        </View>
      </TouchableOpacity>

      {/* 3. Bento Grid - Row 1: Tasks & Expenses of Month (2-Columns) */}
      <View style={styles.gridRow}>
        {/* Card A: Tasks */}
        <TouchableOpacity
          style={styles.gridCard}
          activeOpacity={0.85}
          onPress={onOpenTasks}
        >
          <View style={styles.gridCardTop}>
            <View>
              <Text style={styles.gridCardLabel}>Tasks</Text>
              <Text style={styles.gridCardNumber}>{pendingTaskCount}</Text>
            </View>
            <View style={styles.tasksIconBadge}>
              <CheckIcon size={16} color="#0A0A0A" />
            </View>
          </View>
          <Text style={styles.gridCardSub}>Remaining</Text>
        </TouchableOpacity>

        {/* Card B: Expenses of Month (Requested: Display Total Expenses Amount) */}
        <TouchableOpacity
          style={styles.gridCard}
          activeOpacity={0.85}
          onPress={onOpenExpenses}
        >
          <View style={styles.gridCardTop}>
            <View>
              <Text style={styles.gridCardLabel}>Expenses of Month</Text>
              <Text style={[styles.gridCardNumber, { color: '#E11D48' }]}>{formatCurrency(monthlyExpense)}</Text>
            </View>
            <View style={styles.expensesIconBadge}>
              <ExpensesIcon size={16} color="#E11D48" />
            </View>
          </View>
          <Text style={styles.gridCardSub}>This Month</Text>
        </TouchableOpacity>
      </View>

      {/* 4. Bento Grid - Row 2: Balance Total Wide Card (Requested: Balance Total) */}
      <TouchableOpacity
        style={styles.wideCard}
        activeOpacity={0.85}
        onPress={onOpenAccounts}
      >
        <View style={styles.wideCardLeft}>
          <Text style={styles.gridCardLabel}>Balance Total</Text>
          <Text style={styles.wideCardNumber}>{formatCurrency(totalBalance)}</Text>
          <Text style={styles.gridCardSub}>{accountCount} Active Repositories</Text>
        </View>

        <View style={styles.wideCardRight}>
          <View style={styles.mintIconBadge}>
            <AccountsIcon size={18} color="#059669" />
          </View>
          {/* Circular Donut Ring Indicator */}
          <View style={styles.donutRing}>
            <View style={styles.donutRingInner}>
              <Text style={styles.donutText}>100%</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* (Row 3: Focus Time and Completed has been deleted as requested!) */}

      {/* 5. Upcoming Meeting / Bill Strip Card */}
      {upcomingBill && (
        <TouchableOpacity
          style={styles.upcomingCard}
          activeOpacity={0.85}
          onPress={onOpenCalendar || onOpenAccounts}
        >
          <View style={styles.amberIconBadge}>
            <Text style={styles.amberGlyph}>👥</Text>
          </View>

          <View style={styles.upcomingCenter}>
            <Text style={styles.upcomingLabel}>Upcoming</Text>
            <Text style={styles.upcomingTitle} numberOfLines={1}>
              {upcomingBill.description}
            </Text>
            <Text style={styles.upcomingTime}>
              {upcomingBill.dueNotice} • €{upcomingBill.amount.toFixed(2)}
            </Text>
          </View>

          <View style={styles.chevronButton}>
            <ChevronRightIcon size={16} color="#6B7280" />
          </View>
        </TouchableOpacity>
      )}

      {/* Quick Action Button */}
      <TouchableOpacity
        style={styles.primaryAddBtn}
        onPress={onAddTransaction}
        activeOpacity={0.88}
      >
        <PlusIcon size={18} color="#FFFFFF" />
        <Text style={styles.primaryAddBtnText}>Log New Transaction</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  // 1. Architectural Crisp White Structural Hero Card
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    minHeight: 185,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    padding: 20,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    flexDirection: 'row',
  },
  heroLeftContent: {
    width: '58%',
    zIndex: 2,
    justifyContent: 'space-between',
  },
  heroTopStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 6,
  },
  heroLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10.5,
    color: '#71717A',
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tierBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 7,
    borderWidth: 1,
  },
  tierBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '900',
    color: '#0A0A0A',
    letterSpacing: -0.3,
    lineHeight: 24,
    marginTop: 4,
    marginBottom: 6,
  },
  heroMetricsSub: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11.5,
    color: '#71717A',
    fontWeight: '600',
    marginBottom: 10,
  },
  heroProgressBlock: {
    marginTop: 'auto',
  },
  heroProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroProgressBarTrack: {
    width: 95,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F4F4F5',
    overflow: 'hidden',
  },
  heroProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  heroProgressPercent: {
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0A0A0A',
    marginLeft: 8,
  },
  heroVaultWrapper: {
    position: 'absolute',
    right: 6,
    top: 0,
    bottom: 0,
    width: 155,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 3. Bento Grid Styles (Zero Puffy Shadows, 1px Hairline Borders)
  gridRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    justifyContent: 'space-between',
  },
  gridCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  gridCardLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: '#71717A',
    fontWeight: '600',
    marginBottom: 2,
  },
  gridCardNumber: {
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '900',
    color: '#0A0A0A',
    letterSpacing: -0.4,
  },
  gridCardSub: {
    fontFamily: fonts.bodyLight,
    fontSize: 11,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  tasksIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  expensesIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  wideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wideCardLeft: {
    flex: 1,
  },
  wideCardNumber: {
    fontFamily: fonts.heading,
    fontSize: 22,
    fontWeight: '900',
    color: '#0A0A0A',
    letterSpacing: -0.4,
    marginVertical: 2,
  },
  wideCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mintIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  donutRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutRingInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  upcomingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    flexDirection: 'row',
    alignItems: 'center',
  },
  amberIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  amberGlyph: {
    fontSize: 18,
  },
  upcomingCenter: {
    flex: 1,
    paddingRight: 8,
  },
  upcomingLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    fontWeight: '600',
    color: '#A1A1AA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  upcomingTitle: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0A0A',
    letterSpacing: -0.2,
    marginTop: 1,
  },
  upcomingTime: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  chevronButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 4. Primary Trigger Button (Pure Obsidian, Zero Puffy Shadows)
  primaryAddBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#0A0A0A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryAddBtnText: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});
