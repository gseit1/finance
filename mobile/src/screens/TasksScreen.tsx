import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { fonts } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';
import { Task } from '../types';
import { AddTaskModal } from '../components/AddTaskModal';
import { AppTopHeader } from '../components/AppTopHeader';
import {
  SearchIcon,
  PlusIcon,
  CheckIcon,
} from '../components/VectorIcons';

interface TasksScreenProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenProfile?: () => void;
  onMenuPress?: () => void;
  avatarUrl?: string | null;
}

type FilterChip = 'all' | 'todo' | 'inprogress' | 'completed';

export const TasksScreen: React.FC<TasksScreenProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onOpenProfile,
  onMenuPress,
  avatarUrl,
}) => {
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterChip>('all');
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Status Counts
  const todoCount = tasks.filter((t) => !t.completed && (t.progress === 0 || t.progress < 50)).length;
  const inProgressCount = tasks.filter((t) => !t.completed && t.progress >= 50).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Filter tab
      if (activeFilter === 'todo' && (t.completed || t.progress >= 50)) return false;
      if (activeFilter === 'inprogress' && (t.completed || t.progress < 50)) return false;
      if (activeFilter === 'completed' && !t.completed) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = (t.title || '').toLowerCase().includes(q);
        const mDesc = (t.description || '').toLowerCase().includes(q);
        const mCat = (t.category || '').toLowerCase().includes(q);
        if (!mTitle && !mDesc && !mCat) return false;
      }
      return true;
    });
  }, [tasks, activeFilter, searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar with Menu & Plus Button */}
      <AppTopHeader
        title="Εργασίες & Στόχοι"
        onMenuPress={onMenuPress}
        onProfilePress={onOpenProfile}
        avatarUrl={avatarUrl}
        rightAction={
          <View style={styles.headerRightGroup}>
            <TouchableOpacity
              style={[styles.searchIconButton, { backgroundColor: theme.iconButtonBg, borderColor: theme.iconButtonBorder }]}
              onPress={() => setIsSearching(!isSearching)}
              activeOpacity={0.7}
            >
              <SearchIcon size={18} color={theme.iconButtonColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addIconButton, { backgroundColor: theme.buttonPrimaryBg }]}
              onPress={() => setTaskModalVisible(true)}
              activeOpacity={0.85}
            >
              <PlusIcon size={16} color={theme.buttonPrimaryText} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        {isSearching && (
          <View style={[styles.searchBarContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
            <SearchIcon size={16} color="#9CA3AF" />
            <TextInput
              style={[styles.searchInput, { color: theme.inputText }]}
              placeholder="Αναζήτηση εργασιών, κατηγοριών..."
              placeholderTextColor={theme.inputPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={[styles.clearSearch, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
          <TouchableOpacity
            style={[styles.pill, { backgroundColor: activeFilter === 'all' ? theme.buttonPrimaryBg : theme.pillBg, borderColor: activeFilter === 'all' ? theme.buttonPrimaryBg : theme.hairline }]}
            onPress={() => setActiveFilter('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, { color: activeFilter === 'all' ? theme.buttonPrimaryText : theme.pillText }]}>
              Όλες ({tasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, { backgroundColor: activeFilter === 'todo' ? theme.buttonPrimaryBg : theme.pillBg, borderColor: activeFilter === 'todo' ? theme.buttonPrimaryBg : theme.hairline }]}
            onPress={() => setActiveFilter('todo')}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, { color: activeFilter === 'todo' ? theme.buttonPrimaryText : theme.pillText }]}>
              Προς Εκτέλεση ({todoCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, { backgroundColor: activeFilter === 'inprogress' ? theme.buttonPrimaryBg : theme.pillBg, borderColor: activeFilter === 'inprogress' ? theme.buttonPrimaryBg : theme.hairline }]}
            onPress={() => setActiveFilter('inprogress')}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, { color: activeFilter === 'inprogress' ? theme.buttonPrimaryText : theme.pillText }]}>
              Σε Εξέλιξη ({inProgressCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, { backgroundColor: activeFilter === 'completed' ? theme.buttonPrimaryBg : theme.pillBg, borderColor: activeFilter === 'completed' ? theme.buttonPrimaryBg : theme.hairline }]}
            onPress={() => setActiveFilter('completed')}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, { color: activeFilter === 'completed' ? theme.buttonPrimaryText : theme.pillText }]}>
              Ολοκληρωμένες ({completedCount})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 3 Status Summary Cards */}
        <View style={styles.summaryRow}>
          <TouchableOpacity
            style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}
            onPress={() => setActiveFilter('todo')}
            activeOpacity={0.8}
          >
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Προς Εκτέλεση</Text>
            <Text style={[styles.summaryNumber, { color: theme.textPrimary }]}>{todoCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}
            onPress={() => setActiveFilter('inprogress')}
            activeOpacity={0.8}
          >
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Σε Εξέλιξη</Text>
            <Text style={[styles.summaryNumber, { color: theme.textSecondary }]}>{inProgressCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}
            onPress={() => setActiveFilter('completed')}
            activeOpacity={0.8}
          >
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Ολοκληρωμένες</Text>
            <Text style={[styles.summaryNumber, { color: theme.emerald }]}>{completedCount}</Text>
          </TouchableOpacity>
        </View>

        {/* Task Items List */}
        <View style={styles.taskList}>
          {filteredTasks.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Δεν βρέθηκαν εργασίες</Text>
              <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Πατήστε + για να δημιουργήσετε νέα εργασία.</Text>
            </View>
          ) : (
            filteredTasks.map((t) => (
              <View key={t.id} style={[styles.taskCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
                {/* Left: Radio / Check Status Icon */}
                <TouchableOpacity
                  style={styles.radioWrapper}
                  onPress={() => onToggleTask(t.id)}
                  activeOpacity={0.7}
                >
                  {t.completed ? (
                    <View style={styles.checkedCircle}>
                      <CheckIcon size={12} color="#FFFFFF" />
                    </View>
                  ) : (
                    <View style={styles.uncheckedCircle} />
                  )}
                </TouchableOpacity>

                {/* Middle: Title & Status */}
                <View style={styles.taskDetails}>
                  <Text
                    style={[styles.taskTitle, { color: theme.textPrimary }, t.completed && styles.completedText]}
                    numberOfLines={1}
                  >
                    {t.title}
                  </Text>

                  {t.description ? (
                    <Text style={[styles.taskDesc, { color: theme.textSecondary }]} numberOfLines={1}>
                      {t.description}
                    </Text>
                  ) : null}

                  <View style={styles.metaRow}>
                    <View style={[styles.categoryPill, { backgroundColor: theme.track }]}>
                      <Text style={[styles.categoryPillText, { color: theme.textSecondary }]}>{t.category || 'Γενικά'}</Text>
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
                      <Text style={[styles.priorityPillText, { color: t.priority === 'high' ? theme.crimson : theme.textPrimary }]}>
                        {t.priority === 'high' ? 'ΥΨΗΛΗ' : t.priority === 'medium' ? 'ΜΕΣΗ' : 'ΧΑΜΗΛΗ'}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressRow}>
                    <View style={[styles.progressBarTrack, { backgroundColor: theme.track }]}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${t.progress}%` },
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressText, { color: theme.textMuted }]}>{t.progress}%</Text>
                  </View>
                </View>

                {/* Right: Due Date & Action */}
                <View style={styles.taskRight}>
                  <Text style={[styles.taskDueDate, { color: theme.textSecondary }]}>{t.due_date}</Text>

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
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ marginTop: 8 }}
                  >
                    <Text style={styles.deleteLink}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Add Task Modal */}
      <AddTaskModal
        visible={taskModalVisible}
        onClose={() => setTaskModalVisible(false)}
        onSave={onAddTask}
      />
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
    gap: 10,
  },
  searchIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  addIconButton: {
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 16,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    fontFamily: fonts.body,
    flex: 1,
    fontSize: 14,
    color: '#0A0A0A',
    padding: 0,
  },
  clearSearch: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: '#71717A',
    fontWeight: '700',
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
    color: '#71717A',
    marginBottom: 4,
  },
  summaryNumber: {
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '900',
    color: '#0A0A0A',
  },
  taskList: {
    gap: 12,
  },
  taskCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioWrapper: {
    marginRight: 12,
    marginTop: 2,
  },
  uncheckedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#D4D4D8',
  },
  checkedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskDetails: {
    flex: 1,
    paddingRight: 8,
  },
  taskTitle: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#A1A1AA',
  },
  taskDesc: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
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
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  progressBarTrack: {
    flex: 1,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#F4F4F5',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2.5,
    backgroundColor: '#0A0A0A',
  },
  progressText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#71717A',
  },
  taskRight: {
    alignItems: 'flex-end',
  },
  taskDueDate: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: '#71717A',
    fontWeight: '500',
  },
  deleteLink: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: '#E11D48',
    fontWeight: '600',
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
