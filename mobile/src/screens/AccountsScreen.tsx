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
import { Account, AccountType } from '../types';
import { AppTopHeader } from '../components/AppTopHeader';
import { AddAccountModal } from '../components/AddAccountModal';
import { useTheme } from '../theme/ThemeContext';
import {
  AccountsIcon,
  PlusIcon,
} from '../components/VectorIcons';

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
    const net = assets - debt;
    return { assets, debt, net };
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    if (activeFilter === 'all') return accounts;
    return accounts.filter((a) => a.type === activeFilter);
  }, [accounts, activeFilter]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppTopHeader
        title="Λογαριασμοί & Θησαυροφυλάκιο"
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
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Καθαρή Αξία</Text>
            <Text style={[styles.summaryNumber, { color: theme.textPrimary }]}>€{accountMetrics.net.toLocaleString('el-GR')}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Ενεργητικό</Text>
            <Text style={[styles.summaryNumber, { color: theme.emerald }]}>
              €{accountMetrics.assets.toLocaleString('el-GR')}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Παθητικό</Text>
            <Text style={[styles.summaryNumber, { color: theme.crimson }]}>
              €{accountMetrics.debt.toLocaleString('el-GR')}
            </Text>
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
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
                {f === 'all'
                  ? `${accountFilterLabels[f]} (${accounts.length})`
                  : accountFilterLabels[f]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Accounts List */}
        <View style={styles.itemsList}>
          {filteredAccounts.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Δεν βρέθηκαν λογαριασμοί</Text>
              <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Πατήστε + για να προσθέσετε τον πρώτο λογαριασμό.</Text>
            </View>
          ) : (
            filteredAccounts.map((acc) => (
              <View key={acc.id} style={[styles.accountCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
                <View style={styles.accountCardLeft}>
                  <View style={[styles.accIconBadge, { backgroundColor: theme.track, borderColor: theme.hairline }]}>
                    <AccountsIcon size={18} color={theme.textPrimary} />
                  </View>

                  <View>
                    <Text style={[styles.accountName, { color: theme.textPrimary }]}>{acc.name}</Text>
                    <Text style={[styles.accountType, { color: theme.textSecondary }]}>
                      {(acc.type || 'Τράπεζα').toUpperCase()} • {acc.currency || 'EUR'}
                    </Text>
                  </View>
                </View>

                <View style={styles.accountCardRight}>
                  <Text style={[styles.accountBalance, { color: acc.balance < 0 ? theme.crimson : theme.textPrimary }]}>
                    €{acc.balance.toLocaleString('el-GR', { minimumFractionDigits: 2 })}
                  </Text>

                  {onDeleteAccount && (
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert('Διαγραφή Λογαριασμού', `Διαγραφή "${acc.name}";`, [
                          { text: 'Άκυρο', style: 'cancel' },
                          {
                            text: 'Διαγραφή',
                            style: 'destructive',
                            onPress: () => onDeleteAccount(acc.id),
                          },
                        ]);
                      }}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Text style={[styles.deleteLink, { color: theme.crimson }]}>Διαγραφή</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

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
  container: {
    flex: 1,
  },
  headerAddBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  summaryLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryNumber: {
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  filterPillsRow: {
    gap: 8,
    paddingBottom: 16,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    fontWeight: '600',
  },
  itemsList: {
    gap: 12,
  },
  accountCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  accIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  accountName: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '700',
  },
  accountType: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  accountCardRight: {
    alignItems: 'flex-end',
  },
  accountBalance: {
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '900',
  },
  deleteLink: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyContainer: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtext: {
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    textAlign: 'center',
  },
});
