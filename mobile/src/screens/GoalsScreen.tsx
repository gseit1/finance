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
  GoalsIcon,
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

export const GoalsScreen: React.FC<GoalsScreenProps> = ({
  goals = [],
  onAddGoal,
  onAddFundsToGoal,
  onOpenProfile,
  onMenuPress,
  avatarUrl,
}) => {
  const { theme } = useTheme();
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
    const completedCount = goals.filter((g) => g.is_completed || g.current_amount >= g.target_amount).length;

    return {
      totalTarget,
      totalSaved,
      overallProgress,
      completedCount,
    };
  }, [goals]);

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!selectedGoal || isNaN(amount) || amount <= 0) return;

    onAddFundsToGoal(selectedGoal.id, amount);
    setDepositAmount('');
    setFundsModalVisible(false);
    setSelectedGoal(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <AppTopHeader
        title="Οικονομικοί Στόχοι"
        onMenuPress={onMenuPress}
        onProfilePress={onOpenProfile}
        avatarUrl={avatarUrl}
        rightAction={
          <TouchableOpacity
            style={[styles.headerAddBtn, { backgroundColor: theme.buttonPrimaryBg }]}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.85}
          >
            <PlusIcon size={16} color={theme.buttonPrimaryText} />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Compact goals summary bar */}
        <View style={[styles.summaryBar, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
          <View style={styles.summaryCol}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Στόχοι</Text>
            <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>{goals.length}</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.hairline }]} />
          <View style={styles.summaryCol}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Αποταμιευμένα</Text>
            <Text style={[styles.summaryValue, { color: theme.emerald }]}>
              €{summary.totalSaved.toLocaleString('el-GR', { minimumFractionDigits: 0 })}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.hairline }]} />
          <View style={styles.summaryCol}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Πρόοδος</Text>
            <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>{summary.overallProgress}%</Text>
          </View>
        </View>

        {/* Goals List */}
        <View style={styles.goalsContainer}>
          <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>ΕΝΕΡΓΟΙ ΣΤΟΧΟΙ ({goals.length})</Text>

          {goals.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Δεν έχετε ορίσει στόχους</Text>
              <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                Ορίστε στόχους αποταμίευσης: Έκτακτο Ταμείο, Διακοπές, Εξοπλισμό.
              </Text>
              <TouchableOpacity
                style={[styles.emptyAddBtn, { backgroundColor: theme.buttonPrimaryBg }]}
                onPress={() => setCreateModalVisible(true)}
                activeOpacity={0.85}
              >
                <Text style={[styles.emptyAddBtnText, { color: theme.buttonPrimaryText }]}>+ Νέος Στόχος</Text>
              </TouchableOpacity>
            </View>
          ) : (
            goals.map((g) => {
              const current = Number(g.current_amount) || 0;
              const target = Number(g.target_amount) || 1;
              const progress = Math.min(100, Math.round((current / target) * 100));
              const isCompleted = g.is_completed || current >= target;

              return (
                <View key={g.id} style={[styles.goalCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
                  <View style={styles.goalCardTop}>
                    <View style={styles.goalIconTitle}>
                      <View
                        style={[
                          styles.goalIconBadge,
                          { backgroundColor: g.color ? `${g.color}20` : '#F4F4F5' },
                        ]}
                      >
                        <Text style={styles.goalIconEmoji}>{g.icon || '🎯'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.goalName, { color: theme.textPrimary }]} numberOfLines={1}>
                          {g.name}
                        </Text>
                        <Text style={[styles.goalDate, { color: theme.textMuted }]}>
                          {g.target_date ? `Στόχος: ${g.target_date}` : 'Συνεχής στόχος'}
                        </Text>
                      </View>
                    </View>

                    {isCompleted ? (
                      <View style={[styles.completedBadge, { backgroundColor: theme.emerald }]}>
                        <CheckIcon size={12} color="#FFFFFF" />
                        <Text style={styles.completedBadgeText}>ΟΛΟΚΛΗΡΩΘΗΚΕ</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.addFundsBtn, { backgroundColor: theme.track, borderColor: theme.hairline }]}
                        onPress={() => {
                          setSelectedGoal(g);
                          setFundsModalVisible(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <PlusIcon size={12} color={theme.textPrimary} />
                        <Text style={[styles.addFundsBtnText, { color: theme.textPrimary }]}>Κατάθεση</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Amounts */}
                  <View style={styles.amountsRow}>
                    <Text style={[styles.currentAmountText, { color: theme.textPrimary }]}>
                      €{current.toLocaleString('el-GR', { minimumFractionDigits: 2 })}
                    </Text>
                    <Text style={[styles.targetAmountText, { color: theme.textMuted }]}>
                      από €{target.toLocaleString('el-GR', { minimumFractionDigits: 2 })}
                    </Text>
                    <Text style={[styles.progressPercentText, { color: theme.textSecondary }]}>{progress}%</Text>
                  </View>

                  {/* Progress Bar */}
                  <View style={[styles.progressBarTrack, { backgroundColor: theme.track }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${progress}%`,
                          backgroundColor: isCompleted ? theme.emerald : theme.textPrimary,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 90 }} />
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
          <View style={styles.depositModalCard}>
            <Text style={[styles.depositModalTitle, { color: theme.textPrimary }]}>Κατάθεση σε Στόχο</Text>
            <Text style={styles.depositModalSub}>
              {selectedGoal?.name}
            </Text>

            <TextInput
              style={styles.depositInput}
              placeholder="Ποσό σε EUR (€)"
              placeholderTextColor={theme.inputPlaceholder}
              keyboardType="decimal-pad"
              value={depositAmount}
              onChangeText={setDepositAmount}
              autoFocus
            />

            <View style={styles.depositModalButtons}>
              <TouchableOpacity
                style={styles.depositCancelBtn}
                onPress={() => {
                  setDepositAmount('');
                  setFundsModalVisible(false);
                }}
              >
                <Text style={styles.depositCancelText}>Áκυρο</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.depositConfirmBtn}
                onPress={handleDeposit}
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
    backgroundColor: '#F7F7F8',
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
    paddingTop: 12,
    paddingBottom: 24,
  },
  // ─── Compact summary bar ───
  summaryBar: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 32,
    marginHorizontal: 4,
  },
  summaryLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  summaryValue: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  lavenderCard: {
    backgroundColor: '#F4F4F5',
  },
  mintCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  peachCard: {
    backgroundColor: '#F4F4F5',
  },
  statLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    fontWeight: '600',
    color: '#71717A',
    marginBottom: 4,
  },
  statValue: {
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '900',
    color: '#0A0A0A',
    letterSpacing: -0.3,
  },
  statSub: {
    fontFamily: fonts.bodyLight,
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 2,
    fontWeight: '500',
  },
  goalsContainer: {
    gap: 14,
  },
  sectionHeader: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  goalCardTop: {
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
    paddingRight: 10,
  },
  goalIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalIconEmoji: {
    fontSize: 20,
  },
  goalName: {
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  goalDate: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#059669',
  },
  completedBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  addFundsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F4F4F5',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  addFundsBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  amountsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currentAmountText: {
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '900',
    color: '#0A0A0A',
  },
  targetAmountText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: '#71717A',
    marginLeft: 6,
    fontWeight: '500',
    flex: 1,
  },
  progressPercentText: {
    fontFamily: fonts.heading,
    fontSize: 14,
    fontWeight: '900',
    color: '#059669',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F4F4F5',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
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
    marginBottom: 16,
  },
  emptyAddBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#0A0A0A',
  },
  emptyAddBtnText: {
    fontFamily: fonts.heading,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  depositModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  depositModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  depositModalTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '900',
    color: '#0A0A0A',
  },
  depositModalSub: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: '#71717A',
    marginTop: 2,
    marginBottom: 16,
  },
  depositInput: {
    fontFamily: fonts.body,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0A0A0A',
    marginBottom: 18,
  },
  depositModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  depositCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
  },
  depositCancelText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    fontWeight: '600',
    color: '#71717A',
  },
  depositConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
  },
  depositConfirmText: {
    fontFamily: fonts.heading,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
