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
import { colors } from '../theme/colors';
import { Category, Account, TransactionType } from '../types';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (tx: {
    type: TransactionType;
    amount: number;
    description: string;
    categoryId: string;
    accountId: string;
    date?: string;
  }) => void;
  categories: Category[];
  accounts: Account[];
  defaultDate?: Date;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  onClose,
  onSave,
  categories,
  accounts,
  defaultDate,
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  useEffect(() => {
    if (visible) {
      setAmount('');
      setDescription('');
      setErrorMessage('');
      if (expenseCategories.length > 0) {
        setSelectedCategoryId(expenseCategories[0].id);
      }
      if (accounts.length > 0) {
        setSelectedAccountId(accounts[0].id);
      }
    }
  }, [visible]);

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Enter a valid amount greater than $0');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Enter a transaction description');
      return;
    }

    const txDate = defaultDate ? defaultDate.toISOString() : new Date().toISOString();

    onSave({
      type: 'expense',
      amount: numAmount,
      description: description.trim(),
      categoryId: selectedCategoryId,
      accountId: selectedAccountId || accounts[0]?.id || '',
      date: txDate,
    });

    onClose();
  };

  const quickDescriptions = ['Groceries', 'Coffee & Drinks', 'Dinner Out', 'Fuel / Transport', 'Subscriptions', 'Shopping'];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>OUTFLOW ENTRY</Text>
              <Text style={styles.title}>Log Expense</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Monospace Amount Input */}
            <Text style={styles.inputLabel}>AMOUNT ($)</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencyPrefix}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#71717A"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  if (errorMessage) setErrorMessage('');
                }}
                autoFocus
              />
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            {/* Description */}
            <Text style={styles.inputLabel}>DESCRIPTION</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Organic Groceries, Shell Fuel..."
              placeholderTextColor="#71717A"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errorMessage) setErrorMessage('');
              }}
            />

            {/* Quick Description Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickChipsRow}>
              {quickDescriptions.map((desc) => (
                <TouchableOpacity
                  key={desc}
                  style={styles.quickChip}
                  onPress={() => setDescription(desc)}
                >
                  <Text style={styles.quickChipText}>{desc}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Category Selector */}
            <Text style={styles.inputLabel}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              {expenseCategories.map((cat) => {
                const isSelected = cat.id === selectedCategoryId;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryCard,
                      isSelected && styles.selectedCategoryCard,
                    ]}
                    onPress={() => setSelectedCategoryId(cat.id)}
                  >
                    <Text
                      style={[
                        styles.catCardText,
                        isSelected && styles.selectedCatCardText,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Account Selector */}
            <Text style={styles.inputLabel}>PAY FROM ACCOUNT</Text>
            <View style={styles.accountRow}>
              {accounts.map((acc) => {
                const isSelected = acc.id === selectedAccountId;
                return (
                  <TouchableOpacity
                    key={acc.id}
                    style={[
                      styles.accountCard,
                      isSelected && styles.selectedAccountCard,
                    ]}
                    onPress={() => setSelectedAccountId(acc.id)}
                  >
                    <Text
                      style={[
                        styles.accountName,
                        isSelected && { color: '#FAFAFA', fontWeight: '800' },
                      ]}
                    >
                      {acc.name}
                    </Text>
                    <Text style={styles.accountBalance}>
                      ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* High-Contrast Solid White Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={styles.submitButtonText}>Confirm & Log Expense</Text>
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
    color: colors.outflow,
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
    color: colors.outflow,
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
  quickChipsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  quickChip: {
    backgroundColor: '#18181B',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  quickChipText: {
    fontSize: 11,
    color: '#A1A1AA',
  },
  categoriesScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  categoryCard: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginRight: 8,
  },
  selectedCategoryCard: {
    borderColor: '#FAFAFA',
    backgroundColor: 'rgba(250, 250, 250, 0.1)',
  },
  catCardText: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '600',
  },
  selectedCatCardText: {
    color: '#FAFAFA',
    fontWeight: '700',
  },
  accountRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  accountCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  selectedAccountCard: {
    borderColor: '#FAFAFA',
    borderWidth: 1.5,
  },
  accountName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A1A1AA',
    marginBottom: 2,
  },
  accountBalance: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#71717A',
    fontVariant: ['tabular-nums'],
  },
  submitButton: {
    backgroundColor: '#FAFAFA',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#09090B',
    letterSpacing: 0.2,
  },
});
