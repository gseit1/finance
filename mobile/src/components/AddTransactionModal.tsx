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
import { fonts } from '../theme/typography';
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
      setErrorMessage('Enter a valid amount greater than €0');
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
                    type === 'income' && styles.activeTabText,
                  ]}
                >
                  INFLOW (INCOME)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F4F4F5',
    borderRadius: 14,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#0A0A0A',
  },
  tabText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  inputLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: '#71717A',
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 8,
    textTransform: 'uppercase',
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
    fontSize: 26,
    fontWeight: '900',
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
  chipsScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F4F4F5',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    marginRight: 8,
  },
  activeChip: {
    borderColor: '#0A0A0A',
    backgroundColor: '#0A0A0A',
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: '#71717A',
    fontWeight: '600',
  },
  activeChipText: {
    color: '#FFFFFF',
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
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  selectedAccountButton: {
    borderColor: '#0A0A0A',
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
  },
  accountButtonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    fontWeight: '600',
    color: '#71717A',
  },
  submitButton: {
    backgroundColor: '#0A0A0A',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
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
