import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Goal } from '../types';
import { fonts } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id'>) => void;
}

interface GoalPreset {
  name: string;
  icon: string;
  amount: string;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const goalTemplates: GoalPreset[] = [
    { name: 'Έκτακτο Ταμείο', icon: '🛡️', amount: '3000' },
    { name: 'Διακοπές', icon: '✈️', amount: '1500' },
    { name: 'Αγορά Οχήματος', icon: '🚗', amount: '8000' },
    { name: 'Αποταμίευση Σπιτιού', icon: '🏠', amount: '5000' },
    { name: 'Τεχνολογικός Εξοπλισμός', icon: '💻', amount: '1200' },
  ];

  useEffect(() => {
    if (visible) {
      setName('');
      setIcon('🎯');
      setTargetAmount('');
      setCurrentAmount('');
      setTargetDate('');
      setErrorMessage('');
    }
  }, [visible]);

  const handleSelectTemplate = (tpl: GoalPreset) => {
    setName(tpl.name);
    setIcon(tpl.icon);
    if (!targetAmount) {
      setTargetAmount(tpl.amount);
    }
    if (errorMessage) setErrorMessage('');
  };

  const handleSave = () => {
    const target = parseFloat(targetAmount);
    const initialSaved = parseFloat(currentAmount) || 0;

    if (!name.trim()) {
      setErrorMessage('Εισάγετε όνομα στόχου');
      return;
    }
    if (isNaN(target) || target <= 0) {
      setErrorMessage('Εισάγετε ποσό στόχου μεγαλύτερο από €0');
      return;
    }

    onSave({
      name: name.trim(),
      target_amount: target,
      current_amount: initialSaved,
      target_date: targetDate.trim() || undefined,
      color: '#3B82F6',
      icon: icon || '🎯',
      is_completed: initialSaved >= target,
    });

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.eyebrow, { color: theme.textMuted }]}>ΟΡΙΣΜΟΣ ΣΤΟΧΟΥ</Text>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Νέος Στόχος</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: theme.track }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Quick Presets for Rapid Action */}
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>ΓΡΗΓΟΡΕΣ ΕΠΙΛΟΓΕΣ</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateRow}>
              {goalTemplates.map((tpl) => (
                <TouchableOpacity
                  key={tpl.name}
                  style={[
                    styles.templateChip,
                    { backgroundColor: theme.track, borderColor: theme.hairline },
                    name === tpl.name && { backgroundColor: theme.buttonPrimaryBg },
                  ]}
                  onPress={() => handleSelectTemplate(tpl)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.templateEmoji}>{tpl.icon}</Text>
                  <Text
                    style={[
                      styles.templateText,
                      { color: name === tpl.name ? theme.buttonPrimaryText : theme.textPrimary },
                    ]}
                  >
                    {tpl.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Goal Name */}
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>ΟΝΟΜΑΣΙΑ ΣΤΟΧΟΥ</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.inputBg, borderColor: theme.hairline, color: theme.inputText },
              ]}
              placeholder="π.χ. Ταμείο Έκτακτης Ανάγκης"
              placeholderTextColor={theme.inputPlaceholder}
              value={name}
              onChangeText={(val) => {
                setName(val);
                if (errorMessage) setErrorMessage('');
              }}
            />

            {/* Target Amount */}
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>ΠΟΣΟ ΣΤΟΧΟΥ (€)</Text>
            <View style={[styles.amountContainer, { backgroundColor: theme.inputBg, borderColor: theme.hairline }]}>
              <Text style={[styles.currencyPrefix, { color: theme.textPrimary }]}>€</Text>
              <TextInput
                style={[styles.amountInput, { color: theme.inputText }]}
                placeholder="5.000"
                placeholderTextColor={theme.inputPlaceholder}
                keyboardType="decimal-pad"
                value={targetAmount}
                onChangeText={(val) => {
                  setTargetAmount(val);
                  if (errorMessage) setErrorMessage('');
                }}
              />
            </View>

            {errorMessage ? <Text style={[styles.errorText, { color: theme.crimson }]}>{errorMessage}</Text> : null}

            {/* Initial Amount Saved */}
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>ΗΔΗ ΑΠΟΤΑΜΙΕΥΜΕΝΑ (ΠΡΟΑΙΡΕΤΙΚΟ)</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.inputBg, borderColor: theme.hairline, color: theme.inputText },
              ]}
              placeholder="€0.00"
              placeholderTextColor={theme.inputPlaceholder}
              keyboardType="decimal-pad"
              value={currentAmount}
              onChangeText={setCurrentAmount}
            />

            {/* Target Date */}
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>ΗΜΕΡΟΜΗΝΙΑ ΣΤΟΧΟΥ (ΠΡΟΑΙΡΕΤΙΚΟ)</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.inputBg, borderColor: theme.hairline, color: theme.inputText },
              ]}
              placeholder="π.χ. Δεκ 2026, Καλοκαίρι 2027"
              placeholderTextColor={theme.inputPlaceholder}
              value={targetDate}
              onChangeText={setTargetDate}
            />

            {/* Submit Action */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.buttonPrimaryBg }]}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={[styles.submitButtonText, { color: theme.buttonPrimaryText }]}>Δημιουργία Στόχου</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '92%',
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  inputLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.5,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 12,
    textTransform: 'uppercase',
  },
  templateRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  templateEmoji: {
    fontSize: 14,
  },
  templateText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    fontWeight: '600',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 4,
  },
  currencyPrefix: {
    fontFamily: fonts.heading,
    fontSize: 26,
    fontWeight: '900',
    marginRight: 8,
  },
  amountInput: {
    fontFamily: fonts.heading,
    flex: 1,
    fontSize: 26,
    fontWeight: '900',
    padding: 0,
  },
  errorText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  textInput: {
    fontFamily: fonts.body,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  submitButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
