import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { colors } from '../theme/colors';
import { Goal } from '../types';
import { AddGoalModal } from '../components/AddGoalModal';
import { AppTopHeader } from '../components/AppTopHeader';

interface GoalsScreenProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onAddFundsToGoal: (goalId: string, amount: number) => void;
  onOpenProfile?: () => void;
  avatarUrl?: string | null;
}

export const GoalsScreen: React.FC<GoalsScreenProps> = ({
  goals,
  onAddGoal,
  onAddFundsToGoal,
  onOpenProfile,
  avatarUrl,
}) => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [fundsModalVisible, setFundsModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Overall Goals Metrics
  const summary = useMemo(() => {
    let totalTarget = 0;
    let totalSaved = 0;
    let completedCount = 0;

    goals.forEach((g) => {
      totalTarget += g.target_amount;
      totalSaved += g.current_amount;
      if (g.current_amount >= g.target_amount) completedCount += 1;
    });

    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    return {
      totalTarget,
      totalSaved,
      completedCount,
      overallProgress: Math.min(overallProgress, 100).toFixed(0),
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
    <View style={styles.container}>
      {/* Global Notch & Status Bar Protected Top Header */}
      <AppTopHeader
        title="Goals"
        showPulse
        onProfilePress={onOpenProfile}
        avatarUrl={avatarUrl}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Unified 3-Column Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.dataCol}>
            <Text style={styles.dataLabel}>TOTAL SAVED</Text>
            <Text style={[styles.dataValue, { color: colors.inflow }]}>
              €{summary.totalSaved.toLocaleString()}
            </Text>
          </View>

          <View style={styles.dataDivider} />

          <View style={styles.dataCol}>
            <Text style={styles.dataLabel}>TARGET</Text>
            <Text style={styles.dataValue}>€{summary.totalTarget.toLocaleString()}</Text>
          </View>

          <View style={styles.dataDivider} />

          <View style={styles.dataCol}>
            <Text style={styles.dataLabel}>PROGRESS</Text>
            <Text style={styles.dataValue}>{summary.overallProgress}%</Text>
          </View>
        </View>

        {/* Interactive Tactile Goal Cards */}
        <View style={styles.goalsContainer}>
          <Text style={styles.sectionEyebrow}>ACTIVE TARGETS</Text>

          {goals.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>NO GOALS ESTABLISHED</Text>
              <Text style={styles.emptySub}>Tap below to create your first savings target.</Text>
            </View>
          ) : (
            goals.map((g) => {
              const progress = Math.min((g.current_amount / g.target_amount) * 100, 100);
              const isFinished = g.current_amount >= g.target_amount;

              return (
                <TouchableOpacity
                  key={g.id}
                  style={styles.interactiveGoalCard}
                  activeOpacity={0.75}
                  onPress={() => {
                    setSelectedGoal(g);
                    setFundsModalVisible(true);
                  }}
                >
                  {/* Top card row: Slate monochrome container + title/date + status */}
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.titleGroup}>
                      {/* Monochrome Slate Container */}
                      <View style={styles.iconSlateContainer}>
                        <Text style={styles.iconInitial}>
                          {g.name.slice(0, 1).toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.goalTitle}>{g.name}</Text>
                        {g.target_date && (
                          <Text style={styles.goalDate}>TARGET: {g.target_date.toUpperCase()}</Text>
                        )}
                      </View>
                    </View>

                    {isFinished ? (
                      <View style={styles.completedPill}>
                        <Text style={styles.completedPillText}>REACHED</Text>
                      </View>
                    ) : (
                      <View style={styles.tapPill}>
                        <Text style={styles.tapPillText}>+ ADD</Text>
                      </View>
                    )}
                  </View>

                  {/* Monospace Figures & Bold Percentage */}
                  <View style={styles.figuresRow}>
                    <Text style={styles.figuresRatio}>
                      €{g.current_amount.toLocaleString()}{' '}
                      <Text style={styles.figuresTarget}>/ €{g.target_amount.toLocaleString()}</Text>
                    </Text>
                    <Text style={[styles.percentageText, isFinished && { color: colors.inflow }]}>
                      {progress.toFixed(0)}%
                    </Text>
                  </View>

                  {/* Sleek 4px Bar with Subtle Gradient / Monochrome Fill */}
                  <View style={styles.track}>
                    <View
                      style={[
                        styles.fill,
                        {
                          width: `${progress}%`,
                          backgroundColor: isFinished ? colors.inflow : '#FAFAFA',
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setCreateModalVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+ Add Goal</Text>
      </TouchableOpacity>

      {/* Dedicated Add Goal Modal */}
      <AddGoalModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSave={onAddGoal}
      />

      {/* Tactile Deposit Funds Modal */}
      <Modal
        visible={fundsModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setFundsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.depositSheet}>
            <View style={styles.depositHeader}>
              <View>
                <Text style={styles.depositEyebrow}>CONTRIBUTE TO GOAL</Text>
                <Text style={styles.depositTitle}>{selectedGoal?.name}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setFundsModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>AMOUNT (€)</Text>
            <View style={styles.amountInputBox}>
              <Text style={styles.currencyPrefix}>€</Text>
              <TextInput
                style={styles.largeInput}
                placeholder="0.00"
                placeholderTextColor="#71717A"
                keyboardType="decimal-pad"
                value={depositAmount}
                onChangeText={setDepositAmount}
                autoFocus
              />
            </View>

            <TouchableOpacity style={styles.depositSubmitBtn} onPress={handleDeposit}>
              <Text style={styles.depositSubmitText}>Deposit Funds</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141416',
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 20,
  },
  dataCol: {
    flex: 1,
    alignItems: 'center',
  },
  dataLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1,
    color: '#71717A',
    fontWeight: '700',
    marginBottom: 4,
  },
  dataValue: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '800',
    color: '#FAFAFA',
    fontVariant: ['tabular-nums'],
  },
  dataDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  goalsContainer: {
    marginHorizontal: 20,
  },
  sectionEyebrow: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#71717A',
    fontWeight: '700',
    marginBottom: 10,
  },
  interactiveGoalCard: {
    backgroundColor: '#141416',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconSlateContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(39, 39, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconInitial: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '800',
    color: '#FAFAFA',
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FAFAFA',
    letterSpacing: -0.2,
  },
  goalDate: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#71717A',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  completedPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  completedPillText: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '800',
    color: colors.inflow,
    letterSpacing: 0.8,
  },
  tapPill: {
    backgroundColor: '#1E1E22',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tapPillText: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
    color: '#FAFAFA',
  },
  figuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  figuresRatio: {
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: '800',
    color: '#FAFAFA',
    fontVariant: ['tabular-nums'],
  },
  figuresTarget: {
    fontSize: 12,
    fontWeight: '500',
    color: '#71717A',
  },
  percentageText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '800',
    color: '#FAFAFA',
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 4,
    backgroundColor: '#27272A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  emptyCard: {
    backgroundColor: '#141416',
    padding: 32,
    borderRadius: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  emptyTitle: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#71717A',
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#A1A1AA',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 92,
    right: 20,
    backgroundColor: '#FAFAFA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    color: '#09090B',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  depositSheet: {
    backgroundColor: '#141416',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  depositHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  depositEyebrow: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1.5,
    color: '#71717A',
    fontWeight: '700',
    marginBottom: 2,
  },
  depositTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FAFAFA',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#1E1E22',
  },
  closeText: {
    fontSize: 14,
    color: '#A1A1AA',
    fontWeight: '700',
  },
  inputLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1,
    color: '#71717A',
    fontWeight: '700',
    marginBottom: 6,
  },
  amountInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F0F11',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
  },
  currencyPrefix: {
    fontFamily: 'monospace',
    fontSize: 28,
    fontWeight: '800',
    color: '#FAFAFA',
    marginRight: 6,
  },
  largeInput: {
    flex: 1,
    fontFamily: 'monospace',
    color: '#FAFAFA',
    fontSize: 28,
    fontWeight: '800',
    padding: 0,
  },
  depositSubmitBtn: {
    backgroundColor: '#FAFAFA',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  depositSubmitText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#09090B',
  },
});
