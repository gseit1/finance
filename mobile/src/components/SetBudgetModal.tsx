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
import { Category, Budget } from '../types';

interface SetBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (budget: { categoryId: string; amount: number }) => void;
  onDelete?: (categoryId: string) => void;
  categories: Category[];
  budgets: Budget[];
  initialCategoryId?: string;
}

export const SetBudgetModal: React.FC<SetBudgetModalProps> = ({
  visible,
  onClose,
  onSave,
  onDelete,
  categories,
  budgets,
  initialCategoryId,
}) => {
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Find if currently selected category has an active budget
  const existingBudget = budgets.find((b) => b.category_id === selectedCategoryId);

  useEffect(() => {
    if (visible) {
      setErrorMessage('');
      const targetCatId =
        initialCategoryId && expenseCategories.some((c) => c.id === initialCategoryId)
          ? initialCategoryId
          : expenseCategories[0]?.id || '';
      setSelectedCategoryId(targetCatId);

      const existing = budgets.find((b) => b.category_id === targetCatId);
      if (existing) {
        setAmount(existing.amount.toString());
      } else {
        setAmount('');
      }
    }
  }, [visible, initialCategoryId]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategoryId(catId);
    setErrorMessage('');
    const existing = budgets.find((b) => b.category_id === catId);
    if (existing) {
      setAmount(existing.amount.toString());
    } else {
      setAmount('');
    }
  };

  const handleApplyPreset = (value: number) => {
    setAmount(value.toString());
    setErrorMessage('');
  };

  const handleAddPresetDelta = (delta: number) => {
    const current = parseFloat(amount) || 0;
    const next = Math.max(0, current + delta);
    setAmount(next.toString());
    setErrorMessage('');
  };

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid monthly limit greater than $0.');
      return;
    }
    if (!selectedCategoryId) {
      setErrorMessage('Please select a category.');
      return;
    }

    onSave({
      categoryId: selectedCategoryId,
      amount: numAmount,
    });
    onClose();
  };

  const handleDelete = () => {
    if (selectedCategoryId && onDelete) {
      onDelete(selectedCategoryId);
      onClose();
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategoryId);

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
              <Text style={styles.eyebrow}>BUDGET CONTROLS</Text>
              <Text style={styles.title}>
                {existingBudget ? 'Update Budget Limit' : 'Set Budget Limit'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            {/* Category Selector */}
            <Text style={styles.fieldLabel}>SELECT EXPENSE CATEGORY</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {expenseCategories.map((cat) => {
                const isSelected = cat.id === selectedCategoryId;
                const hasBudget = budgets.some((b) => b.category_id === cat.id);

                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      isSelected && styles.categoryChipSelected,
                      hasBudget && !isSelected && styles.categoryChipHasLimit,
                    ]}
                    onPress={() => handleCategorySelect(cat.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.catDot,
                        { backgroundColor: cat.color || colors.primary },
                      ]}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.categoryChipTextSelected,
                      ]}
                    >
                      {cat.name}
                    </Text>
                    {hasBudget && (
                      <View style={styles.limitDot} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Selected Category Status Notice */}
            <View style={styles.statusBox}>
              <Text style={styles.statusBoxEyebrow}>CURRENT STATUS</Text>
              <View style={styles.statusRow}>
                <Text style={styles.statusName}>{selectedCategoryObj?.name || 'Category'}</Text>
                {existingBudget ? (
                  <Text style={styles.statusActive}>
                    Limit: ${existingBudget.amount.toLocaleString()} (Spent: ${existingBudget.spent.toLocaleString()})
                  </Text>
                ) : (
                  <Text style={styles.statusNone}>No limit established</Text>
                )}
              </View>
            </View>

            {/* Monthly Limit Input */}
            <Text style={styles.fieldLabel}>MONTHLY LIMIT AMOUNT ($)</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currencyPrefix}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#52525B"
                keyboardType="numeric"
                value={amount}
                onChangeText={(t) => {
                  setAmount(t);
                  if (errorMessage) setErrorMessage('');
                }}
              />
            </View>

            {/* Quick Adjustment Pills */}
            <View style={styles.presetsRow}>
              {[100, 250, 500, 1000].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={styles.presetChip}
                  onPress={() => handleApplyPreset(val)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.presetChipText}>${val}</Text>
                </TouchableOpacity>
              ))}
              {[50, 100].map((delta) => (
                <TouchableOpacity
                  key={`+${delta}`}
                  style={[styles.presetChip, styles.presetDeltaChip]}
                  onPress={() => handleAddPresetDelta(delta)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.presetDeltaText}>+{delta}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Error Message */}
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            {/* Primary Action Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSave}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryButtonText}>
                {existingBudget ? 'SAVE UPDATED LIMIT' : 'SET BUDGET LIMIT'}
              </Text>
            </TouchableOpacity>

            {/* Delete Existing Limit Button */}
            {existingBudget && onDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteButtonText}>REMOVE THIS LIMIT</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#141416',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 22,
    paddingBottom: 36,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  eyebrow: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1.5,
    color: '#71717A',
    fontWeight: '700',
    marginBottom: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FAFAFA',
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingBottom: 24,
  },
  fieldLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#A1A1AA',
    marginBottom: 10,
    marginTop: 4,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F23',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  categoryChipSelected: {
    backgroundColor: '#27272A',
    borderColor: '#FAFAFA',
  },
  categoryChipHasLimit: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  limitDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
    marginLeft: 6,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  categoryChipTextSelected: {
    color: '#FAFAFA',
    fontWeight: '700',
  },
  statusBox: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statusBoxEyebrow: {
    fontFamily: 'monospace',
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#71717A',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FAFAFA',
  },
  statusActive: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#A1A1AA',
  },
  statusNone: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#71717A',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  currencyPrefix: {
    fontSize: 26,
    fontWeight: '800',
    color: '#71717A',
    marginRight: 8,
    fontFamily: 'monospace',
  },
  amountInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    color: '#FAFAFA',
    fontFamily: 'monospace',
    padding: 0,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  presetChip: {
    backgroundColor: '#1F1F23',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  presetChipText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    color: '#D4D4D8',
  },
  presetDeltaChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  presetDeltaText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    color: '#A1A1AA',
  },
  errorText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#EF4444',
    marginBottom: 14,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#09090B',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: 'monospace',
  },
  deleteButton: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    fontFamily: 'monospace',
  },
});
