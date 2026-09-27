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
import { Account, Category, RecurringRule } from '../types';
import { AppTopHeader } from '../components/AppTopHeader';
import { AddAccountModal } from '../components/AddAccountModal';
import { AddRecurringModal } from '../components/AddRecurringModal';

interface AccountsScreenProps {
  accounts: Account[];
  recurringRules: RecurringRule[];
  categories: Category[];
  onAddAccount: (acc: Omit<Account, 'id'>) => void;
  onDeleteAccount?: (accountId: string) => void;
  onAddRecurringRule: (rule: Omit<RecurringRule, 'id'>) => void;
  onToggleRecurringRule: (ruleId: string, isActive: boolean) => void;
  onDeleteRecurringRule: (ruleId: string) => void;
  onOpenProfile?: () => void;
  avatarUrl?: string | null;
}

type SubTab = 'accounts' | 'recurring';

export const AccountsScreen: React.FC<AccountsScreenProps> = ({
  accounts,
  recurringRules,
  categories,
  onAddAccount,
  onDeleteAccount,
  onAddRecurringRule,
  onToggleRecurringRule,
  onDeleteRecurringRule,
  onOpenProfile,
  avatarUrl,
}) => {
  const [activeTab, setActiveTab] = useState<SubTab>('accounts');
  const [addAccountVisible, setAddAccountVisible] = useState(false);
  const [addRecurringVisible, setAddRecurringVisible] = useState(false);

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

  // Recurring Rules Metrics
  const recurringMetrics = useMemo(() => {
    let monthlyOutflow = 0;
    let monthlyInflow = 0;
    let activeCount = 0;

    recurringRules.forEach((r) => {
      if (!r.is_active) return;
      activeCount += 1;

      // Normalize frequency to monthly equivalent
      let multiplier = 1;
      switch (r.frequency) {
        case 'daily':
          multiplier = 30;
          break;
        case 'weekly':
          multiplier = 4.33;
          break;
        case 'bi-weekly':
          multiplier = 2.16;
          break;
        case 'monthly':
          multiplier = 1;
          break;
        case 'yearly':
          multiplier = 1 / 12;
          break;
      }

      if (r.type === 'expense') {
        monthlyOutflow += r.amount * multiplier;
      } else {
        monthlyInflow += r.amount * multiplier;
      }
    });

    return { monthlyOutflow, monthlyInflow, activeCount };
  }, [recurringRules]);

  // Helper for format relative date
  const formatDueNotice = (dateStr: string) => {
    try {
      const target = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      target.setHours(0, 0, 0, 0);

      const diffMs = target.getTime() - today.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Due today';
      if (diffDays === 1) return 'Due tomorrow';
      if (diffDays > 1) return `Due in ${diffDays} days`;
      if (diffDays < 0) return `Past due by ${Math.abs(diffDays)}d`;
    } catch {
      return dateStr;
    }
    return dateStr;
  };

  return (
    <View style={styles.container}>
      <AppTopHeader
        title="Vault & Bills"
        showPulse
        onProfilePress={onOpenProfile}
        avatarUrl={avatarUrl}
      />

      {/* Top Segment Controller */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentTab, activeTab === 'accounts' && styles.activeSegmentTab]}
          onPress={() => setActiveTab('accounts')}
          activeOpacity={0.7}
        >
          <Text style={[styles.segmentText, activeTab === 'accounts' && styles.activeSegmentText]}>
            ACCOUNTS ({accounts.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentTab, activeTab === 'recurring' && styles.activeSegmentTab]}
          onPress={() => setActiveTab('recurring')}
          activeOpacity={0.7}
        >
          <Text style={[styles.segmentText, activeTab === 'recurring' && styles.activeSegmentText]}>
            RECURRING ({recurringRules.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ==================== TAB 1: ACCOUNTS & WALLETS ==================== */}
        {activeTab === 'accounts' && (
          <View>
            {/* 3-Column Summary Strip */}
            <View style={styles.summaryCard}>
              <View style={styles.dataCol}>
                <Text style={styles.dataLabel}>LIQUID ASSETS</Text>
                <Text style={[styles.dataValue, { color: colors.inflow }]}>
                  €{accountMetrics.assets.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.dataDivider} />
              <View style={styles.dataCol}>
                <Text style={styles.dataLabel}>TOTAL DEBT</Text>
                <Text style={[styles.dataValue, { color: accountMetrics.debt > 0 ? colors.outflow : '#A1A1AA' }]}>
                  €{accountMetrics.debt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.dataDivider} />
              <View style={styles.dataCol}>
                <Text style={styles.dataLabel}>NET CAPITAL</Text>
                <Text style={[styles.dataValue, { color: '#FAFAFA' }]}>
                  €{accountMetrics.net.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            {/* Section Header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionEyebrow}>CONNECTED REPOSITORIES</Text>
              <TouchableOpacity
                style={styles.inlineActionBtn}
                onPress={() => setAddAccountVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.inlineActionText}>+ New Account</Text>
              </TouchableOpacity>
            </View>

            {/* Account Cards List */}
            {accounts.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>NO ACCOUNTS ESTABLISHED</Text>
                <Text style={styles.emptySub}>Tap below to register your first financial repository.</Text>
              </View>
            ) : (
              accounts.map((acc) => {
                const isNegative = acc.balance < 0;
                return (
                  <View key={acc.id} style={styles.accountCard}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.accountTitleGroup}>
                        <View style={[styles.colorAccentBar, { backgroundColor: acc.color || '#3B82F6' }]} />
                        <View>
                          <Text style={styles.accountName}>{acc.name}</Text>
                          <Text style={styles.accountTypeBadge}>
                            {(acc.type || 'bank').toUpperCase()} • {acc.currency || 'EUR'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.accountRightGroup}>
                        <Text style={[styles.accountBalance, isNegative && { color: colors.outflow }]}>
                          €{acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Text>
                        {onDeleteAccount && accounts.length > 1 && (
                          <TouchableOpacity
                            onPress={() => {
                              Alert.alert(
                                'Remove Account',
                                `Are you sure you want to remove "${acc.name}"?`,
                                [
                                  { text: 'Cancel', style: 'cancel' },
                                  {
                                    text: 'Remove',
                                    style: 'destructive',
                                    onPress: () => onDeleteAccount(acc.id),
                                  },
                                ]
                              );
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={styles.accountDeleteBtn}
                          >
                            <Text style={styles.accountDeleteBtnText}>✕</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ==================== TAB 2: RECURRING BILLS ==================== */}
        {activeTab === 'recurring' && (
          <View>
            {/* 3-Column Recurring Metrics */}
            <View style={styles.summaryCard}>
              <View style={styles.dataCol}>
                <Text style={styles.dataLabel}>COMMITTED / MO</Text>
                <Text style={[styles.dataValue, { color: colors.outflow }]}>
                  €{recurringMetrics.monthlyOutflow.toFixed(2)}
                </Text>
              </View>
              <View style={styles.dataDivider} />
              <View style={styles.dataCol}>
                <Text style={styles.dataLabel}>INCOME / MO</Text>
                <Text style={[styles.dataValue, { color: colors.inflow }]}>
                  €{recurringMetrics.monthlyInflow.toFixed(2)}
                </Text>
              </View>
              <View style={styles.dataDivider} />
              <View style={styles.dataCol}>
                <Text style={styles.dataLabel}>ACTIVE RULES</Text>
                <Text style={[styles.dataValue, { color: '#FAFAFA' }]}>
                  {recurringMetrics.activeCount}
                </Text>
              </View>
            </View>

            {/* Section Header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionEyebrow}>SCHEDULED SUBSCRIPTIONS & BILLS</Text>
              <TouchableOpacity
                style={styles.inlineActionBtn}
                onPress={() => setAddRecurringVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.inlineActionText}>+ New Rule</Text>
              </TouchableOpacity>
            </View>

            {/* Recurring Rules List */}
            {recurringRules.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>NO RECURRING RULES</Text>
                <Text style={styles.emptySub}>Set up automated rules for Netflix, rent, subscriptions, or salaries.</Text>
              </View>
            ) : (
              recurringRules.map((rule) => {
                const linkedAcc = accounts.find((a) => a.id === rule.account_id);
                const isExpense = rule.type === 'expense';
                const dueText = formatDueNotice(rule.next_run_date);

                return (
                  <View key={rule.id} style={[styles.ruleCard, !rule.is_active && styles.ruleCardInactive]}>
                    <View style={styles.ruleTopRow}>
                      <View style={styles.ruleDetails}>
                        <View style={styles.ruleTitleRow}>
                          <Text style={[styles.ruleDescription, !rule.is_active && styles.textMuted]}>
                            {rule.description}
                          </Text>
                          <View style={styles.freqBadge}>
                            <Text style={styles.freqBadgeText}>
                              {rule.frequency.toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.ruleMeta}>
                          {linkedAcc?.name || 'Account'} • {rule.next_run_date} ({dueText})
                        </Text>
                      </View>

                      <View style={styles.ruleAmountGroup}>
                        <Text style={[styles.ruleAmount, { color: isExpense ? colors.outflow : colors.inflow }]}>
                          {isExpense ? '-' : '+'}€{rule.amount.toFixed(2)}
                        </Text>
                        <Text style={styles.perPeriodText}>/{rule.frequency === 'yearly' ? 'yr' : 'mo'}</Text>
                      </View>
                    </View>

                    {/* Rule Actions Row */}
                    <View style={styles.ruleActionsRow}>
                      <TouchableOpacity
                        style={[styles.toggleBtn, rule.is_active ? styles.toggleActive : styles.togglePaused]}
                        onPress={() => onToggleRecurringRule(rule.id, !rule.is_active)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.toggleBtnText, rule.is_active ? styles.toggleActiveText : styles.togglePausedText]}>
                          {rule.is_active ? '● Active' : '○ Paused'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => {
                          Alert.alert(
                            'Delete Recurring Rule',
                            `Are you sure you want to delete "${rule.description}"?`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Delete', style: 'destructive', onPress: () => onDeleteRecurringRule(rule.id) },
                            ]
                          );
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.deleteBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (activeTab === 'accounts') setAddAccountVisible(true);
          else setAddRecurringVisible(true);
        }}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>
          {activeTab === 'accounts' ? '+ Add Account' : '+ Add Recurring Rule'}
        </Text>
      </TouchableOpacity>

      {/* Add Account Modal */}
      <AddAccountModal
        visible={addAccountVisible}
        onClose={() => setAddAccountVisible(false)}
        onSave={onAddAccount}
      />

      {/* Add Recurring Modal */}
      <AddRecurringModal
        visible={addRecurringVisible}
        onClose={() => setAddRecurringVisible(false)}
        onSave={onAddRecurringRule}
        accounts={accounts}
        categories={categories}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#141416',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  activeSegmentTab: {
    backgroundColor: '#27272A',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 0.8,
  },
  activeSegmentText: {
    color: '#FAFAFA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#141416',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 20,
  },
  dataCol: {
    flex: 1,
    alignItems: 'center',
  },
  dataDivider: {
    width: 1,
    height: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignSelf: 'center',
  },
  dataLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#71717A',
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#71717A',
  },
  inlineActionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  inlineActionText: {
    color: '#FAFAFA',
    fontSize: 12,
    fontWeight: '700',
  },
  accountCard: {
    backgroundColor: '#141416',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorAccentBar: {
    width: 4,
    height: 34,
    borderRadius: 2,
    marginRight: 12,
  },
  accountName: {
    color: '#FAFAFA',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  accountTypeBadge: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  accountRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountDeleteBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  accountDeleteBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  accountBalance: {
    color: '#FAFAFA',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  ruleCard: {
    backgroundColor: '#141416',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  ruleCardInactive: {
    opacity: 0.6,
  },
  ruleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ruleDetails: {
    flex: 1,
    marginRight: 12,
  },
  ruleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ruleDescription: {
    color: '#FAFAFA',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
  },
  freqBadge: {
    backgroundColor: '#1F1F23',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  freqBadgeText: {
    color: '#A1A1AA',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  ruleMeta: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '500',
  },
  ruleAmountGroup: {
    alignItems: 'flex-end',
  },
  ruleAmount: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  perPeriodText: {
    color: '#71717A',
    fontSize: 10,
    fontWeight: '600',
  },
  ruleActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  toggleBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  togglePaused: {
    backgroundColor: 'rgba(113, 113, 122, 0.15)',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  toggleActiveText: {
    color: '#10B981',
  },
  togglePausedText: {
    color: '#71717A',
  },
  deleteBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteBtnText: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141416',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyTitle: {
    color: '#FAFAFA',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  emptySub: {
    color: '#71717A',
    fontSize: 12,
    textAlign: 'center',
  },
  textMuted: {
    color: '#71717A',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#09090B',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
