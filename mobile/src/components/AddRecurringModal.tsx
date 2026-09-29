import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { Account, Category, RecurringFrequency, RecurringRule } from '../types';

interface AddRecurringModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (rule: Omit<RecurringRule, 'id'>) => void;
  accounts: Account[];
  categories: Category[];
}

const FREQUENCY_OPTIONS: { freq: RecurringFrequency; label: string }[] = [
  { freq: 'monthly', label: 'Monthly' },
  { freq: 'weekly', label: 'Weekly' },
  { freq: 'bi-weekly', label: 'Bi-Weekly' },
  { freq: 'yearly', label: 'Yearly' },
  { freq: 'daily', label: 'Daily' },
];

const PRESETS = [
  'Netflix',
  'Spotify',
  'Apartment Rent',
  'Gym Membership',
  'Internet / Wifi',
  'Cloud Storage',
  'Salary Deposit',
];

export const AddRecurringModal: React.FC<AddRecurringModalProps> = ({
  visible,
  onClose,
  onSave,
  accounts,
  categories,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [nextRunDate, setNextRunDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (visible) {
      setDescription('');
      setAmount('');
      setType('expense');
      setFrequency('monthly');
      setErrorMessage('');

      // Default next run date: 1st of next month or 7 days from now
      const today = new Date();
      today.setDate(today.getDate() + 1);
      setNextRunDate(today.toISOString().split('T')[0]);

      if (accounts.length > 0) {
        setSelectedAccountId(accounts[0].id);
      }
      const initialCat = categories.find((c) => c.type === 'expense') || categories[0];
      if (initialCat) {
        setSelectedCategoryId(initialCat.id);
      }
    }
  }, [visible, accounts, categories]);

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid amount greater than €0.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please enter a subscription or bill description.');
      return;
    }
    if (!selectedAccountId) {
      setErrorMessage('Please select an account for debit/credit.');
      return;
    }

    onSave({
      account_id: selectedAccountId,
      category_id: selectedCategoryId || undefined,
      description: description.trim(),
      amount: numAmount,
      type,
      frequency,
      next_run_date: nextRunDate || new Date().toISOString().split('T')[0],
      is_active: true,
    });

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>AUTOMATED LEDGER</Text>
              <Text style={styles.title}>New Recurring Rule</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Expense vs Income Toggle */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, type === 'expense' && styles.activeTab]}
                onPress={() => {
                  setType('expense');
                  const expCat = categories.find((c) => c.type === 'expense');
                  if (expCat) setSelectedCategoryId(expCat.id);
                }}
              >
                <Text style={[styles.tabText, type === 'expense' && styles.activeTabText]}>
                  EXPENSE (BILL / SUB)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, type === 'income' && styles.activeTab]}
                onPress={() => {
                  setType('income');
                  const incCat = categories.find((c) => c.type === 'income');
                  if (incCat) setSelectedCategoryId(incCat.id);
                }}
              >
                <Text style={[styles.tabText, type === 'income' && { color: colors.inflow, fontWeight: '800' }]}>
                  INCOME (PAYCHECK)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick Inspiration Presets */}
            <Text style={styles.inputLabel}>QUICK PRESETS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {PRESETS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={styles.presetChip}
                  onPress={() => setDescription(p)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Description */}
            <Text style={styles.inputLabel}>DESCRIPTION</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Netflix Premium, Gym, Rent..."
              placeholderTextColor="#71717A"
              value={description}
              onChangeText={(val) => {
                setDescription(val);
                if (errorMessage) setErrorMessage('');
              }}
            />

            {/* Amount */}
            <Text style={styles.inputLabel}>AMOUNT (€)</Text>
            <View style={styles.amountContainer}>
              <Text style={[styles.currencyPrefix, { color: type === 'income' ? colors.inflow : colors.outflow }]}>
                {type === 'income' ? '+' : '-'}€
              </Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#71717A"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={(val) => {
                  setAmount(val);
                  if (errorMessage) setErrorMessage('');
                }}
              />
            </View>

            {/* Frequency Selector */}
            <Text style={styles.inputLabel}>CADENCE / FREQUENCY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {FREQUENCY_OPTIONS.map((f) => {
                const isSelected = frequency === f.freq;
                return (
                  <TouchableOpacity
                    key={f.freq}
                    style={[styles.freqPill, isSelected && styles.activeFreqPill]}
                    onPress={() => setFrequency(f.freq)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.freqText, isSelected && styles.activeFreqText]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Account Selector */}
            <Text style={styles.inputLabel}>LINKED ACCOUNT</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {accounts.map((acc) => {
                const isSelected = selectedAccountId === acc.id;
                return (
                  <TouchableOpacity
                    key={acc.id}
                    style={[styles.accPill, isSelected && styles.activeAccPill]}
                    onPress={() => setSelectedAccountId(acc.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.accText, isSelected && styles.activeAccText]}>
                      {acc.name} (€{acc.balance.toFixed(2)})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Category Selector */}
            <Text style={styles.inputLabel}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {filteredCategories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.accPill, isSelected && styles.activeAccPill]}
                    onPress={() => setSelectedCategoryId(cat.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.accText, isSelected && styles.activeAccText]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Next Due Date */}
            <Text style={styles.inputLabel}>FIRST / NEXT RUN DATE (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 2026-10-01"
              placeholderTextColor="#71717A"
              value={nextRunDate}
              onChangeText={setNextRunDate}
            />

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            {/* Submit */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.submitText}>Save Recurring Rule</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#F0F1F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#9CA3AF',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 3,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  activeTab: {
    backgroundColor: '#6355E6',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#6B7280',
    marginBottom: 8,
    marginTop: 14,
    textTransform: 'uppercase',
  },
  presetScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  presetChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  presetText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  freqPill: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFreqPill: {
    backgroundColor: '#EDE9FE',
    borderColor: '#6355E6',
  },
  freqText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFreqText: {
    color: '#6355E6',
    fontWeight: '700',
  },
  accPill: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeAccPill: {
    backgroundColor: '#EDE9FE',
    borderColor: '#6355E6',
  },
  accText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  activeAccText: {
    color: '#6355E6',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    color: '#111827',
    fontSize: 14,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
  },
  submitButton: {
    backgroundColor: '#6355E6',
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    marginBottom: 8,
    shadowColor: '#6355E6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
