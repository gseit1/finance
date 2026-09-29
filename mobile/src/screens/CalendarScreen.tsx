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
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  };

  return (
    <View style={styles.container}>
      <AppTopHeader
        title=""
        onMenuPress={onMenuPress}
        onProfilePress={onOpenProfile}
        avatarUrl={avatarUrl}
        rightAction={
          <TouchableOpacity
            style={styles.headerAddBtn}
            onPress={() => setAddTaskVisible(true)}
            activeOpacity={0.85}
          >
            <PlusIcon size={16} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>Calendar & Agenda</Text>
        </View>

        {/* Interactive 7-Day Calendar Strip */}
        <View style={styles.weekStripWrapper}>
          <View style={styles.monthHeaderRow}>
            <Text style={styles.monthHeaderText}>
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            {selectedDate !== todayIso && (
              <TouchableOpacity
                onPress={() => setSelectedDate(todayIso)}
                style={styles.todayPillBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.todayPillText}>Today</Text>
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
                    isSelected && styles.dayColumnSelected,
                  ]}
                  onPress={() => setSelectedDate(day.iso)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.dayNameText,
                      isSelected && styles.dayNameTextSelected,
                    ]}
                  >
                    {day.dayName}
                  </Text>

                  <Text
                    style={[
                      styles.dayNumberText,
                      isSelected && styles.dayNumberTextSelected,
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
                          { backgroundColor: isSelected ? '#FFFFFF' : '#059669' },
                        ]}
                      />
                    )}
                    {day.hasBills && (
                      <View
                        style={[
                          styles.indicatorDot,
                          { backgroundColor: isSelected ? '#FFFFFF' : '#E11D48' },
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
            <Text style={styles.agendaDateTitle}>{getReadableSelectedDate()}</Text>
            <Text style={styles.agendaDateSub}>
              {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'Task' : 'Tasks'} • {selectedDateBills.length} {selectedDateBills.length === 1 ? 'Bill' : 'Bills'} Due
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addTaskInlineBtn}
            onPress={() => setAddTaskVisible(true)}
            activeOpacity={0.8}
          >
            <PlusIcon size={14} color="#0A0A0A" />
            <Text style={styles.addTaskInlineText}>Add Task</Text>
          </TouchableOpacity>
        </View>

        {/* Tasks Scheduled on Selected Date */}
        <View style={styles.agendaCardContainer}>
          <Text style={styles.agendaSectionLabel}>SCHEDULED TASKS</Text>
          {selectedDateTasks.length === 0 ? (
            <View style={styles.emptyDayContainer}>
              <Text style={styles.emptyDayTitle}>No tasks for this day</Text>
              <Text style={styles.emptyDaySub}>Stay ahead of your schedule by creating one.</Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => setAddTaskVisible(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyAddBtnText}>+ Schedule Task</Text>
              </TouchableOpacity>
            </View>
          ) : (
            selectedDateTasks.map((t) => (
              <View key={t.id} style={styles.taskCardItem}>
                {/* Checkbox */}
                <TouchableOpacity
                  style={styles.taskCheckbox}
                  onPress={() => onToggleTask(t.id)}
                  activeOpacity={0.7}
                >
                  {t.completed ? (
                    <View style={styles.taskCheckedBox}>
                      <CheckIcon size={12} color="#FFFFFF" />
                    </View>
                  ) : (
                    <View style={styles.taskUncheckedBox} />
                  )}
                </TouchableOpacity>

                {/* Task Title & Details */}
                <View style={styles.taskContent}>
                  <Text
                    style={[
                      styles.taskItemTitle,
                      t.completed && styles.taskCompletedTitle,
                    ]}
                    numberOfLines={1}
                  >
                    {t.title}
                  </Text>

                  {t.description ? (
                    <Text style={styles.taskItemDesc} numberOfLines={1}>
                      {t.description}
                    </Text>
                  ) : null}

                  {/* Badges: Category & Priority */}
                  <View style={styles.taskBadgeRow}>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>{t.category || 'General'}</Text>
                    </View>

                    <View
                      style={[
                        styles.priorityPill,
                        t.priority === 'high'
                          ? styles.priorityHigh
                          : t.priority === 'medium'
                            ? styles.priorityMedium
                            : styles.priorityLow,
                      ]}
                    >
                      <Text style={styles.priorityPillText}>
                        {(t.priority || 'medium').toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Mini Progress Bar */}
                  <View style={styles.taskProgressRow}>
                    <View style={styles.taskProgressBar}>
                      <View
                        style={[
                          styles.taskProgressFill,
                          { width: `${t.progress}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.taskProgressText}>{t.progress}%</Text>
                  </View>
                </View>

                {/* Delete Option */}
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('Delete Task', `Remove "${t.title}"?`, [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => onDeleteTask(t.id),
                      },
                    ]);
                  }}
                  style={styles.taskDeleteBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.taskDeleteText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Recurring Financial Obligations for this day */}
        {selectedDateBills.length > 0 && (
          <View style={[styles.agendaCardContainer, { marginTop: 18 }]}>
            <Text style={styles.agendaSectionLabel}>FINANCIAL OBLIGATIONS</Text>
            {selectedDateBills.map((b) => (
              <View key={b.id} style={styles.billDueCard}>
                <View style={styles.billDueLeft}>
                  <View style={styles.billDueBadge}>
                    <RepeatIcon size={16} color="#E11D48" />
                  </View>
                  <View>
                    <Text style={styles.billDueDesc}>{b.description}</Text>
                    <Text style={styles.billDueMeta}>Due Today • {b.frequency}</Text>
                  </View>
                </View>
                <Text style={styles.billDueAmount}>€{b.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* All Tasks Summary Strip */}
        <View style={[styles.agendaCardContainer, { marginTop: 18 }]}>
          <Text style={styles.agendaSectionLabel}>ALL ACTIVE TASKS ({tasks.length})</Text>
          {tasks.slice(0, 6).map((t) => (
            <TouchableOpacity
              key={t.id}
              style={styles.quickTaskRow}
              onPress={() => onToggleTask(t.id)}
              activeOpacity={0.7}
            >
              <View style={styles.quickTaskLeft}>
                <View
                  style={[
                    styles.quickDot,
                    { backgroundColor: t.completed ? '#10B981' : '#6355E6' },
                  ]}
                />
                <Text
                  style={[
                    styles.quickTaskTitle,
                    t.completed && styles.taskCompletedTitle,
                  ]}
                  numberOfLines={1}
                >
                  {t.title}
                </Text>
              </View>

              <Text style={styles.quickTaskDate}>{t.due_date}</Text>
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  titleRow: {
    marginBottom: 16,
  },
  screenTitle: {
    fontFamily: fonts.heading,
    fontSize: 26,
    fontWeight: '900',
    color: '#0A0A0A',
    letterSpacing: -0.5,
  },
  weekStripWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
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
    color: '#0A0A0A',
    letterSpacing: -0.2,
  },
  todayPillBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F4F4F5',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  todayPillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#0A0A0A',
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
    backgroundColor: '#F4F4F5',
  },
  dayColumnSelected: {
    backgroundColor: '#0A0A0A',
  },
  dayNameText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    fontWeight: '600',
    color: '#71717A',
    marginBottom: 4,
  },
  dayNameTextSelected: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  dayNumberText: {
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '900',
    color: '#0A0A0A',
  },
  dayNumberTextSelected: {
    color: '#FFFFFF',
  },
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
    color: '#0A0A0A',
    letterSpacing: -0.3,
  },
  agendaDateSub: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    color: '#71717A',
    marginTop: 1,
  },
  addTaskInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F4F4F5',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  addTaskInlineText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  agendaCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
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
    color: '#0A0A0A',
    marginBottom: 4,
  },
  emptyDaySub: {
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    color: '#71717A',
    marginBottom: 14,
  },
  emptyAddBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#0A0A0A',
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
    fontFamily: fonts.heading,
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
