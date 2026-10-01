import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { fonts } from '../theme/typography';
import { Account } from '../types';
import { AppTopHeader } from '../components/AppTopHeader';
import { AddAccountModal } from '../components/AddAccountModal';
import { useTheme } from '../theme/ThemeContext';
import { PlusIcon } from '../components/VectorIcons';
import { KineticProgressBar } from '../components/KineticProgressBar';

interface AccountsScreenProps {
  accounts: Account[];
  onAddAccount: (acc: Omit<Account, 'id'>) => void;
  onDeleteAccount?: (accountId: string) => void;
  onOpenProfile?: () => void;
  onMenuPress?: () => void;
  avatarUrl?: string | null;
}

type AccountFilter = 'all' | 'bank' | 'cash' | 'credit_card' | 'savings';

const accountFilterLabels: Record<AccountFilter, string> = {
  all: 'Όλοι',
  bank: 'Τράπεζες',
  cash: 'Μετρητά',
  credit_card: 'Πιστωτικές',
  savings: 'Ταμιευτήριο',
};

const accountTypeGreek: Record<string, string> = {
  bank: 'Τράπεζα',
  cash: 'Μετρητά',
  credit_card: 'Πιστωτική',
  savings: 'Ταμιευτήριο',
  investment: 'Επένδυση',
};

export const AccountsScreen: React.FC<AccountsScreenProps> = ({
  accounts,
  onAddAccount,
  onDeleteAccount,
  onOpenProfile,
  onMenuPress,
  avatarUrl,
}) => {
  const { theme } = useTheme();
  const [addAccountVisible, setAddAccountVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<AccountFilter>('all');

  const accountMetrics = useMemo(() => {
    let assets = 0;
    let debt = 0;
    accounts.forEach((a) => {
      if (a.type === 'credit_card') {
        if (a.balance < 0) debt += Math.abs(a.balance);
      } else {
        if (a.balance >= 0) assets += a.balance;
        else debt += Math.abs(a.balance);
      }
    });
    return { assets, debt, net: assets - debt };
  }, [accounts]);

  const solvencyRatio = useMemo(() => {
    const total = accountMetrics.assets + accountMetrics.debt;
    return total > 0 ? accountMetrics.assets / total : 1;
  }, [accountMetrics]);

  const liquidCash = useMemo(() => {
    return accounts
      .filter((a) => a.type === 'bank' || a.type === 'cash')
      .reduce((sum, a) => sum + (a.balance > 0 ? a.balance : 0), 0);
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    if (activeFilter === 'all') return accounts;
    return accounts.filter((a) => a.type === activeFilter);
  }, [accounts, activeFilter]);

  const fmt = (n: number) =>
    `€${Math.abs(n).toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppTopHeader
        title="Λογαριασμοί"
        onMenuPress={onMenuPress}
        onProfilePress={onOpenProfile}
        avatarUrl={avatarUrl}
        rightAction={
          <TouchableOpacity
            style={[styles.headerAddBtn, { backgroundColor: theme.brandPink }]}
            onPress={() => setAddAccountVisible(true)}
            activeOpacity={0.85}
          >
            <PlusIcon size={16} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Pure Pink Hero Card with Solvency Kinetic Progress */}
        <View style={[styles.heroCard, { backgroundColor: theme.brandPink, borderWidth: 0 }]}>
          <View style={styles.heroTopRow}>
            <Text style={[styles.heroEyebrow, { color: 'rgba(255, 255, 255, 0.85)' }]}>
              ΣΥΝΟΛΙΚΗ ΚΑΘΑΡΗ ΘΕΣΗ
            </Text>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>
                {accounts.length} {accounts.length === 1 ? 'ΛΟΓΑΡΙΑΣΜΟΣ' : 'ΛΟΓΑΡΙΑΣΜΟΙ'}
              </Text>
            </View>
          </View>

          <Text style={styles.heroAmount}>
            {accountMetrics.net < 0 ? '−' : ''}{fmt(accountMetrics.net)}
            <Text style={styles.heroAmountPeriod}> καθαρή αξία</Text>
          </Text>

          {/* Kinetic Progress Bar of Solvency & Coverage */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>ΔΕΙΚΤΗΣ ΡΕΥΣΤΟΤΗΤΑΣ & ΚΑΛΥΨΗΣ</Text>
              <Text style={styles.progressPercent}>{Math.round(solvencyRatio * 100)}%</Text>
            </View>
            <KineticProgressBar
              progress={solvencyRatio}
              height={4}
              trackColor="rgba(255, 255, 255, 0.25)"
              fillColor="#FFFFFF"
              duration={900}
            />
          </View>

          {/* Metric Sub-strip */}
          <View style={styles.heroMetricsStrip}>
            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricLabel}>ΕΝΕΡΓΗΤΙΚΟ</Text>
              <Text style={[styles.heroMetricValue, { color: '#A7F3D0' }]}>
                +{fmt(accountMetrics.assets)}
              </Text>
            </View>
            <View style={styles.heroMetricDivider} />
            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricLabel}>ΠΑΘΗΤΙΚΟ / ΧΡΕΗ</Text>
              <Text style={[styles.heroMetricValue, { color: accountMetrics.debt > 0 ? '#FECDD3' : '#FFFFFF' }]}>
                {accountMetrics.debt > 0 ? '−' : ''}{fmt(accountMetrics.debt)}
              </Text>
            </View>
            <View style={styles.heroMetricDivider} />
            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricLabel}>ΡΕΥΣΤΑ ΔΙΑΘΕΣΙΜΑ</Text>
              <Text style={styles.heroMetricValue}>
                {fmt(liquidCash)}
              </Text>
            </View>
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {(['all', 'bank', 'cash', 'credit_card', 'savings'] as AccountFilter[]).map((f) => {
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
                  {f === 'all' ? `${accountFilterLabels[f]} (${accounts.length})` : accountFilterLabels[f]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ─── Open Accounts Ledger (Borderless, Non-Boxy) ─── */}
        <View style={styles.openLedgerContainer}>
          {filteredAccounts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Δεν βρέθηκαν λογαριασμοί</Text>
              <Text style={[styles.emptySubtext, { color: theme.textMuted }]}>
                Πατήστε το ροζ κουμπί + για προσθήκη νέου λογαριασμού.
              </Text>
            </View>
          ) : (
            filteredAccounts.map((acc, index) => {
              const isLast = index === filteredAccounts.length - 1;
              const typeLabel = accountTypeGreek[acc.type] || acc.type || 'Τράπεζα';
              return (
                <View
                  key={acc.id}
                  style={[
                    styles.ledgerRow,
                    { borderBottomColor: theme.hairline },
                    !isLast && { borderBottomWidth: 1 },
                  ]}
                >
                  {/* Color swatch */}
                  <View style={[styles.colorSwatch, { backgroundColor: acc.color || theme.brandPink }]} />

                  {/* Name + type inline */}
                  <View style={styles.ledgerMiddle}>
                    <Text style={[styles.ledgerTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {acc.name}
                    </Text>
                    <Text style={[styles.ledgerMeta, { color: theme.textMuted }]}>
                      {typeLabel} · {acc.currency || 'EUR'}
                    </Text>
                  </View>

                  {/* Balance + delete */}
                  <View style={styles.ledgerRight}>
                    <Text style={[styles.ledgerBalance, { color: acc.balance < 0 ? theme.crimson : theme.textPrimary }]}>
                      {acc.balance < 0 ? '−' : ''}€{Math.abs(acc.balance).toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                    {onDeleteAccount && (
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert('Διαγραφή', `Διαγραφή του λογαριασμού "${acc.name}";`, [
                            { text: 'Άκυρο', style: 'cancel' },
                            { text: 'Διαγραφή', style: 'destructive', onPress: () => onDeleteAccount(acc.id) },
                          ]);
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={[styles.deleteLink, { color: theme.textMuted }]}>Διαγραφή</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <AddAccountModal
        visible={addAccountVisible}
        onClose={() => setAddAccountVisible(false)}
        onSave={onAddAccount}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerAddBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },

  // ─── Hero Brand Pink Card ──────────────────────────────────────────
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

  // ─── Filter row ──────────────────────────────────────────────────────
  filterRow: {
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

  // ─── Open Ledger (Borderless, Non-Boxy) ──────────────────────────────
  openLedgerContainer: {
    paddingTop: 4,
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  colorSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
  ledgerRight: {
    alignItems: 'flex-end',
  },
  ledgerBalance: {
    fontFamily: fonts.heading,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  deleteLink: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    marginTop: 3,
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
