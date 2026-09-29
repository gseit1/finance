import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { fonts } from '../theme/typography';
import { Task, Goal } from '../types';
import {
  CheckIcon,
  AccountsIcon,
  ExpensesIcon,
  ChevronRightIcon,
  PlusIcon,
} from './VectorIcons';
import { KineticVaultToken } from './KineticVaultToken';
import { useTheme } from '../theme/ThemeContext';

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
  userName = 'Χρήστης',
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
  const { theme } = useTheme();

  const formatCurrency = (val: number) => {
    return `€${Math.abs(val).toLocaleString('el-GR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, lastDayOfMonth - today.getDate());
  const dailyAllowance = Math.max(0, Math.round(totalBalance / daysRemaining));
  const monthDay = today.getDate();
  const monthProgress = Math.min(100, Math.max(0, Math.round((monthDay / lastDayOfMonth) * 100)));

  const getFinancialStatus = (balance: number) => {
    if (balance >= 700) {
      return {
        tier: 1,
        quote: 'Μπροσκι ρίχτο έξω, σε παίρνει ακόμα',
        badge: 'Άνετος',
        badgeColor: theme.emeraldBg,
        badgeTextColor: theme.emerald,
        badgeBorder: theme.emeraldBorder,
        progressColor: theme.emerald,
      };
    } else if (balance >= 400) {
      return {
        tier: 2,
        quote: 'Μπροσκι ο μήνας έχει μέρες ακόμα..τσιλ.',
        badge: 'Τσιλ',
        badgeColor: theme.track,
        badgeTextColor: theme.textSecondary,
        badgeBorder: theme.hairline,
        progressColor: theme.textSecondary,
      };
    } else if (balance >= 100) {
      return {
        tier: 3,
        quote: 'Επ δικέ μου, είσαι δύσκολα',
        badge: 'Προσοχή',
        badgeColor: theme.isDark ? '#1A1100' : '#FFFBEB',
        badgeTextColor: '#B45309',
        badgeBorder: theme.isDark ? '#3D2600' : '#FDE68A',
        progressColor: '#D97706',
      };
    } else {
      return {
        tier: 4,
        quote: 'Μπροσκι θες 1 ευρώ να πάρεις τυρόπιτα;',
        badge: 'Τυρόπιτα Mode',
        badgeColor: theme.crimsonBg,
        badgeTextColor: theme.crimson,
        badgeBorder: theme.crimsonBorder,
        progressColor: theme.crimson,
      };
    }
  };

  const status = getFinancialStatus(totalBalance);

  return (
    <View style={styles.container}>
      {/* Hero Card */}
      <TouchableOpacity
        style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}
        activeOpacity={0.92}
        onPress={onOpenAccounts || onOpenAnalytics || onOpenExpenses}
      >
        {/* Left: Greek Status Quote + Monthly Runway */}
        <View style={styles.heroLeftContent}>
          <View style={styles.heroTopStatusRow}>
            <Text style={[styles.heroLabel, { color: theme.textSecondary }]}>RUNWAY ΜΗΝΑ</Text>
            <View style={[styles.tierBadge, { backgroundColor: status.badgeColor, borderColor: status.badgeBorder }]}>
              <Text style={[styles.tierBadgeText, { color: status.badgeTextColor }]}>
                {status.badge}
              </Text>
            </View>
          </View>

          <Text style={[styles.heroTitle, { color: theme.textPrimary }]} numberOfLines={3}>
            "{status.quote}"
          </Text>

          <Text style={[styles.heroMetricsSub, { color: theme.textSecondary }]}>
            €{dailyAllowance}/ημέρα • {daysRemaining} {daysRemaining === 1 ? 'μέρα' : 'μέρες'} για πληρωμή
          </Text>

          <View style={styles.heroProgressBlock}>
            <View style={styles.heroProgressRow}>
              <View style={[styles.heroProgressBarTrack, { backgroundColor: theme.track }]}>
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
              <Text style={[styles.heroProgressPercent, { color: theme.textPrimary }]}>
                {daysRemaining} {daysRemaining === 1 ? 'μέρα' : 'μέρες'}
              </Text>
            </View>
          </View>
        </View>

        {/* Right: Floating Euro Coin */}
        <View style={styles.heroVaultWrapper} pointerEvents="none">
          <KineticVaultToken />
        </View>
      </TouchableOpacity>

      {/* Bento Grid Row 1 */}
      <View style={styles.gridRow}>
        {/* Εργασίες */}
        <TouchableOpacity
          style={[styles.gridCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}
          activeOpacity={0.85}
          onPress={onOpenTasks}
        >
          <View style={styles.gridCardTop}>
            <View>
              <Text style={[styles.gridCardLabel, { color: theme.textSecondary }]}>Εργασίες</Text>
              <Text style={[styles.gridCardNumber, { color: theme.textPrimary }]}>{pendingTaskCount}</Text>
            </View>
            <View style={[styles.tasksIconBadge, { backgroundColor: theme.track, borderColor: theme.hairline }]}>
              <CheckIcon size={16} color={theme.textPrimary} />
            </View>
          </View>
          <Text style={[styles.gridCardSub, { color: theme.textMuted }]}>Εκκρεμείς</Text>
        </TouchableOpacity>

        {/* Έξοδα Μήνα */}
        <TouchableOpacity
          style={[styles.gridCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}
          activeOpacity={0.85}
          onPress={onOpenExpenses}
        >
          <View style={styles.gridCardTop}>
            <View>
              <Text style={[styles.gridCardLabel, { color: theme.textSecondary }]}>Έξοδα Μήνα</Text>
              <Text style={[styles.gridCardNumber, { color: theme.crimson }]}>{formatCurrency(monthlyExpense)}</Text>
            </View>
            <View style={[styles.expensesIconBadge, { backgroundColor: theme.crimsonBg, borderColor: theme.crimsonBorder }]}>
              <ExpensesIcon size={16} color={theme.crimson} />
            </View>
          </View>
          <Text style={[styles.gridCardSub, { color: theme.textMuted }]}>Τρέχων Μήνας</Text>
        </TouchableOpacity>
      </View>

      {/* Bento Grid Row 2 — Συνολικό Υπόλοιπο */}
      <TouchableOpacity
        style={[styles.wideCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}
        activeOpacity={0.85}
        onPress={onOpenAccounts}
      >
        <View style={styles.wideCardLeft}>
          <Text style={[styles.gridCardLabel, { color: theme.textSecondary }]}>Συνολικό Υπόλοιπο</Text>
          <Text style={[styles.wideCardNumber, { color: theme.textPrimary }]}>{formatCurrency(totalBalance)}</Text>
          <Text style={[styles.gridCardSub, { color: theme.textMuted }]}>{accountCount} Ενεργοί Λογαριασμοί</Text>
        </View>

        <View style={styles.wideCardRight}>
          <View style={[styles.mintIconBadge, { backgroundColor: theme.emeraldBg, borderColor: theme.emeraldBorder }]}>
            <AccountsIcon size={18} color={theme.emerald} />
          </View>
          <View style={[styles.donutRing, { borderColor: theme.emerald }]}>
            <View style={styles.donutRingInner}>
              <Text style={[styles.donutText, { color: theme.emerald }]}>100%</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Upcoming Bill */}
      {upcomingBill && (
        <TouchableOpacity
          style={[styles.upcomingCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}
          activeOpacity={0.85}
          onPress={onOpenCalendar || onOpenAccounts}
        >
          <View style={[styles.amberIconBadge, { backgroundColor: theme.track, borderColor: theme.hairline }]}>
            <Text style={styles.amberGlyph}>👥</Text>
          </View>

          <View style={styles.upcomingCenter}>
            <Text style={[styles.upcomingLabel, { color: theme.textMuted }]}>ΕΠΟΜΕΝΗ ΠΛΗΡΩΜΗ</Text>
            <Text style={[styles.upcomingTitle, { color: theme.textPrimary }]} numberOfLines={1}>
              {upcomingBill.description}
            </Text>
            <Text style={[styles.upcomingTime, { color: theme.textSecondary }]}>
              {upcomingBill.dueNotice} • €{upcomingBill.amount.toFixed(2)}
            </Text>
          </View>

          <View style={[styles.chevronButton, { backgroundColor: theme.track }]}>
            <ChevronRightIcon size={16} color={theme.textSecondary} />
          </View>
        </TouchableOpacity>
      )}

      {/* Quick Action Button */}
      <TouchableOpacity
        style={[styles.primaryAddBtn, { backgroundColor: theme.buttonPrimaryBg }]}
        onPress={onAddTransaction}
        activeOpacity={0.88}
      >
        <PlusIcon size={18} color={theme.buttonPrimaryText} />
        <Text style={[styles.primaryAddBtnText, { color: theme.buttonPrimaryText }]}>Καταχώρηση Συναλλαγής</Text>
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
  heroCard: {
    borderRadius: 20,
    minHeight: 185,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    padding: 20,
    paddingBottom: 22,
    borderWidth: 1,
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
    letterSpacing: -0.3,
    lineHeight: 24,
    marginTop: 4,
    marginBottom: 6,
  },
  heroMetricsSub: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11.5,
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
  gridRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  gridCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
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
    fontWeight: '600',
    marginBottom: 2,
  },
  gridCardNumber: {
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  gridCardSub: {
    fontFamily: fonts.bodyLight,
    fontSize: 11,
    fontWeight: '500',
  },
  tasksIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  expensesIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  wideCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  donutRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
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
  },
  upcomingCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  amberIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  upcomingTitle: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginTop: 1,
  },
  upcomingTime: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    marginTop: 2,
  },
  chevronButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryAddBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryAddBtnText: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
