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
import { fonts } from '../theme/typography';
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
      setErrorMessage('Please enter a valid monthly limit greater than €0.');
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
                    Limit: €{existingBudget.amount.toLocaleString()} (Spent: €{existingBudget.spent.toLocaleString()})
                  </Text>
                ) : (
                  <Text style={styles.statusNone}>No limit established</Text>
                )}
              </View>
            </View>

            {/* Monthly Limit Input */}
            <Text style={styles.fieldLabel}>MONTHLY LIMIT AMOUNT (€)</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currencyPrefix}>€</Text>
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
                  <Text style={styles.presetChipText}>€{val}</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 22,
    paddingBottom: 36,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#71717A',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '800',
    color: '#0A0A0A',
    letterSpacing: -0.4,
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
    color: '#71717A',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingBottom: 24,
  },
  fieldLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#71717A',
    marginBottom: 10,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  categoryChipSelected: {
    backgroundColor: '#0A0A0A',
    borderColor: '#0A0A0A',
  },
  categoryChipHasLimit: {
    borderColor: '#E4E4E7',
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  limitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
    marginLeft: 6,
  },
  categoryChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    fontWeight: '600',
    color: '#71717A',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statusBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  statusBoxEyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#71717A',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusName: {
    fontFamily: fonts.heading,
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  statusActive: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  statusNone: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    color: '#71717A',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
  },
  currencyPrefix: {
    fontFamily: fonts.heading,
    fontSize: 26,
    fontWeight: '900',
    color: '#0A0A0A',
    marginRight: 8,
  },
  amountInput: {
    fontFamily: fonts.heading,
    flex: 1,
    fontSize: 26,
    fontWeight: '900',
    color: '#0A0A0A',
    padding: 0,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  presetChip: {
    backgroundColor: '#F4F4F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  presetChipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  presetDeltaChip: {
    backgroundColor: '#F4F4F5',
    borderColor: '#E4E4E7',
  },
  presetDeltaText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  errorText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: '#E11D48',
    marginBottom: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#0A0A0A',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    fontFamily: fonts.bodyBold,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  deleteButton: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontFamily: fonts.bodyBold,
    color: '#E11D48',
    fontSize: 12,
    fontWeight: '700',
  },
});
