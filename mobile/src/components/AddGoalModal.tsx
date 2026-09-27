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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#141416',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  eyebrow: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1.5,
    color: '#71717A',
    fontWeight: '700',
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FAFAFA',
    letterSpacing: -0.5,
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
    marginTop: 10,
  },
  templateRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  templateChip: {
    backgroundColor: '#18181B',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  templateText: {
    fontSize: 11,
    color: '#A1A1AA',
    fontWeight: '600',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F0F11',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 4,
  },
  currencyPrefix: {
    fontFamily: 'monospace',
    fontSize: 28,
    fontWeight: '800',
    color: '#FAFAFA',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 28,
    fontWeight: '800',
    color: '#FAFAFA',
    fontVariant: ['tabular-nums'],
    padding: 0,
  },
  errorText: {
    fontFamily: 'monospace',
    color: '#F43F5E',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  textInput: {
    backgroundColor: '#18181B',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#FAFAFA',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#FAFAFA',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#09090B',
    letterSpacing: 0.2,
  },
});
