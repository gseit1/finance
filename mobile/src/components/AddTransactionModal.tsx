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

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (tx: {
    type: TransactionType;
    amount: number;
    description: string;
    categoryId: string;
    accountId: string;
  }) => void;
  initialType?: TransactionType;
  categories: Category[];
  accounts: Account[];
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  onClose,
  onSave,
  initialType = 'expense',
  categories,
  accounts,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (visible) {
      setAmount('');
      setDescription('');
      setErrorMessage('');
      const defaultCat = categories.find((c) => c.type === type)?.id || categories[0]?.id || '';
      setSelectedCategoryId(defaultCat);
      if (accounts.length > 0) {
        setSelectedAccountId(accounts[0].id);
      }
    }
  }, [visible, categories, accounts, type]);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Enter a valid amount greater than $0');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Enter a description');
      return;
    }

    onSave({
      type,
      amount: numAmount,
      description: description.trim(),
      categoryId: selectedCategoryId,
      accountId: selectedAccountId || accounts[0]?.id || '',
    });

    setAmount('');
    setDescription('');
    setErrorMessage('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>RECORD ENTRY</Text>
              <Text style={styles.title}>Log Transaction</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Minimalist Inflow/Outflow Toggle */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  type === 'expense' && styles.activeTab,
                ]}
                onPress={() => {
                  setType('expense');
                  const firstExpense = categories.find((c) => c.type === 'expense');
                  if (firstExpense) setSelectedCategoryId(firstExpense.id);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    type === 'expense' && styles.activeTabText,
                  ]}
                >
                  OUTFLOW (EXPENSE)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  type === 'income' && styles.activeTab,
                ]}
                onPress={() => {
                  setType('income');
                  const firstIncome = categories.find((c) => c.type === 'income');
                  if (firstIncome) setSelectedCategoryId(firstIncome.id);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    type === 'income' && { color: colors.inflow, fontWeight: '800' },
                  ]}
                >
                  INFLOW (INCOME)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <Text style={styles.inputLabel}>AMOUNT ($)</Text>
            <View style={styles.amountContainer}>
              <Text style={[styles.currencyPrefix, { color: type === 'income' ? colors.inflow : colors.outflow }]}>
                {type === 'income' ? '+' : '-'}$
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
                autoFocus
              />
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            {/* Description */}
            <Text style={styles.inputLabel}>DESCRIPTION</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Whole Foods groceries, Client Invoice..."
              placeholderTextColor="#71717A"
              value={description}
              onChangeText={(val) => {
                setDescription(val);
                if (errorMessage) setErrorMessage('');
              }}
            />

            {/* Category Selector */}
            <Text style={styles.inputLabel}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              {filteredCategories.map((c) => {
                const isSelected = c.id === selectedCategoryId;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.chip,
                      isSelected && styles.activeChip,
                    ]}
                    onPress={() => setSelectedCategoryId(c.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.activeChipText,
                      ]}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Account Selector */}
            <Text style={styles.inputLabel}>ACCOUNT</Text>
            <View style={styles.accountRow}>
              {accounts.map((acc) => {
                const isSelected = acc.id === selectedAccountId;
                return (
                  <TouchableOpacity
                    key={acc.id}
                    style={[
                      styles.accountButton,
                      isSelected && styles.selectedAccountButton,
                    ]}
                    onPress={() => setSelectedAccountId(acc.id)}
                  >
                    <Text
                      style={[
                        styles.accountButtonText,
                        isSelected && { color: '#FAFAFA', fontWeight: '800' },
                      ]}
                    >
                      {acc.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Solid White Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={styles.submitButtonText}>
                Confirm {type === 'expense' ? 'Outflow' : 'Inflow'}
              </Text>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#18181B',
    borderRadius: 14,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#27272A',
  },
  tabText: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 0.8,
  },
  activeTabText: {
    color: '#FAFAFA',
  },
  inputLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1,
    color: '#71717A',
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 8,
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
    fontSize: 26,
    fontWeight: '800',
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
  chipsScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginRight: 8,
  },
  activeChip: {
    borderColor: '#FAFAFA',
    backgroundColor: 'rgba(250, 250, 250, 0.1)',
  },
  chipText: {
    fontSize: 11,
    color: '#71717A',
    fontWeight: '600',
  },
  activeChipText: {
    color: '#FAFAFA',
    fontWeight: '700',
  },
  accountRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  accountButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: '#18181B',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  selectedAccountButton: {
    borderColor: '#FAFAFA',
    borderWidth: 1.5,
  },
  accountButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A1A1AA',
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
