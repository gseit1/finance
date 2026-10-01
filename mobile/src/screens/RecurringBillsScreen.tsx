import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
} from 'react-native';
import { fonts } from '../theme/typography';
import { RecurringRule, Category, Account } from '../types';
import { AppTopHeader } from '../components/AppTopHeader';
import { AddRecurringModal } from '../components/AddRecurringModal';
import { useTheme } from '../theme/ThemeContext';
import {
  SearchIcon,
  PlusIcon,
  RepeatIcon,
  TrashIcon,
  CheckIcon,
} from '../components/VectorIcons';
import { KineticProgressBar } from '../components/KineticProgressBar';

interface RecurringBillsScreenProps {
  recurringRules: RecurringRule[];
  categories: Category[];
  accounts: Account[];
  onAddRecurringRule: (rule: Omit<RecurringRule, 'id'>) => void;
  onToggleRecurringRule: (ruleId: string, isActive: boolean) => void;
  onDeleteRecurringRule: (ruleId: string) => void;
  onExecuteRecurringRule?: (rule: RecurringRule) => void;
  onOpenProfile?: () => void;
  onMenuPress?: () => void;
  avatarUrl?: string | null;
}

type RecurringFilter = 'all' | 'active' | 'expense' | 'income';

export const RecurringBillsScreen: React.FC<RecurringBillsScreenProps> = ({
  recurringRules,
  categories,
  accounts,
  onAddRecurringRule,
  onToggleRecurringRule,
  onDeleteRecurringRule,
  onExecuteRecurringRule,
  onOpenProfile,
  onMenuPress,
  avatarUrl,
}) => {
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState<RecurringFilter>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [deletingRule, setDeletingRule] = useState<RecurringRule | null>(null);
  const [executingRule, setExecutingRule] = useState<RecurringRule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Helper map for categories & accounts
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  // Frequency to monthly multiplier for estimating monthly budget impact
  const getMonthlyAmount = (rule: RecurringRule): number => {
    switch (rule.frequency) {
      case 'daily':
        return rule.amount * 30.4;
      case 'weekly':
        return rule.amount * 4.33;
      case 'bi-weekly':
        return rule.amount * 2.16;
      case 'monthly':
        return rule.amount;
      case 'yearly':
        return rule.amount / 12;
      default:
        return rule.amount;
    }
  };

  // Metrics
  const activeRules = useMemo(() => recurringRules.filter((r) => r.is_active), [recurringRules]);
  const activeExpenseRules = useMemo(() => activeRules.filter((r) => r.type === 'expense'), [activeRules]);
  const activeIncomeRules = useMemo(() => activeRules.filter((r) => r.type === 'income'), [activeRules]);

  const monthlyExpenseCommitment = useMemo(
    () => activeExpenseRules.reduce((sum, r) => sum + getMonthlyAmount(r), 0),
    [activeExpenseRules]
  );

  const monthlyIncomeCommitment = useMemo(
    () => activeIncomeRules.reduce((sum, r) => sum + getMonthlyAmount(r), 0),
    [activeIncomeRules]
  );

  const activeRatio = recurringRules.length > 0 ? activeRules.length / recurringRules.length : 0;

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return recurringRules.filter((r) => {
      if (activeFilter === 'active' && !r.is_active) return false;
      if (activeFilter === 'expense' && r.type !== 'expense') return false;
      if (activeFilter === 'income' && r.type !== 'income') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const cat = r.category_id ? categoryMap.get(r.category_id) : undefined;
        const acc = r.account_id ? accountMap.get(r.account_id) : undefined;
        const mDesc = (r.description || '').toLowerCase().includes(q);
        const mCat = (cat?.name || '').toLowerCase().includes(q);
        const mAcc = (acc?.name || '').toLowerCase().includes(q);
        if (!mDesc && !mCat && !mAcc) return false;
      }
      return true;
    });
  }, [recurringRules, activeFilter, searchQuery, categoryMap, accountMap]);

  const formatFrequency = (freq: string): string => {
    switch (freq) {
      case 'monthly':
        return 'Μηνιαία';
      case 'weekly':
        return 'Εβδομαδιαία';
      case 'bi-weekly':
        return 'Κάθε 2 εβδ.';
      case 'yearly':
        return 'Ετήσια';
      case 'daily':
        return 'Ημερήσια';
      default:
        return 'Μηνιαία';
    }
  };

  const formatNextDate = (dateString?: string): string => {
    if (!dateString) return 'Μη προγραμματισμένο';
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(dateString);
      target.setHours(0, 0, 0, 0);
      const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diff === 0) return 'Σήμερα';
      if (diff === 1) return 'Αύριο';
      if (diff > 1 && diff <= 30) return `Σε ${diff} ημ.`;
      if (diff < 0) return `${Math.abs(diff)} ημ. πριν`;

      return new Date(dateString).toLocaleDateString('el-GR', { day: 'numeric', month: 'short' });
    } catch {
      return dateString;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppTopHeader
        title="ΠΑΓΙΕΣ ΕΝΤΟΛΕΣ"
        onMenuPress={onMenuPress}
        onProfilePress={onOpenProfile}
        avatarUrl={avatarUrl}
        rightAction={
          <View style={styles.headerRightGroup}>
            <TouchableOpacity
              style={[
                styles.headerIconBtn,
                { backgroundColor: theme.iconButtonBg, borderColor: theme.iconButtonBorder },
              ]}
              onPress={() => setIsSearching(!isSearching)}
              activeOpacity={0.7}
            >
              <SearchIcon size={17} color={theme.iconButtonColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerIconBtn, { backgroundColor: theme.brandPink, borderColor: theme.brandPink }]}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.85}
            >
              <PlusIcon size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        {isSearching && (
          <View
            style={[
              styles.searchBarContainer,
              { backgroundColor: theme.inputBg, borderColor: theme.inputBorder },
            ]}
          >
            <SearchIcon size={14} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.inputText }]}
              placeholder="Αναζήτηση πάγιας εντολής..."
              placeholderTextColor={theme.inputPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={[styles.clearSearch, { color: theme.textMuted }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Pure Pink Hero Summary Card */}
        <View style={[styles.heroCard, { backgroundColor: theme.brandPink, borderWidth: 0 }]}>
          <View style={styles.heroTopRow}>
            <Text style={[styles.heroEyebrow, { color: 'rgba(255, 255, 255, 0.85)' }]}>
              ΜΗΝΙΑΙΕΣ ΠΑΓΙΕΣ ΟΦΕΙΛΕΣ
            </Text>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>
                {activeRules.length} ΕΝΕΡΓΕΣ
              </Text>
            </View>
          </View>

          <Text style={styles.heroAmount}>
            €{monthlyExpenseCommitment.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <Text style={styles.heroAmountPeriod}> /μήνα</Text>
          </Text>

          {/* Kinetic Progress Bar of Active Rules */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>ΕΝΕΡΓΟΠΟΙΗΣΗ ΠΑΓΙΩΝ</Text>
              <Text style={styles.progressPercent}>{Math.round(activeRatio * 100)}%</Text>
            </View>
            <KineticProgressBar
              progress={activeRatio}
              height={4}
              trackColor="rgba(255, 255, 255, 0.25)"
              fillColor="#FFFFFF"
              duration={900}
            />
          </View>

          {/* Metric Sub-strip */}
          <View style={styles.heroMetricsStrip}>
            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricLabel}>ΠΑΓΙΑ ΕΣΟΔΑ</Text>
              <Text style={[styles.heroMetricValue, { color: '#A7F3D0' }]}>
                +€{monthlyIncomeCommitment.toLocaleString('el-GR', { minimumFractionDigits: 0 })}/μ
              </Text>
            </View>
            <View style={styles.heroMetricDivider} />
            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricLabel}>ΚΑΘΑΡΗ ΔΕΣΜΕΥΣΗ</Text>
              <Text style={styles.heroMetricValue}>
                {monthlyIncomeCommitment - monthlyExpenseCommitment >= 0 ? '+' : ''}
                €{(monthlyIncomeCommitment - monthlyExpenseCommitment).toLocaleString('el-GR', { minimumFractionDigits: 0 })}/μ
              </Text>
            </View>
            <View style={styles.heroMetricDivider} />
            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricLabel}>ΣΥΝΟΛΟ ΚΑΝΟΝΩΝ</Text>
              <Text style={styles.heroMetricValue}>{recurringRules.length}</Text>
            </View>
          </View>
        </View>

        {/* Automated Execution Informational Banner */}
        <View style={[styles.infoBanner, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
          <View style={[styles.infoIconBox, { backgroundColor: 'rgba(225, 29, 116, 0.12)' }]}>
            <RepeatIcon size={16} color={theme.brandPink} />
          </View>
          <View style={styles.infoTextCol}>
            <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>
              Αυτόματη Καταχώρηση στην Ημερομηνία
            </Text>
            <Text style={[styles.infoDesc, { color: theme.textSecondary }]}>
              Κάθε ενεργή πάγια εντολή (έσοδο ή έξοδο) προστίθεται αυτόματα ως συναλλαγή όταν φτάσει η ημερομηνία της και ανανεώνει το υπόλοιπο του λογαριασμού.
            </Text>
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsRow}
        >
          {(
            [
              { key: 'all', label: `Όλες (${recurringRules.length})` },
              { key: 'active', label: `Ενεργές (${activeRules.length})` },
              { key: 'expense', label: `Έξοδα (${recurringRules.filter((r) => r.type === 'expense').length})` },
              { key: 'income', label: `Έσοδα (${recurringRules.filter((r) => r.type === 'income').length})` },
            ] as { key: RecurringFilter; label: string }[]
          ).map((item) => {
            const isActive = activeFilter === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isActive ? theme.brandPink : theme.surface,
                    borderColor: isActive ? theme.brandPink : theme.hairline,
                  },
                ]}
                onPress={() => setActiveFilter(item.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pillText,
                    {
                      color: isActive ? '#FFFFFF' : theme.textSecondary,
                      fontFamily: isActive ? fonts.bodyBold : fonts.bodyMedium,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Ledger List */}
        <View style={styles.ledgerSection}>
          <View style={styles.ledgerHeaderRow}>
            <Text style={[styles.ledgerSectionTitle, { color: theme.textPrimary }]}>
              Προγραμματισμένες Πληρωμές & Συνδρομές
            </Text>
            <Text style={[styles.ledgerCountText, { color: theme.textMuted }]}>
              {filteredRules.length} {filteredRules.length === 1 ? 'εντολή' : 'εντολές'}
            </Text>
          </View>

          {filteredRules.length === 0 ? (
            <View style={[styles.emptyContainer, { borderColor: theme.hairline }]}>
              <View style={[styles.emptyIconCircle, { backgroundColor: theme.inputBg }]}>
                <RepeatIcon size={24} color={theme.textMuted} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                Δεν βρέθηκαν πάγιες εντολές
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                Προσθέστε τις μηνιαίες συνδρομές, λογαριασμούς ή μισθοδοσίες σας για αυτόματη εποπτεία.
              </Text>
              <TouchableOpacity
                style={[styles.emptyAddBtn, { backgroundColor: theme.brandPink }]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.85}
              >
                <PlusIcon size={14} color="#FFFFFF" />
                <Text style={styles.emptyAddText}>Νέα Πάγια Εντολή</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredRules.map((rule, idx) => {
              const isLast = idx === filteredRules.length - 1;
              const isIncome = rule.type === 'income';
              const cat = rule.category_id ? categoryMap.get(rule.category_id) : undefined;
              const acc = rule.account_id ? accountMap.get(rule.account_id) : undefined;

              return (
                <View
                  key={rule.id}
                  style={[
                    styles.ruleRow,
                    { borderBottomColor: theme.hairline },
                    !isLast && { borderBottomWidth: 1 },
                  ]}
                >
                  {/* Left Col: Info */}
                  <View style={styles.ruleInfoCol}>
                    <View style={styles.ruleTitleRow}>
                      <Text
                        style={[
                          styles.ruleTitle,
                          { color: rule.is_active ? theme.textPrimary : theme.textMuted },
                        ]}
                        numberOfLines={1}
                      >
                        {rule.description || 'Πάγια Εντολή'}
                      </Text>
                      <View
                        style={[
                          styles.freqBadge,
                          {
                            backgroundColor: rule.is_active ? theme.inputBg : theme.track,
                            borderColor: theme.hairline,
                          },
                        ]}
                      >
                        <Text style={[styles.freqBadgeText, { color: theme.textSecondary }]}>
                          {formatFrequency(rule.frequency)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.ruleMetaRow}>
                      <Text style={[styles.ruleMetaText, { color: theme.textMuted }]} numberOfLines={1}>
                        {cat?.name || 'Γενικά'} {acc ? `· ${acc.name}` : ''}
                      </Text>
                      <Text style={[styles.ruleDot, { color: theme.textMuted }]}>•</Text>
                      <Text style={[styles.ruleDueText, { color: rule.is_active ? theme.textSecondary : theme.textMuted }]}>
                        {formatNextDate(rule.next_run_date)}
                      </Text>
                    </View>
                  </View>

                  {/* Right Col: Amount + Switch & Actions */}
                  <View style={styles.ruleActionCol}>
                    <Text
                      style={[
                        styles.ruleAmount,
                        {
                          color: !rule.is_active
                            ? theme.textMuted
                            : isIncome
                            ? theme.emerald
                            : theme.textPrimary,
                        },
                      ]}
                    >
                      {isIncome ? '+' : '-'}€{rule.amount.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>

                    <View style={styles.toggleRow}>
                      {/* Quick Execute Button (if active) */}
                      {rule.is_active && onExecuteRecurringRule && (
                        <TouchableOpacity
                          style={[styles.quickExecBtn, { backgroundColor: isIncome ? '#ECFDF5' : theme.inputBg, borderColor: isIncome ? '#A7F3D0' : theme.hairline }]}
                          onPress={() => setExecutingRule(rule)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.quickExecText, { color: isIncome ? '#059669' : theme.textSecondary }]}>
                            Εκτέλεση
                          </Text>
                        </TouchableOpacity>
                      )}

                      <Switch
                        value={rule.is_active}
                        onValueChange={(val) => onToggleRecurringRule(rule.id, val)}
                        trackColor={{ false: theme.track, true: theme.brandPink }}
                        thumbColor="#FFFFFF"
                        ios_backgroundColor={theme.track}
                        style={styles.switchControl}
                      />

                      <TouchableOpacity
                        onPress={() => setDeletingRule(rule)}
                        style={styles.deleteBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <TrashIcon size={14} color={theme.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Add Recurring Rule Modal */}
      <AddRecurringModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={onAddRecurringRule}
        categories={categories}
        accounts={accounts}
      />

      {/* Manual Execute Confirmation Modal */}
      <Modal
        visible={!!executingRule}
        transparent
        animationType="fade"
        onRequestClose={() => setExecutingRule(null)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={[styles.deleteModalCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
            <View style={[styles.deleteModalIcon, { backgroundColor: executingRule?.type === 'income' ? '#ECFDF5' : '#FEE2E2' }]}>
              <CheckIcon size={22} color={executingRule?.type === 'income' ? '#059669' : theme.brandPink} />
            </View>
            <Text style={[styles.deleteModalTitle, { color: theme.textPrimary }]}>
              Άμεση Καταχώρηση Συναλλαγής;
            </Text>
            <Text style={[styles.deleteModalDesc, { color: theme.textSecondary }]}>
              Θέλετε να καταχωρηθεί άμεσα ως{' '}
              <Text style={{ fontFamily: fonts.bodyBold, color: theme.textPrimary }}>
                {executingRule?.type === 'income' ? 'Έσοδο (+)' : 'Έξοδο (-)'}
              </Text>{' '}
              το ποσό των{' '}
              <Text style={{ fontFamily: fonts.bodyBold, color: theme.textPrimary }}>
                €{executingRule?.amount?.toFixed(2)}
              </Text>{' '}
              για την εντολή "{executingRule?.description}" και να προχωρήσει η επόμενη ημερομηνία;
            </Text>

            <View style={styles.deleteModalBtnRow}>
              <TouchableOpacity
                style={[styles.deleteCancelBtn, { borderColor: theme.hairline }]}
                onPress={() => setExecutingRule(null)}
                activeOpacity={0.7}
              >
                <Text style={[styles.deleteCancelText, { color: theme.textPrimary }]}>Ακύρωση</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteConfirmBtn, { backgroundColor: executingRule?.type === 'income' ? theme.emerald : theme.brandPink }]}
                onPress={() => {
                  if (executingRule && onExecuteRecurringRule) {
                    onExecuteRecurringRule(executingRule);
                    setExecutingRule(null);
                  }
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.deleteConfirmText}>Καταχώρηση</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Rule Confirmation Modal */}
      <Modal
        visible={!!deletingRule}
        transparent
        animationType="fade"
        onRequestClose={() => setDeletingRule(null)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={[styles.deleteModalCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
            <View style={styles.deleteModalIcon}>
              <TrashIcon size={24} color="#EF4444" />
            </View>
            <Text style={[styles.deleteModalTitle, { color: theme.textPrimary }]}>
              Διαγραφή Πάγιας Εντολής;
            </Text>
            <Text style={[styles.deleteModalDesc, { color: theme.textSecondary }]}>
              Είστε βέβαιοι ότι θέλετε να διαγράψετε την πάγια εντολή{' '}
              <Text style={{ fontFamily: fonts.bodyBold, color: theme.textPrimary }}>
                "{deletingRule?.description}"
              </Text>
              {' '}ύψους €{deletingRule?.amount?.toFixed(2)};
            </Text>

            <View style={styles.deleteModalBtnRow}>
              <TouchableOpacity
                style={[styles.deleteCancelBtn, { borderColor: theme.hairline }]}
                onPress={() => setDeletingRule(null)}
                activeOpacity={0.7}
              >
                <Text style={[styles.deleteCancelText, { color: theme.textPrimary }]}>Ακύρωση</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteConfirmBtn}
                onPress={() => {
                  if (deletingRule) {
                    onDeleteRecurringRule(deletingRule.id);
                    setDeletingRule(null);
                  }
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.deleteConfirmText}>Διαγραφή</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  clearSearch: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    paddingHorizontal: 4,
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextCol: {
    flex: 1,
  },
  infoTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoDesc: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
    paddingBottom: 2,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
  ledgerSection: {
    marginBottom: 16,
  },
  ledgerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  ledgerSectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  ledgerCountText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  ruleInfoCol: {
    flex: 1,
    marginRight: 10,
  },
  ruleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  ruleTitle: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    maxWidth: '65%',
  },
  freqBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  freqBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 9.5,
    fontWeight: '700',
  },
  ruleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ruleMetaText: {
    fontFamily: fonts.body,
    fontSize: 12,
  },
  ruleDot: {
    fontSize: 10,
  },
  ruleDueText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11.5,
    fontWeight: '600',
  },
  ruleActionCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  ruleAmount: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickExecBtn: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  quickExecText: {
    fontFamily: fonts.bodyBold,
    fontSize: 9.5,
    fontWeight: '700',
  },
  switchControl: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  deleteBtn: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyAddText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  deleteModalCard: {
    width: '100%',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
  },
  deleteModalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  deleteModalTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteModalDesc: {
    fontFamily: fonts.body,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  deleteModalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCancelText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    fontWeight: '700',
  },
  deleteConfirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteConfirmText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
