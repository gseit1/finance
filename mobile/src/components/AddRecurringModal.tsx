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
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';
import { Account, Category, RecurringFrequency, RecurringRule } from '../types';

interface AddRecurringModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (rule: Omit<RecurringRule, 'id'>) => void;
  accounts: Account[];
  categories: Category[];
}

const FREQUENCY_OPTIONS: { freq: RecurringFrequency; label: string }[] = [
  { freq: 'monthly', label: 'Μηνιαία' },
  { freq: 'weekly', label: 'Εβδομαδιαία' },
  { freq: 'bi-weekly', label: 'Κάθε 2 εβδ.' },
  { freq: 'yearly', label: 'Ετήσια' },
  { freq: 'daily', label: 'Ημερήσια' },
];

const PRESETS = [
  'Netflix',
  'Spotify',
  'Ενοίκιο Σπιτιού',
  'Γυμναστήριο',
  'Ίντερνετ / Τηλεφωνία',
  'iCloud / Drive',
  'Μισθοδοσία',
];

export const AddRecurringModal: React.FC<AddRecurringModalProps> = ({
  visible,
  onClose,
  onSave,
  accounts,
  categories,
}) => {
  const { theme } = useTheme();
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

      // Default next run date: 1st of next month or tomorrow
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
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Παρακαλώ εισάγετε έγκυρο ποσό μεγαλύτερο από €0.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Παρακαλώ συμπληρώστε περιγραφή της πάγιας εντολής.');
      return;
    }
    if (!selectedAccountId) {
      setErrorMessage('Παρακαλώ επιλέξτε λογαριασμό χρέωσης ή πίστωσης.');
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
        <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.eyebrow, { color: theme.textMuted }]}>ΑΥΤΟΜΑΤΕΣ ΠΛΗΡΩΜΕΣ</Text>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Νέα Πάγια Εντολή</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: theme.inputBg }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Expense vs Income Toggle */}
            <View style={[styles.tabContainer, { backgroundColor: theme.inputBg, borderColor: theme.hairline }]}>
              <TouchableOpacity
                style={[styles.tab, type === 'expense' && { backgroundColor: theme.brandPink }]}
                onPress={() => {
                  setType('expense');
                  const expCat = categories.find((c) => c.type === 'expense');
                  if (expCat) setSelectedCategoryId(expCat.id);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: type === 'expense' ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  ΕΞΟΔΟ (ΣΥΝΔΡΟΜΗ / ΠΑΓΙΟ)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, type === 'income' && { backgroundColor: theme.emerald }]}
                onPress={() => {
                  setType('income');
                  const incCat = categories.find((c) => c.type === 'income');
                  if (incCat) setSelectedCategoryId(incCat.id);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: type === 'income' ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  ΕΣΟΔΟ (ΜΙΣΘΟΣ / ΕΙΣΡΟΗ)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick Presets */}
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>ΠΡΟΤΑΣΕΙΣ / PRESETS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {PRESETS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.presetChip,
                    { backgroundColor: theme.inputBg, borderColor: theme.hairline },
                  ]}
                  onPress={() => setDescription(p)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.presetText, { color: theme.textPrimary }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Description */}
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>ΠΕΡΙΓΡΑΦΗ</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.inputBg, borderColor: theme.hairline, color: theme.inputText },
              ]}
              placeholder="π.χ. Netflix Premium, Ενοίκιο..."
              placeholderTextColor={theme.inputPlaceholder}
              value={description}
              onChangeText={(val) => {
                setDescription(val);
                if (errorMessage) setErrorMessage('');
              }}
            />

            {/* Amount */}
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>ΠΟΣΟ (€)</Text>
            <View
              style={[
                styles.amountContainer,
                { backgroundColor: theme.inputBg, borderColor: theme.hairline },
              ]}
            >
              <Text
                style={[
                  styles.currencyPrefix,
                  { color: type === 'income' ? theme.emerald : theme.brandPink },
                ]}
              >
                {type === 'income' ? '+' : '-'}€
              </Text>
              <TextInput
                style={[styles.amountInput, { color: theme.inputText }]}
                placeholder="0.00"
                placeholderTextColor={theme.inputPlaceholder}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={(val) => {
                  setAmount(val);
                  if (errorMessage) setErrorMessage('');
                }}
              />
            </View>

            {/* Frequency Selector */}
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>ΣΥΧΝΟΤΗΤΑ ΕΠΑΝΑΛΗΨΗΣ</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {FREQUENCY_OPTIONS.map((f) => {
                const isSelected = frequency === f.freq;
                return (
                  <TouchableOpacity
                    key={f.freq}
                    style={[
                      styles.freqPill,
                      {
                        backgroundColor: isSelected ? theme.brandPink : theme.inputBg,
                        borderColor: isSelected ? theme.brandPink : theme.hairline,
                      },
                    ]}
                    onPress={() => setFrequency(f.freq)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.freqText,
                        { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Account Selector */}
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>ΛΟΓΑΡΙΑΣΜΟΣ ΧΡΕΩΣΗΣ / ΠΙΣΤΩΣΗΣ</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {accounts.map((acc) => {
                const isSelected = selectedAccountId === acc.id;
                return (
                  <TouchableOpacity
                    key={acc.id}
                    style={[
                      styles.accPill,
                      {
                        backgroundColor: isSelected ? theme.brandPink : theme.inputBg,
                        borderColor: isSelected ? theme.brandPink : theme.hairline,
                      },
                    ]}
                    onPress={() => setSelectedAccountId(acc.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.accText,
                        { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                      ]}
                    >
                      {acc.name} (€{acc.balance.toFixed(2)})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Category Selector */}
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>ΚΑΤΗΓΟΡΙΑ</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {filteredCategories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.accPill,
                      {
                        backgroundColor: isSelected ? theme.brandPink : theme.inputBg,
                        borderColor: isSelected ? theme.brandPink : theme.hairline,
                      },
                    ]}
                    onPress={() => setSelectedCategoryId(cat.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.accText,
                        { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Next Due Date */}
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
              ΕΠΟΜΕΝΗ ΕΚΤΕΛΕΣΗ (ΕΕΕΕ-ΜΜ-ΗΗ)
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.inputBg, borderColor: theme.hairline, color: theme.inputText },
              ]}
              placeholder="π.χ. 2026-10-01"
              placeholderTextColor={theme.inputPlaceholder}
              value={nextRunDate}
              onChangeText={setNextRunDate}
            />

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.brandPink }]}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={styles.submitText}>Αποθήκευση Πάγιας Εντολής</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: Platform.OS === 'ios' ? 44 : 26,
    maxHeight: '90%',
    borderWidth: 1,
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
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    marginBottom: 10,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  tabText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  inputLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.5,
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
    borderRadius: 10,
    marginRight: 6,
    borderWidth: 1,
  },
  presetText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    fontWeight: '600',
  },
  freqPill: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
  },
  freqText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    fontWeight: '700',
  },
  accPill: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
  },
  accText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    fontWeight: '700',
  },
  textInput: {
    fontFamily: fonts.body,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 14,
    fontWeight: '500',
    borderWidth: 1,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
  },
  currencyPrefix: {
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '900',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: 22,
    fontWeight: '900',
  },
  errorText: {
    fontFamily: fonts.bodyBold,
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
  },
  submitButton: {
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    marginBottom: 8,
  },
  submitText: {
    fontFamily: fonts.bodyBold,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
