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
import { fonts } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';
import { Category, Account, Transaction, TransactionType } from '../types';
import { TrashIcon } from './VectorIcons';
import { KineticPressable } from './KineticPressable';

interface EditTransactionModalProps {
  visible: boolean;
  transaction: Transaction | null;
  categories: Category[];
  accounts: Account[];
  onClose: () => void;
  onSave: (updatedTx: Transaction) => void;
  onRequestDelete?: (tx: Transaction) => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  visible,
  transaction,
  categories,
  accounts,
  onClose,
  onSave,
  onRequestDelete,
}) => {
  const { theme, isDark } = useTheme();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [date, setDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (transaction && visible) {
      setType(transaction.type);
      setAmount(transaction.amount ? transaction.amount.toString() : '');
      setDescription(transaction.description || '');
      setSelectedCategoryId(transaction.category_id || '');
      setSelectedAccountId(transaction.account_id || '');
      setDate(transaction.date || new Date().toISOString().split('T')[0]);
      setErrorMessage('');
    }
  }, [transaction, visible]);

  if (!transaction) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSave = () => {
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Εισάγετε έγκυρο ποσό μεγαλύτερο από €0.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Εισάγετε περιγραφή συναλλαγής.');
      return;
    }

    const resolvedCategory = categories.find((c) => c.id === selectedCategoryId);
    const resolvedAccount = accounts.find((a) => a.id === selectedAccountId);

    const updated: Transaction = {
      ...transaction,
      type,
      amount: numAmount,
      description: description.trim(),
      category_id: selectedCategoryId || undefined,
      category_name: resolvedCategory?.name || transaction.category_name,
      account_id: selectedAccountId || transaction.account_id,
      account_name: resolvedAccount?.name || transaction.account_name,
      date: date || transaction.date,
    };

    onSave(updated);
    onClose();
  };

  const handleDeletePress = () => {
    onClose();
    if (onRequestDelete && transaction) {
      onRequestDelete(transaction);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.eyebrow, { color: theme.brandPink }]}>ΕΠΕΞΕΡΓΑΣΙΑ</Text>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Συναλλαγή</Text>
            </View>
            <View style={styles.headerRightActions}>
              {onRequestDelete && (
                <TouchableOpacity
                  onPress={handleDeletePress}
                  style={[styles.headerTrashBtn, { backgroundColor: isDark ? '#2D0A14' : '#FFF1F2' }]}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <TrashIcon size={18} color="#E11D48" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.hairline }]}>
                <Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBlock}>
            {/* Transaction Type Segmented Toggle */}
            <View style={[styles.typeRow, { backgroundColor: theme.track }]}>
              {(['expense', 'income', 'transfer'] as TransactionType[]).map((t) => {
                const isSelected = type === t;
                const label = t === 'expense' ? 'Έξοδο' : t === 'income' ? 'Έσοδο' : 'Μεταφορά';
                let activeColor = theme.brandPink;
                if (t === 'income') activeColor = theme.emerald;
                if (t === 'transfer') activeColor = '#3B82F6';

                return (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.typeBtn,
                      isSelected && [styles.typeBtnActive, { backgroundColor: activeColor }],
                    ]}
                    onPress={() => {
                      setType(t);
                      const matchingCat = categories.find((c) => c.type === t);
                      if (matchingCat) setSelectedCategoryId(matchingCat.id);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Amount Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>ΠΟΣΟ (€)</Text>
              <View style={[styles.amountInputRow, { borderColor: theme.hairline, backgroundColor: theme.inputBg }]}>
                <Text style={[styles.currencyPrefix, { color: theme.textMuted }]}>€</Text>
                <TextInput
                  style={[styles.amountInput, { color: theme.textPrimary }]}
                  value={amount}
                  onChangeText={(val) => {
                    setAmount(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="0,00"
                  placeholderTextColor={theme.inputPlaceholder}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Description Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>ΠΕΡΙΓΡΑΦΗ</Text>
              <TextInput
                style={[styles.textInput, { borderColor: theme.hairline, backgroundColor: theme.inputBg, color: theme.textPrimary }]}
                value={description}
                onChangeText={(val) => {
                  setDescription(val);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="π.χ. Supermarket, Μισθός..."
                placeholderTextColor={theme.inputPlaceholder}
              />
            </View>

            {/* Category Selector */}
            {type !== 'transfer' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>ΚΑΤΗΓΟΡΙΑ</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                  {filteredCategories.map((c) => {
                    const isSelected = selectedCategoryId === c.id;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: isSelected ? theme.brandPink : theme.surfaceElevated,
                            borderColor: isSelected ? theme.brandPink : theme.hairline,
                          },
                        ]}
                        onPress={() => setSelectedCategoryId(c.id)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                          ]}
                        >
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Account Selector */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>ΛΟΓΑΡΙΑΣΜΟΣ</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {accounts.map((acc) => {
                  const isSelected = selectedAccountId === acc.id;
                  return (
                    <TouchableOpacity
                      key={acc.id}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? theme.brandPink : theme.surfaceElevated,
                          borderColor: isSelected ? theme.brandPink : theme.hairline,
                        },
                      ]}
                      onPress={() => setSelectedAccountId(acc.id)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                        ]}
                      >
                        {acc.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Save Action Button */}
            <KineticPressable
              style={[styles.saveBtn, { backgroundColor: theme.brandPink }]}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnText}>Αποθήκευση Αλλαγών</Text>
            </KineticPressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTrashBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    fontFamily: fonts.bodyMedium,
    color: '#E11D48',
    fontSize: 12.5,
  },
  scrollBlock: {
    gap: 18,
    paddingBottom: 20,
  },
  typeRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 9,
  },
  typeBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  typeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    fontWeight: '700',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.2,
    paddingHorizontal: 14,
    height: 52,
  },
  currencyPrefix: {
    fontFamily: fonts.heading,
    fontSize: 22,
    fontWeight: '900',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: 22,
    fontWeight: '900',
    paddingVertical: 0,
  },
  textInput: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.2,
    paddingHorizontal: 14,
    fontFamily: fonts.body,
    fontSize: 14.5,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    fontWeight: '600',
  },
  saveBtn: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#E11D74',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
