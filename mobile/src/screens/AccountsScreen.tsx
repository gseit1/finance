import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { Account, AccountType } from '../types';
import { AppTopHeader } from '../components/AppTopHeader';
import { AddAccountModal } from '../components/AddAccountModal';
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

export const AccountsScreen: React.FC<AccountsScreenProps> = ({
  accounts,
  onAddAccount,
  onDeleteAccount,
  onOpenProfile,
  onMenuPress,
  avatarUrl,
}) => {
  const [addAccountVisible, setAddAccountVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<AccountFilter>('all');

  // Accounts Net Worth & Liquidity Metrics
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
    <View style={styles.container}>
      <AppTopHeader
        title="Accounts & Vault"
        onMenuPress={onMenuPress}
        onProfilePress={onOpenProfile}
        avatarUrl={avatarUrl}
        rightAction={
          <TouchableOpacity
            style={styles.headerAddBtn}
            onPress={() => setAddAccountVisible(true)}
            activeOpacity={0.85}
          >
            <PlusIcon size={16} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 3 Summary Stat Cards in a Row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Net</Text>
            <Text style={styles.summaryNumber}>€{accountMetrics.net.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Assets</Text>
            <Text style={[styles.summaryNumber, { color: '#059669' }]}>
              €{accountMetrics.assets.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Liabilities</Text>
            <Text style={[styles.summaryNumber, { color: '#E11D48' }]}>
              €{accountMetrics.debt.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
          {(['all', 'bank', 'cash', 'credit_card', 'savings'] as AccountFilter[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.pill, activeFilter === f && styles.activePill]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, activeFilter === f && styles.activePillText]}>
                {f === 'all'
                  ? `All (${accounts.length})`
                  : f === 'credit_card'
                  ? 'Credit Cards'
                  : f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Accounts List */}
        <View style={styles.itemsList}>
          {filteredAccounts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Accounts Linked</Text>
              <Text style={styles.emptySubtext}>Tap the + button to add your first account.</Text>
            </View>
          ) : (
            filteredAccounts.map((acc) => (
              <View key={acc.id} style={styles.accountCard}>
                <View style={styles.accountCardLeft}>
                  <View style={styles.accIconBadge}>
                    <AccountsIcon size={18} color="#0A0A0A" />
                  </View>

                  <View>
                    <Text style={styles.accountName}>{acc.name}</Text>
                    <Text style={styles.accountType}>
                      {(acc.type || 'Bank').toUpperCase()} • {acc.currency || 'EUR'}
                    </Text>
                  </View>
                </View>

                <View style={styles.accountCardRight}>
                  <Text
                    style={[
                      styles.accountBalance,
                      acc.balance < 0 && { color: '#E11D48' },
                    ]}
                  >
                    €{acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>

                  {onDeleteAccount && (
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert('Remove Account', `Delete ${acc.name}?`, [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => onDeleteAccount(acc.id),
                          },
                        ]);
                      }}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Text style={styles.deleteLink}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Add Account Modal */}
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
    backgroundColor: '#F7F7F8',
  },
  headerAddBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0A0A0A',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  summaryLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    fontWeight: '600',
    color: '#71717A',
    marginBottom: 4,
  },
  summaryNumber: {
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '900',
    color: '#0A0A0A',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  activePill: {
    backgroundColor: '#0A0A0A',
    borderColor: '#0A0A0A',
  },
  pillText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    fontWeight: '600',
    color: '#71717A',
  },
  activePillText: {
    color: '#FFFFFF',
  },
  itemsList: {
    gap: 12,
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
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
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  accountName: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  accountType: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: '#71717A',
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
    color: '#0A0A0A',
  },
  deleteLink: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: '#E11D48',
    fontWeight: '600',
    marginTop: 4,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  emptyTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0A0A',
    marginBottom: 4,
  },
  emptySubtext: {
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    color: '#71717A',
    textAlign: 'center',
  },
});
