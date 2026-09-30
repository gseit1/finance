import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { fonts } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';
import { Goal } from '../types';
import { AddGoalModal } from '../components/AddGoalModal';
import { AppTopHeader } from '../components/AppTopHeader';
import {
  PlusIcon,
  CheckIcon,
} from '../components/VectorIcons';

interface GoalsScreenProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onAddFundsToGoal: (goalId: string, amount: number) => void;
  onOpenProfile?: () => void;
  onMenuPress?: () => void;
  avatarUrl?: string | null;
}

type GoalFilter = 'all' | 'active' | 'completed';

export const GoalsScreen: React.FC<GoalsScreenProps> = ({
  goals = [],
  onAddGoal,
  onAddFundsToGoal,
  onOpenProfile,
  onMenuPress,
  avatarUrl,
}) => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<GoalFilter>('all');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [fundsModalVisible, setFundsModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Summary Metrics calculated strictly from real goals
  const summary = useMemo(() => {
    let totalTarget = 0;
    let totalSaved = 0;
    goals.forEach((g) => {
      totalTarget += Number(g.target_amount) || 0;
      totalSaved += Number(g.current_amount) || 0;
    });
    const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;
    const completedCount = goals.filter((g) => g.is_completed || (Number(g.current_amount) || 0) >= (Number(g.target_amount) || 1)).length;
    const activeCount = goals.length - completedCount;

    return {
      totalTarget,
      totalSaved,
      overallProgress,
      completedCount,
      activeCount,
    };
  }, [goals]);

  // Filtered goals
  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      const current = Number(g.current_amount) || 0;
      const target = Number(g.target_amount) || 1;
      const isDone = g.is_completed || current >= target;

      if (filter === 'active') return !isDone;
      if (filter === 'completed') return isDone;
      return true;
    });
  }, [goals, filter]);

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!selectedGoal || isNaN(amount) || amount <= 0) return;

    onAddFundsToGoal(selectedGoal.id, amount);
    setDepositAmount('');
    setFundsModalVisible(false);
    setSelectedGoal(null);
  };

  const openDepositModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setDepositAmount('');
    setFundsModalVisible(true);
  };

  const depositPresets = [10, 25, 50, 100];
  const remainingForSelected = selectedGoal
    ? Math.max(0, (Number(selectedGoal.target_amount) || 0) - (Number(selectedGoal.current_amount) || 0))
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Responsive Header with clear breathing room */}
      <AppTopHeader
        title="Οικονομικοί Στόχοι"
        onMenuPress={onMenuPress}
        onProfilePress={onOpenProfile}
        avatarUrl={avatarUrl}
        rightAction={
          <TouchableOpacity
            style={[styles.headerAddBtn, { backgroundColor: theme.brandPink }]}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.85}
            accessibilityLabel="Προσθήκη νέου στόχου"
          >
            <PlusIcon size={16} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Pure Pink Background Hero Section (Matches Home & Transactions) */}
        <View style={[styles.heroCanvas, { backgroundColor: theme.brandPink }]}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroKicker}>ΣΥΝΟΛΙΚΕΣ ΑΠΟΤΑΜΙΕΥΣΕΙΣ</Text>
            <View style={styles.heroBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.heroBadgeText}>
                {summary.completedCount}/{goals.length} ΟΛΟΚΛΗΡΩΘΗΚΑΝ
              </Text>
            </View>
          </View>

          {/* Large Hero Amount & Target */}
          <View style={styles.heroMainRow}>
            <Text style={styles.heroBigAmount} numberOfLines={1} adjustsFontSizeToFit>
              €{summary.totalSaved.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.heroSubText}>
              από στόχο €{summary.totalTarget.toLocaleString('el-GR', { minimumFractionDigits: 0 })} ({summary.overallProgress}%)
            </Text>
          </View>

          {/* Hero Sub-Metrics Strip */}
          <View style={styles.heroMetricsStrip}>
            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricLabel}>ΕΝΕΡΓΟΙ</Text>
              <Text style={styles.heroMetricValue}>{summary.activeCount}</Text>
            </View>
            <View style={styles.heroMetricDivider} />
            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricLabel}>ΟΛΟΚΛΗΡΩΜΕΝΟΙ</Text>
              <Text style={styles.heroMetricValueMint}>{summary.completedCount}</Text>
            </View>
            <View style={styles.heroMetricDivider} />
            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricLabel}>ΠΡΟΟΔΟΣ</Text>
              <Text style={styles.heroMetricValue}>{summary.overallProgress}%</Text>
            </View>
          </View>
        </View>

        {/* Lightweight Filter Pills (No heavy boxed outer containers) */}
        <View style={styles.filterPillsRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              filter === 'all'
                ? { backgroundColor: theme.brandPink }
                : { backgroundColor: theme.surface },
            ]}
            onPress={() => setFilter('all')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: filter === 'all' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Όλοι ({goals.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              filter === 'active'
                ? { backgroundColor: theme.brandPink }
                : { backgroundColor: theme.surface },
            ]}
            onPress={() => setFilter('active')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: filter === 'active' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Σε εξέλιξη ({summary.activeCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              filter === 'completed'
                ? { backgroundColor: theme.brandPink }
                : { backgroundColor: theme.surface },
            ]}
            onPress={() => setFilter('completed')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: filter === 'completed' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Ολοκληρωμένοι ({summary.completedCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Fluid Goal Items (Clean, minimal box styling, generous breathing space) */}
        <View style={styles.goalsContainer}>
          {filteredGoals.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: theme.surface }]}>
              <Text style={styles.emptyEmoji}>{filter === 'completed' ? '🏆' : '🎯'}</Text>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                {filter === 'completed'
                  ? 'Κανένας ολοκληρωμένος στόχος ακόμη'
                  : filter === 'active'
                  ? 'Δεν υπάρχουν ενεργοί στόχοι'
                  : 'Δεν έχετε ορίσει στόχους'}
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                {filter === 'completed'
                  ? 'Συνεχίστε τις αποταμιεύσεις σας για να ολοκληρώσετε τους στόχους σας!'
                  : 'Ορίστε στόχους αποταμίευσης: Έκτακτο Ταμείο, Διακοπές, Εξοπλισμό κ.ά.'}
              </Text>
              {filter !== 'completed' && (
                <TouchableOpacity
                  style={[styles.emptyAddBtn, { backgroundColor: theme.brandPink }]}
                  onPress={() => setCreateModalVisible(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.emptyAddBtnText}>+ Νέος Στόχος</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredGoals.map((g) => {
              const current = Number(g.current_amount) || 0;
              const target = Number(g.target_amount) || 1;
              const progress = Math.min(100, Math.round((current / target) * 100));
              const isCompleted = g.is_completed || current >= target;
              const remaining = Math.max(0, target - current);

              return (
                <View
                  key={g.id}
                  style={[
                    styles.goalItem,
                    { backgroundColor: theme.surface },
                  ]}
                >
                  {/* Top: Icon, Goal Name, Date & Contextual Action */}
                  <View style={styles.goalItemHeader}>
                    <View style={styles.goalIconTitle}>
                      <View
                        style={[
                          styles.goalIconCircle,
                          { backgroundColor: g.color ? `${g.color}18` : theme.track },
                        ]}
                      >
                        <Text style={styles.goalIconEmoji}>{g.icon || '🎯'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.goalTitleText, { color: theme.textPrimary }]} numberOfLines={1}>
                          {g.name}
                        </Text>
                        <Text style={[styles.goalDateText, { color: theme.textMuted }]}>
                          {g.target_date ? `Έως: ${g.target_date}` : 'Συνεχής στόχος'}
                        </Text>
                      </View>
                    </View>

                    {isCompleted ? (
                      <View style={[styles.completedPill, { backgroundColor: theme.emeraldBg }]}>
                        <CheckIcon size={12} color={theme.emerald} />
                        <Text style={[styles.completedPillText, { color: theme.emerald }]}>Ολοκληρώθηκε</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.depositPillBtn, { backgroundColor: theme.brandPink }]}
                        onPress={() => openDepositModal(g)}
                        activeOpacity={0.85}
                      >
                        <PlusIcon size={12} color="#FFFFFF" />
                        <Text style={styles.depositPillBtnText}>Κατάθεση</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Amounts Row */}
                  <View style={styles.amountsRow}>
                    <View style={styles.amountsLeft}>
                      <Text style={[styles.currentSavedText, { color: theme.textPrimary }]}>
                        €{current.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                      <Text style={[styles.targetSavedText, { color: theme.textMuted }]}>
                        / €{target.toLocaleString('el-GR', { minimumFractionDigits: 0 })}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.percentText,
                        { color: isCompleted ? theme.emerald : theme.textPrimary },
                      ]}
                    >
                      {progress}%
                    </Text>
                  </View>

                  {/* Clean Borderless Progress Bar */}
                  <View style={[styles.progressTrack, { backgroundColor: theme.track }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${progress}%`,
                          backgroundColor: isCompleted ? theme.emerald : theme.brandPink,
                        },
                      ]}
                    />
                  </View>

                  {/* Subtext info */}
                  {!isCompleted && remaining > 0 && (
                    <Text style={[styles.remainingHint, { color: theme.textMuted }]}>
                      Υπολείπονται €{remaining.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  )}
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 96 }} />
      </ScrollView>

      {/* Add Goal Modal */}
      <AddGoalModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSave={onAddGoal}
      />

      {/* Add Funds Modal */}
      <Modal
        visible={fundsModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setFundsModalVisible(false)}
      >
        <View style={styles.depositModalOverlay}>
          <View style={[styles.depositModalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.depositModalTitle, { color: theme.textPrimary }]}>Κατάθεση σε Στόχο</Text>
            <Text style={[styles.depositModalSub, { color: theme.textSecondary }]} numberOfLines={1}>
              {selectedGoal?.name}
            </Text>

            {/* Quick Presets */}
            <View style={styles.presetChipsRow}>
              {depositPresets.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.presetChip,
                    { backgroundColor: theme.track },
                    depositAmount === String(val) && { backgroundColor: theme.brandPink },
                  ]}
                  onPress={() => setDepositAmount(String(val))}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      { color: depositAmount === String(val) ? '#FFFFFF' : theme.textPrimary },
                    ]}
                  >
                    +€{val}
                  </Text>
                </TouchableOpacity>
              ))}
              {remainingForSelected > 0 && remainingForSelected <= 1000 && (
                <TouchableOpacity
                  style={[
                    styles.presetChip,
                    { backgroundColor: theme.emeraldBg },
                    depositAmount === String(remainingForSelected) && { backgroundColor: theme.emerald },
                  ]}
                  onPress={() => setDepositAmount(String(remainingForSelected))}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      { color: depositAmount === String(remainingForSelected) ? '#FFFFFF' : theme.emerald },
                    ]}
                  >
                    Υπόλοιπο
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Amount input */}
            <View style={[styles.depositInputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.hairline }]}>
              <Text style={[styles.depositCurrency, { color: theme.textSecondary }]}>€</Text>
              <TextInput
                style={[styles.depositInput, { color: theme.inputText }]}
                placeholder="0.00"
                placeholderTextColor={theme.inputPlaceholder}
                keyboardType="decimal-pad"
                value={depositAmount}
                onChangeText={setDepositAmount}
                autoFocus
              />
            </View>

            {/* Actions */}
            <View style={styles.depositModalButtons}>
              <TouchableOpacity
                style={[styles.depositCancelBtn, { backgroundColor: theme.track }]}
                onPress={() => {
                  setDepositAmount('');
                  setFundsModalVisible(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.depositCancelText, { color: theme.textSecondary }]}>Άκυρο</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.depositConfirmBtn,
                  { backgroundColor: theme.brandPink },
                  (!depositAmount || parseFloat(depositAmount) <= 0) && { opacity: 0.5 },
                ]}
                onPress={handleDeposit}
                disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                activeOpacity={0.85}
              >
                <Text style={styles.depositConfirmText}>Επιβεβαίωση</Text>
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
  headerAddBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },

  // ─── Pure Pink Hero Section (Clean canvas, borderless) ───
  heroCanvas: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroKicker: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A7F3D0',
  },
  heroBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  heroMainRow: {
    marginBottom: 16,
  },
  heroBigAmount: {
    fontFamily: fonts.heading,
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  heroSubText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.90)',
    marginTop: 2,
    fontWeight: '500',
  },
  heroMetricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.22)',
    paddingTop: 12,
  },
  heroMetricCol: {
    flex: 1,
    alignItems: 'center',
  },
  heroMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  heroMetricLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.78)',
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  heroMetricValue: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroMetricValueMint: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '900',
    color: '#A7F3D0',
  },

  // ─── Filter Pills (Fluid, no rigid box container) ───
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    fontWeight: '700',
  },

  // ─── Goals Container & Fluid Items (Reduced box styles) ───
  goalsContainer: {
    gap: 12,
  },
  goalItem: {
    borderRadius: 16,
    padding: 16,
  },
  goalItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  goalIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  goalIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalIconEmoji: {
    fontSize: 20,
  },
  goalTitleText: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '700',
  },
  goalDateText: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    marginTop: 2,
  },
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  completedPillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    fontWeight: '800',
  },
  depositPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  depositPillBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  amountsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountsLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currentSavedText: {
    fontFamily: fonts.heading,
    fontSize: 17,
    fontWeight: '900',
  },
  targetSavedText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  percentText: {
    fontFamily: fonts.heading,
    fontSize: 14,
    fontWeight: '900',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  remainingHint: {
    fontFamily: fonts.bodyLight,
    fontSize: 11,
    marginTop: 6,
  },

  // ─── Empty State ───
  emptyContainer: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  emptyAddBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyAddBtnText: {
    fontFamily: fonts.heading,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ─── Modal ───
  depositModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  depositModalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  depositModalTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '900',
  },
  depositModalSub: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    marginTop: 2,
    marginBottom: 16,
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  presetChipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    fontWeight: '700',
  },
  depositInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
  },
  depositCurrency: {
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '700',
    marginRight: 8,
  },
  depositInput: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '700',
    padding: 0,
  },
  depositModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  depositCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositCancelText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    fontWeight: '600',
  },
  depositConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositConfirmText: {
    fontFamily: fonts.heading,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
