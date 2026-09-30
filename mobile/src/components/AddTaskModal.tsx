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
import { useTheme } from '../theme/ThemeContext';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>) => void;
  initialDate?: string;
}

const CATEGORIES = ['Σχεδιασμός', 'Οικονομικά', 'Εργασία', 'Τεχνολογία', 'Προσωπικά'];
const PRIORITIES: { key: TaskPriority; label: string }[] = [
  { key: 'low', label: 'ΧΑΜΗΛΗ' },
  { key: 'medium', label: 'ΜΕΣΗ' },
  { key: 'high', label: 'ΥΨΗΛΗ' },
];
const PROGRESS_OPTIONS = [0, 25, 50, 75, 100];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  visible,
  onClose,
  onSave,
  initialDate,
}) => {
  const { theme } = useTheme();

  const getTodayIso = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Σχεδιασμός');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState(initialDate || getTodayIso());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (visible) {
      setTitle('');
      setDescription('');
      setCategory('Σχεδιασμός');
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
        <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
          {/* Header Handle */}
          <View style={[styles.handleBar, { backgroundColor: theme.hairline }]} />

          <View style={styles.headerRow}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Νέα Εργασία</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.track }]}>
              <Text style={[styles.closeBtnText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Title Input */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>ΤΙΤΛΟΣ ΕΡΓΑΣΙΑΣ</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.inputBg, borderColor: theme.hairline, color: theme.inputText },
              ]}
              placeholder="π.χ. Σχεδίαση Νέας Σελίδας"
              placeholderTextColor={theme.inputPlaceholder}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />

            {/* Description */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>ΠΕΡΙΓΡΑΦΗ (ΠΡΟΑΙΡΕΤΙΚΟ)</Text>
            <TextInput
              style={[
                styles.textInput,
                styles.textArea,
                { backgroundColor: theme.inputBg, borderColor: theme.hairline, color: theme.inputText },
              ]}
              placeholder="Σημειώσεις ή βασικά παραδοτέα..."
              placeholderTextColor={theme.inputPlaceholder}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
            />

            {/* Due Date (YYYY-MM-DD) */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>ΗΜΕΡΟΜΗΝΙΑ (ΕΕΕΕ-ΜΜ-ΗΗ)</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.inputBg, borderColor: theme.hairline, color: theme.inputText },
              ]}
              placeholder="2026-09-30"
              placeholderTextColor={theme.inputPlaceholder}
              value={dueDate}
              onChangeText={setDueDate}
            />

            {/* Category Chips */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>ΚΑΤΗΓΟΡΙΑ</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    { backgroundColor: theme.track, borderColor: theme.hairline },
                    category === cat && { backgroundColor: theme.brandPink, borderColor: theme.brandPink },
                  ]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: category === cat ? '#FFFFFF' : theme.textSecondary },
                      category === cat && { fontWeight: '700' },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Priority Selector */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>ΠΡΟΤΕΡΑΙΟΤΗΤΑ</Text>
            <View style={styles.chipRow}>
              {PRIORITIES.map((p) => {
                const isActive = priority === p.key;
                const pColor = p.key === 'high' ? theme.crimson : p.key === 'medium' ? theme.brandPink : theme.emerald;
                return (
                  <TouchableOpacity
                    key={p.key}
                    style={[
                      styles.chip,
                      { backgroundColor: theme.track, borderColor: theme.hairline },
                      isActive && { backgroundColor: pColor, borderColor: pColor },
                    ]}
                    onPress={() => setPriority(p.key)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isActive ? '#FFFFFF' : theme.textSecondary },
                        isActive && { fontWeight: '700' },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Initial Progress Percentage */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>ΠΡΟΟΔΟΣ ({progress}%)</Text>
            <View style={styles.progressRow}>
              {PROGRESS_OPTIONS.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.progressBtn,
                    { backgroundColor: theme.track },
                    progress === val && { backgroundColor: theme.brandPink },
                  ]}
                  onPress={() => setProgress(val)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.progressBtnText,
                      { color: progress === val ? '#FFFFFF' : theme.textSecondary },
                      progress === val && { fontWeight: '700' },
                    ]}
                  >
                    {val}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: theme.brandPink },
                !title.trim() && { opacity: 0.5 },
              ]}
              onPress={handleSubmit}
              disabled={!title.trim()}
              activeOpacity={0.88}
            >
              <Text style={styles.submitBtnText}>Δημιουργία Εργασίας</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '88%',
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
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
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  inputLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 6,
    marginTop: 12,
    textTransform: 'uppercase',
  },
  textInput: {
    fontFamily: fonts.body,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  textArea: {
    height: 64,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  progressBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBtnText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  submitBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});
