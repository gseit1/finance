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
  bank: 'Τράπεζα',
  cash: 'Μετρητά',
  credit_card: 'Πιστωτικές',
  savings: 'Ταμιευτήριο',
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
            style={[styles.headerAddBtn, { backgroundColor: theme.buttonPrimaryBg }]}
            onPress={() => setAddAccountVisible(true)}
            activeOpacity={0.85}
          >
            <PlusIcon size={16} color={theme.buttonPrimaryText} />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Net worth summary — single compact card */}
        <View style={[styles.netWorthCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
          <View style={styles.netWorthRow}>
            <View style={styles.netWorthCol}>
              <Text style={[styles.netWorthLabel, { color: theme.textMuted }]}>Καθαρή Αξία</Text>
              <Text style={[styles.netWorthValue, { color: theme.textPrimary }]}>
                {fmt(accountMetrics.net)}
              </Text>
            </View>
            <View style={[styles.dividerV, { backgroundColor: theme.hairline }]} />
            <View style={styles.netWorthCol}>
              <Text style={[styles.netWorthLabel, { color: theme.textMuted }]}>Ενεργητικό</Text>
              <Text style={[styles.netWorthValue, { color: theme.emerald }]}>
                {fmt(accountMetrics.assets)}
              </Text>
            </View>
            <View style={[styles.dividerV, { backgroundColor: theme.hairline }]} />
            <View style={styles.netWorthCol}>
              <Text style={[styles.netWorthLabel, { color: theme.textMuted }]}>Παθητικό</Text>
              <Text style={[styles.netWorthValue, { color: accountMetrics.debt > 0 ? theme.crimson : theme.textSecondary }]}>
                {fmt(accountMetrics.debt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {(['all', 'bank', 'cash', 'credit_card', 'savings'] as AccountFilter[]).map((f) => (
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
                {f === 'all' ? `${accountFilterLabels[f]} (${accounts.length})` : accountFilterLabels[f]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ─── Continuous Accounts Ledger ─── */}
        {filteredAccounts.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Δεν βρέθηκαν λογαριασμοί</Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Πατήστε + για να προσθέσετε τον πρώτο λογαριασμό.</Text>
          </View>
        ) : (
          <View style={[styles.ledgerCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
            {filteredAccounts.map((acc, index) => {
              const isLast = index === filteredAccounts.length - 1;
              return (
                <View
                  key={acc.id}
                  style={[
                    styles.ledgerRow,
                    !isLast && { borderBottomWidth: 1, borderBottomColor: theme.hairlineFaint },
                  ]}
                >
                  {/* Color swatch */}
                  <View style={[styles.colorSwatch, { backgroundColor: acc.color || theme.textPrimary }]} />

                  {/* Name + type inline */}
                  <View style={styles.ledgerMiddle}>
                    <Text style={[styles.ledgerTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {acc.name}
                    </Text>
                    <Text style={[styles.ledgerMeta, { color: theme.textMuted }]}>
                      {(acc.type || 'ΤΡΑΠΕΖΑ').toUpperCase().replace('_', ' ')} · {acc.currency || 'EUR'}
                    </Text>
                  </View>

                  {/* Balance + delete */}
                  <View style={styles.ledgerRight}>
                    <Text style={[styles.ledgerBalance, { color: acc.balance < 0 ? theme.crimson : theme.textPrimary }]}>
                      {acc.balance < 0 ? '−' : ''}€{Math.abs(acc.balance).toLocaleString('el-GR', { minimumFractionDigits: 2 })}
                    </Text>
                    {onDeleteAccount && (
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert('Διαγραφή', `Διαγραφή "${acc.name}";`, [
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
            })}
          </View>
        )}

        <View style={{ height: 90 }} />
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
  container: { flex: 1 },
  headerAddBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  // ─── Net Worth compact bar ───
  netWorthCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  netWorthRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  netWorthCol: {
    flex: 1,
    alignItems: 'center',
  },
  dividerV: {
    width: 1,
    height: 32,
    marginHorizontal: 4,
  },
  netWorthLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  netWorthValue: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  // ─── Filter pills ───
  filterRow: {
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
  // ─── Ledger ───
  ledgerCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  colorSwatch: {
    width: 8,
    height: 32,
    borderRadius: 4,
    marginRight: 14,
    flexShrink: 0,
  },
  ledgerMiddle: {
    flex: 1,
    paddingRight: 10,
  },
  ledgerTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    fontWeight: '700',
  },
  ledgerMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 2,
  },
  ledgerRight: {
    alignItems: 'flex-end',
  },
  ledgerBalance: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  deleteLink: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  // ─── Empty ───
  emptyCard: {
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
