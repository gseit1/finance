import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
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

  // 1st Goal Progress calculations (falling back to seeded goal if none set)
  const goalTitle = firstGoal?.name || 'Design New Landing Page';
  const goalTarget = firstGoal ? Number(firstGoal.target_amount) : 5000;
  const goalCurrent = firstGoal ? Number(firstGoal.current_amount) : 3500;
  const goalProgress = firstGoal
    ? Math.min(100, Math.max(0, Math.round((goalCurrent / (goalTarget || 1)) * 100)))
    : 70;

  return (
    <View style={styles.container}>
      {/* 1. Hero Focus Card: Displaying 1st Goal Progress + 3D Character */}
      <TouchableOpacity
        style={styles.heroCard}
        activeOpacity={0.92}
        onPress={onOpenGoals || onOpenAnalytics || onOpenTasks}
      >
        {/* Left Side: 1st Goal Progress Info */}
        <View style={styles.heroLeftContent}>
          <Text style={styles.heroLabel}>Today's Focus</Text>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {goalTitle}
          </Text>

          {firstGoal && (
            <Text style={styles.heroGoalAmountSub}>
              €{goalCurrent.toLocaleString()} of €{goalTarget.toLocaleString()} target
            </Text>
          )}

          <View style={styles.heroProgressBlock}>
            <Text style={styles.heroProgressLabel}>Progress</Text>
            <View style={styles.heroProgressRow}>
              <View style={styles.heroProgressBarTrack}>
                <View
                  style={[
                    styles.heroProgressBarFill,
                    { width: `${goalProgress}%` },
                  ]}
                />
              </View>
              <Text style={styles.heroProgressPercent}>{goalProgress}%</Text>
            </View>
          </View>
        </View>

        {/* Right Side: 3D Illustration Avatar with Transparent Background */}
        <View style={styles.heroAvatarWrapper} pointerEvents="none">
          <Image
            source={require('../assets/hero_avatar.png')}
            style={styles.heroAvatarImage}
            resizeMode="contain"
          />
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
    width: '56%',
    zIndex: 2,
    justifyContent: 'space-between',
  },
  heroLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: '#71717A',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: fonts.heading,
    fontSize: 22,
    fontWeight: '900',
    color: '#0A0A0A',
    letterSpacing: -0.4,
    lineHeight: 28,
    marginTop: 6,
    marginBottom: 4,
  },
  heroGoalAmountSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#71717A',
    fontWeight: '500',
    marginBottom: 12,
  },
  heroProgressBlock: {
    marginTop: 'auto',
  },
  heroProgressLabel: {
    fontFamily: fonts.bodyLight,
    fontSize: 11,
    color: '#71717A',
    fontWeight: '500',
    marginBottom: 6,
  },
  heroProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroProgressBarTrack: {
    width: 105,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F4F4F5',
    overflow: 'hidden',
  },
  heroProgressBarFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 3,
  },
  heroProgressPercent: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#0A0A0A',
    marginLeft: 8,
  },
  heroAvatarWrapper: {
    position: 'absolute',
    right: 0,
    bottom: -5,
    top: 0,
    width: 175,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heroAvatarImage: {
    width: 170,
    height: 185,
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
