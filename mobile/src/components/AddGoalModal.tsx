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

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id'>) => void;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const goalTemplates = [
    { name: 'Emergency Fund', initial: 'E' },
    { name: 'Vacation Reserve', initial: 'V' },
    { name: 'Vehicle Down Payment', initial: 'C' },
    { name: 'Home Equity', initial: 'H' },
    { name: 'Hardware / Workstation', initial: 'T' },
  ];

  useEffect(() => {
    if (visible) {
      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      setTargetDate('');
      setErrorMessage('');
    }
  }, [visible]);

  const handleSave = () => {
    const target = parseFloat(targetAmount);
    const initialSaved = parseFloat(currentAmount) || 0;

    if (!name.trim()) {
      setErrorMessage('Enter a target name');
      return;
    }
    if (isNaN(target) || target <= 0) {
      setErrorMessage('Enter a target amount greater than €0');
      return;
    }

    onSave({
      name: name.trim(),
      target_amount: target,
      current_amount: initialSaved,
      target_date: targetDate.trim() || undefined,
      color: '#FAFAFA',
      icon: name.slice(0, 1).toUpperCase(),
      is_completed: initialSaved >= target,
    });

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>TARGET DEFINITION</Text>
              <Text style={styles.title}>New Goal</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Quick Inspiration Templates */}
            <Text style={styles.inputLabel}>QUICK PRESETS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateRow}>
              {goalTemplates.map((tpl) => (
                <TouchableOpacity
                  key={tpl.name}
                  style={styles.templateChip}
                  onPress={() => setName(tpl.name)}
                >
                  <Text style={styles.templateText}>{tpl.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Goal Name */}
            <Text style={styles.inputLabel}>GOAL TITLE</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 6-Month Emergency Reserve"
              placeholderTextColor="#71717A"
              value={name}
              onChangeText={(val) => {
                setName(val);
                if (errorMessage) setErrorMessage('');
              }}
            />

            {/* Target Amount */}
            <Text style={styles.inputLabel}>TARGET AMOUNT (€)</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencyPrefix}>€</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="5,000"
                placeholderTextColor="#71717A"
                keyboardType="decimal-pad"
                value={targetAmount}
                onChangeText={(val) => {
                  setTargetAmount(val);
                  if (errorMessage) setErrorMessage('');
                }}
              />
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            {/* Initial Amount Saved */}
            <Text style={styles.inputLabel}>ALREADY FUNDED (OPTIONAL)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="€0.00"
              placeholderTextColor="#71717A"
              keyboardType="decimal-pad"
              value={currentAmount}
              onChangeText={setCurrentAmount}
            />

            {/* Target Date */}
            <Text style={styles.inputLabel}>TARGET DEADLINE (OPTIONAL)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Dec 2026, Q3 2027"
              placeholderTextColor="#71717A"
              value={targetDate}
              onChangeText={setTargetDate}
            />

            {/* Solid White Action Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={styles.submitButtonText}>Establish Goal</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: '#E4E4E7',
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
    color: '#71717A',
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 22,
    fontWeight: '900',
    color: '#0A0A0A',
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    color: '#71717A',
    fontWeight: '700',
  },
  inputLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: '#71717A',
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  templateRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  templateChip: {
    backgroundColor: '#F4F4F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  templateText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: '#71717A',
    fontWeight: '600',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 4,
  },
  currencyPrefix: {
    fontFamily: fonts.heading,
    fontSize: 28,
    fontWeight: '900',
    color: '#0A0A0A',
    marginRight: 6,
  },
  amountInput: {
    fontFamily: fonts.heading,
    flex: 1,
    fontSize: 28,
    fontWeight: '900',
    color: '#0A0A0A',
    padding: 0,
  },
  errorText: {
    fontFamily: fonts.bodyMedium,
    color: '#E11D48',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  textInput: {
    fontFamily: fonts.body,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#0A0A0A',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  submitButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});
