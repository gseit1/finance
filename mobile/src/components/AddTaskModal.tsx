import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Task, TaskPriority } from '../types';
import { fonts } from '../theme/typography';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>) => void;
  initialDate?: string;
}

const CATEGORIES = ['Design', 'Finance', 'Work', 'DevOps', 'Personal'];
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];
const PROGRESS_OPTIONS = [0, 25, 50, 70, 100];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  visible,
  onClose,
  onSave,
  initialDate,
}) => {
  const getTodayIso = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Design');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState(initialDate || getTodayIso());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (visible) {
      setTitle('');
      setDescription('');
      setCategory('Design');
      setPriority('medium');
      setDueDate(initialDate || getTodayIso());
      setProgress(0);
    }
  }, [visible, initialDate]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      due_date: dueDate.trim() || getTodayIso(),
      completed: progress === 100,
      progress,
      priority,
      category,
    });

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          {/* Header Handle */}
          <View style={styles.handleBar} />

          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>New Task & Focus</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Title Input */}
            <Text style={styles.inputLabel}>Task Title</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Design New Landing Page"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />

            {/* Description */}
            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Add key deliverables or notes..."
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
            />

            {/* Due Date (YYYY-MM-DD) */}
            <Text style={styles.inputLabel}>Scheduled Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="2026-09-29"
              placeholderTextColor="#9CA3AF"
              value={dueDate}
              onChangeText={setDueDate}
            />

            {/* Category Chips */}
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, category === cat && styles.activeChip]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, category === cat && styles.activeChipText]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Priority Selector */}
            <Text style={styles.inputLabel}>Priority Level</Text>
            <View style={styles.chipRow}>
              {PRIORITIES.map((p) => {
                const isActive = priority === p;
                const pColor = p === 'high' ? '#E11D48' : p === 'medium' ? '#71717A' : '#059669';
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.chip,
                      isActive && { backgroundColor: pColor, borderColor: pColor },
                    ]}
                    onPress={() => setPriority(p)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isActive && { color: '#FFFFFF', fontWeight: '700' },
                      ]}
                    >
                      {p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Initial Progress Percentage */}
            <Text style={styles.inputLabel}>Progress ({progress}%)</Text>
            <View style={styles.progressRow}>
              {PROGRESS_OPTIONS.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.progressBtn,
                    progress === val && styles.activeProgressBtn,
                  ]}
                  onPress={() => setProgress(val)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.progressBtnText,
                      progress === val && styles.activeProgressBtnText,
                    ]}
                  >
                    {val}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, !title.trim() && styles.disabledSubmitBtn]}
              onPress={handleSubmit}
              disabled={!title.trim()}
              activeOpacity={0.88}
            >
              <Text style={styles.submitBtnText}>Create Task</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E4E4E7',
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '800',
    color: '#0A0A0A',
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#71717A',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  inputLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    fontWeight: '700',
    color: '#71717A',
    marginBottom: 6,
    marginTop: 12,
    textTransform: 'uppercase',
  },
  textInput: {
    fontFamily: fonts.body,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0A0A0A',
  },
  textArea: {
    height: 64,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F4F4F5',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  activeChip: {
    backgroundColor: '#0A0A0A',
    borderColor: '#0A0A0A',
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    fontWeight: '600',
    color: '#71717A',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  progressBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  activeProgressBtn: {
    backgroundColor: '#0A0A0A',
    borderColor: '#0A0A0A',
  },
  progressBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#71717A',
  },
  activeProgressBtnText: {
    color: '#FFFFFF',
  },
  submitBtn: {
    marginTop: 22,
    backgroundColor: '#0A0A0A',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  disabledSubmitBtn: {
    backgroundColor: '#E4E4E7',
  },
  submitBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
