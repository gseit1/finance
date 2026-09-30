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
import { useTheme } from '../theme/ThemeContext';
import { RecurringRule, Task } from '../types';
import { AppTopHeader } from '../components/AppTopHeader';
import { AddTaskModal } from '../components/AddTaskModal';
import {
  CalendarIcon,
  PlusIcon,
  RepeatIcon,
  CheckIcon,
} from '../components/VectorIcons';

interface CalendarScreenProps {
  tasks: Task[];
  recurringRules: RecurringRule[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenProfile?: () => void;
  onMenuPress?: () => void;
  avatarUrl?: string | null;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  tasks = [],
  recurringRules = [],
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onOpenProfile,
  onMenuPress,
  avatarUrl,
}) => {
  const { theme } = useTheme();
  const [addTaskVisible, setAddTaskVisible] = useState(false);

  // Helper for ISO Date YYYY-MM-DD
  const formatIsoDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayIso = formatIsoDate(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);

  // Generate 7-day strip centered on today
  const weekDays = useMemo(() => {
    const list = [];
    const base = new Date();
    for (let i = -2; i <= 4; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = formatIsoDate(d);
      list.push({
        iso,
        dateNumber: d.getDate(),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday: iso === todayIso,
        hasTasks: tasks.some((t) => t.due_date === iso),
        hasBills: recurringRules.some((r) => r.is_active && r.next_run_date === iso),
      });
    }
    return list;
  }, [todayIso, tasks, recurringRules]);

  // Tasks & Bills for the selected date
  const selectedDateTasks = useMemo(() => {
    return tasks.filter((t) => t.due_date === selectedDate);
  }, [tasks, selectedDate]);

  const selectedDateBills = useMemo(() => {
    return recurringRules.filter(
      (r) => r.is_active && r.next_run_date === selectedDate
    );
  }, [recurringRules, selectedDate]);

  const getReadableSelectedDate = () => {
    try {
      const d = new Date(selectedDate);
      return d.toLocaleDateString('el-GR', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppTopHeader
        title="Ημερολόγιο"
        onMenuPress={onMenuPress}
        onProfilePress={onOpenProfile}
        avatarUrl={avatarUrl}
        rightAction={
          <TouchableOpacity
            style={[styles.headerAddBtn, { backgroundColor: theme.brandPink }]}
            onPress={() => setAddTaskVisible(true)}
            activeOpacity={0.85}
          >
            <PlusIcon size={16} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Interactive 7-Day Calendar Strip (Pure Pink Hero Canvas) */}
        <View style={[styles.weekStripWrapper, { backgroundColor: theme.brandPink, borderWidth: 0 }]}>
          <View style={styles.monthHeaderRow}>
            <Text style={[styles.monthHeaderText, { color: '#FFFFFF' }]}>
              {new Date().toLocaleDateString('el-GR', { month: 'long', year: 'numeric' })}
            </Text>
            {selectedDate !== todayIso && (
              <TouchableOpacity
                onPress={() => setSelectedDate(todayIso)}
                style={[styles.todayPillBtn, { backgroundColor: 'rgba(255, 255, 255, 0.20)', borderColor: 'rgba(255, 255, 255, 0.35)' }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.todayPillText, { color: '#FFFFFF' }]}>Σήμερα</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.dayStripRow}>
            {weekDays.map((day) => {
              const isSelected = day.iso === selectedDate;
              return (
                <TouchableOpacity
                  key={day.iso}
                  style={[
                    styles.dayColumn,
                    { backgroundColor: 'rgba(255, 255, 255, 0.18)' },
                    isSelected && { backgroundColor: '#FFFFFF' },
                  ]}
                  onPress={() => setSelectedDate(day.iso)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.dayNameText,
                      { color: isSelected ? theme.brandPink : 'rgba(255, 255, 255, 0.85)' },
                      isSelected && { fontWeight: '800' },
                    ]}
                  >
                    {day.dayName}
                  </Text>

                  <Text
                    style={[
                      styles.dayNumberText,
                      { color: isSelected ? theme.brandPink : '#FFFFFF' },
                    ]}
                  >
                    {day.dateNumber}
                  </Text>

                  {/* Indicator Dots */}
                  <View style={styles.dayDotsRow}>
                    {day.hasTasks && (
                      <View
                        style={[
                          styles.indicatorDot,
                          { backgroundColor: isSelected ? theme.brandPink : '#A7F3D0' },
                        ]}
                      />
                    )}
                    {day.hasBills && (
                      <View
                        style={[
                          styles.indicatorDot,
                          { backgroundColor: isSelected ? theme.crimson : '#FECDD3' },
                        ]}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Agenda Header for Selected Date */}
        <View style={styles.agendaHeaderRow}>
          <View>
            <Text style={[styles.agendaDateTitle, { color: theme.textPrimary }]}>{getReadableSelectedDate()}</Text>
            <Text style={[styles.agendaDateSub, { color: theme.textMuted }]}>
              {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'Εργασία' : 'Εργασίες'} • {selectedDateBills.length} {selectedDateBills.length === 1 ? 'Πληρωμή' : 'Πληρωμές'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.addTaskInlineBtn, { backgroundColor: theme.brandPink, borderColor: theme.brandPink }]}
            onPress={() => setAddTaskVisible(true)}
            activeOpacity={0.8}
          >
            <PlusIcon size={14} color="#FFFFFF" />
            <Text style={[styles.addTaskInlineText, { color: '#FFFFFF' }]}>Νέα Εργασία</Text>
          </TouchableOpacity>
        </View>

        {/* Tasks Scheduled on Selected Date */}
        <View style={[styles.agendaCardContainer, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
          <Text style={[styles.agendaSectionLabel, { color: theme.textMuted }]}>ΠΡΟΓΡΑΜΜΑΤΙΣΜΕΝΕΣ ΕΡΓΑΣΙΕΣ</Text>
          {selectedDateTasks.length === 0 ? (
            <View style={[styles.emptyDayContainer, { backgroundColor: theme.surface, borderWidth: 0 }]}>
              <Text style={[styles.emptyDayTitle, { color: theme.textPrimary }]}>Καμία εργασία για αυτή την ημέρα</Text>
              <Text style={[styles.emptyDaySub, { color: theme.textSecondary }]}>Οργανώστε το πρόγραμμά σας δημιουργώντας μία.</Text>
              <TouchableOpacity
                style={[styles.emptyAddBtn, { backgroundColor: theme.brandPink }]}
                onPress={() => setAddTaskVisible(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyAddBtnText}>+ Προσθήκη Εργασίας</Text>
              </TouchableOpacity>
            </View>
          ) : (
            selectedDateTasks.map((t) => (
              <View key={t.id} style={[styles.taskCardItem, { borderBottomColor: theme.hairline }]}>
                {/* Checkbox */}
                <TouchableOpacity
                  style={styles.taskCheckbox}
                  onPress={() => onToggleTask(t.id)}
                  activeOpacity={0.7}
                >
                  {t.completed ? (
                    <View style={[styles.taskCheckedBox, { backgroundColor: theme.emerald }]}>
                      <CheckIcon size={12} color="#FFFFFF" />
                    </View>
                  ) : (
                    <View style={[styles.taskUncheckedBox, { borderColor: theme.hairline }]} />
                  )}
                </TouchableOpacity>

                {/* Task Title & Details */}
                <View style={styles.taskContent}>
                  <Text
                    style={[
                      styles.taskItemTitle,
                      { color: theme.textPrimary },
                      t.completed && { textDecorationLine: 'line-through', color: theme.textMuted },
                    ]}
                    numberOfLines={1}
                  >
                    {t.title}
                  </Text>

                  {t.description ? (
                    <Text style={[styles.taskItemDesc, { color: theme.textSecondary }]} numberOfLines={1}>
                      {t.description}
                    </Text>
                  ) : null}

                  {/* Badges: Category & Priority */}
                  <View style={styles.taskBadgeRow}>
                    <View style={[styles.categoryPill, { backgroundColor: theme.track }]}>
                      <Text style={[styles.categoryPillText, { color: theme.textSecondary }]}>{t.category || 'Γενικά'}</Text>
                    </View>

                    <View
                      style={[
                        styles.priorityPill,
                        {
                          backgroundColor:
                            t.priority === 'high'
                              ? theme.crimsonBg
                              : theme.track,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityPillText,
                          {
                            color:
                              t.priority === 'high'
                                ? theme.crimson
                                : theme.textPrimary,
                          },
                        ]}
                      >
                        {t.priority === 'high' ? 'ΥΨΗΛΗ' : t.priority === 'medium' ? 'ΜΕΣΗ' : 'ΧΑΜΗΛΗ'}
                      </Text>
                    </View>
                  </View>

                  {/* Mini Progress Bar */}
                  <View style={styles.taskProgressRow}>
                    <View style={[styles.taskProgressBar, { backgroundColor: theme.track }]}>
                      <View
                        style={[
                          styles.taskProgressFill,
                          { width: `${t.progress}%`, backgroundColor: t.completed ? theme.emerald : theme.brandPink },
                        ]}
                      />
                    </View>
                    <Text style={[styles.taskProgressText, { color: theme.textMuted }]}>{t.progress}%</Text>
                  </View>
                </View>

                {/* Delete Option */}
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('Διαγραφή Εργασίας', `Θέλετε να διαγράψετε την εργασία "${t.title}";`, [
                      { text: 'Ακύρωση', style: 'cancel' },
                      {
                        text: 'Διαγραφή',
                        style: 'destructive',
                        onPress: () => onDeleteTask(t.id),
                      },
                    ]);
                  }}
                  style={styles.taskDeleteBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[styles.taskDeleteText, { color: theme.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Recurring Financial Obligations for this day */}
        {selectedDateBills.length > 0 && (
          <View style={[styles.agendaCardContainer, { marginTop: 18, backgroundColor: theme.surface, borderColor: theme.hairline }]}>
            <Text style={[styles.agendaSectionLabel, { color: theme.textMuted }]}>ΟΙΚΟΝΟΜΙΚΕΣ ΥΠΟΧΡΕΩΣΕΙΣ</Text>
            {selectedDateBills.map((b) => (
              <View key={b.id} style={[styles.billDueCard, { backgroundColor: theme.surface }]}>
                <View style={styles.billDueLeft}>
                  <View style={[styles.billDueBadge, { backgroundColor: theme.crimsonBg }]}>
                    <RepeatIcon size={16} color={theme.crimson} />
                  </View>
                  <View>
                    <Text style={[styles.billDueDesc, { color: theme.textPrimary }]}>{b.description}</Text>
                    <Text style={[styles.billDueMeta, { color: theme.crimson }]}>
                      Σήμερα • {b.frequency === 'monthly' ? 'Μηνιαία' : b.frequency === 'weekly' ? 'Εβδομαδιαία' : b.frequency === 'yearly' ? 'Ετήσια' : b.frequency}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.billDueAmount, { color: theme.textPrimary }]}>€{b.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* All Tasks Summary Strip */}
        <View style={[styles.agendaCardContainer, { marginTop: 18, backgroundColor: theme.surface, borderColor: theme.hairline }]}>
          <Text style={[styles.agendaSectionLabel, { color: theme.textMuted }]}>ΟΛΕΣ ΟΙ ΕΝΕΡΓΕΣ ΕΡΓΑΣΙΕΣ ({tasks.length})</Text>
          {tasks.slice(0, 6).map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.quickTaskRow, { backgroundColor: theme.surface, borderBottomColor: theme.hairline }]}
              onPress={() => onToggleTask(t.id)}
              activeOpacity={0.7}
            >
              <View style={styles.quickTaskLeft}>
                <View
                  style={[
                    styles.quickDot,
                    { backgroundColor: t.completed ? theme.emerald : theme.brandPink },
                  ]}
                />
                <Text
                  style={[
                    styles.quickTaskTitle,
                    { color: theme.textPrimary },
                    t.completed && { textDecorationLine: 'line-through', color: theme.textMuted },
                  ]}
                  numberOfLines={1}
                >
                  {t.title}
                </Text>
              </View>

              <Text style={[styles.quickTaskDate, { color: theme.textMuted }]}>{t.due_date}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Add Task Modal */}
      <AddTaskModal
        visible={addTaskVisible}
        onClose={() => setAddTaskVisible(false)}
        onSave={onAddTask}
        initialDate={selectedDate}
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  weekStripWrapper: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  monthHeaderText: {
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  todayPillBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  todayPillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    fontWeight: '700',
  },
  dayStripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    width: 44,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  dayColumnSelected: {},
  dayNameText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayNameTextSelected: {},
  dayNumberText: {
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '900',
  },
  dayNumberTextSelected: {},
  dayDotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 6,
    height: 5,
    alignItems: 'center',
  },
  indicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  agendaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  agendaDateTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  agendaDateSub: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    marginTop: 1,
  },
  addTaskInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  addTaskInlineText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    fontWeight: '700',
  },
  agendaCardContainer: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  agendaSectionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  emptyDayContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyDayTitle: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyDaySub: {
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    marginBottom: 14,
  },
  emptyAddBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  taskCardItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
  },
  taskCheckbox: {
    marginTop: 3,
    marginRight: 12,
  },
  taskUncheckedBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D4D4D8',
  },
  taskCheckedBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskContent: {
    flex: 1,
    paddingRight: 8,
  },
  taskItemTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  taskCompletedTitle: {
    textDecorationLine: 'line-through',
    color: '#A1A1AA',
  },
  taskItemDesc: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  taskBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    alignItems: 'center',
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#F4F4F5',
  },
  categoryPillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    fontWeight: '600',
    color: '#71717A',
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityHigh: {
    backgroundColor: '#FFF1F2',
  },
  priorityMedium: {
    backgroundColor: '#F4F4F5',
  },
  priorityLow: {
    backgroundColor: '#F4F4F5',
  },
  priorityPillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    fontWeight: '800',
    color: '#0A0A0A',
  },
  taskProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  taskProgressBar: {
    flex: 1,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#F4F4F5',
    overflow: 'hidden',
  },
  taskProgressFill: {
    height: '100%',
    borderRadius: 2.5,
    backgroundColor: '#0A0A0A',
  },
  taskProgressText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#71717A',
  },
  taskDeleteBtn: {
    padding: 4,
  },
  taskDeleteText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: '#71717A',
    fontWeight: '700',
  },
  billDueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  billDueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  billDueBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  billDueDesc: {
    fontFamily: fonts.heading,
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  billDueMeta: {
    fontFamily: fonts.bodyLight,
    fontSize: 11,
    color: '#E11D48',
    fontWeight: '600',
    marginTop: 1,
  },
  billDueAmount: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '900',
    color: '#0A0A0A',
  },
  quickTaskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
  },
  quickTaskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 8,
  },
  quickDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  quickTaskTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    fontWeight: '600',
    color: '#0A0A0A',
  },
  quickTaskDate: {
    fontFamily: fonts.bodyLight,
    fontSize: 11,
    color: '#71717A',
    fontWeight: '500',
  },
});
