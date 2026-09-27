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
import { Account, AccountType } from '../types';

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (account: Omit<Account, 'id'>) => void;
}

const ACCOUNT_TYPES: { type: AccountType; label: string; icon: string }[] = [
  { type: 'bank', label: 'Bank Account', icon: '🏛️' },
  { type: 'cash', label: 'Cash Wallet', icon: '💵' },
  { type: 'credit_card', label: 'Credit Card', icon: '💳' },
  { type: 'savings', label: 'Savings Vault', icon: '🏦' },
  { type: 'investment', label: 'Investment / Stocks', icon: '📈' },
];

const COLOR_PRESETS = [
  '#3B82F6', // Cobalt
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#64748B', // Slate
];

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (visible) {
      setName('');
      setType('bank');
      setBalance('');
      setSelectedColor(COLOR_PRESETS[0]);
      setErrorMessage('');
    }
  }, [visible]);

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMessage('Please enter an account name.');
      return;
    }

    const numBalance = parseFloat(balance) || 0;

    const matchedType = ACCOUNT_TYPES.find((t) => t.type === type);
    onSave({
      name: name.trim(),
      type,
      balance: numBalance,
      currency: 'EUR',
      color: selectedColor,
      icon: matchedType?.icon || 'wallet',
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
              <Text style={styles.eyebrow}>CAPITAL REPOSITORY</Text>
              <Text style={styles.title}>Add Account / Wallet</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Account Type Selector */}
            <Text style={styles.inputLabel}>ACCOUNT TYPE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {ACCOUNT_TYPES.map((t) => {
                const isSelected = type === t.type;
                return (
                  <TouchableOpacity
                    key={t.type}
                    style={[styles.typePill, isSelected && styles.activeTypePill]}
                    onPress={() => setType(t.type)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.typeIcon}>{t.icon}</Text>
                    <Text style={[styles.typeLabel, isSelected && styles.activeTypeLabel]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Account Name */}
            <Text style={styles.inputLabel}>ACCOUNT NAME</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Chase Main Checking, Revolut Vault..."
              placeholderTextColor="#71717A"
              value={name}
              onChangeText={(val) => {
                setName(val);
                if (errorMessage) setErrorMessage('');
              }}
            />

            {/* Starting Balance */}
            <Text style={styles.inputLabel}>STARTING BALANCE (€)</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencyPrefix}>€</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#71717A"
                keyboardType="decimal-pad"
                value={balance}
                onChangeText={setBalance}
              />
            </View>

            {/* Color Accent */}
            <Text style={styles.inputLabel}>ACCENT COLOR</Text>
            <View style={styles.colorPalette}>
              {COLOR_PRESETS.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color },
                      isSelected && styles.activeColorCircle,
                    ]}
                    onPress={() => setSelectedColor(color)}
                    activeOpacity={0.7}
                  >
                    {isSelected && <View style={styles.colorCheck} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            {/* Submit */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.submitText}>Create Account</Text>
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
    backgroundColor: '#141416',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    maxHeight: '88%',
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
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#71717A',
    marginBottom: 4,
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
    backgroundColor: '#1F1F23',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#71717A',
    marginBottom: 8,
    marginTop: 14,
  },
  typeScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#1A1A1E',
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  activeTypePill: {
    backgroundColor: '#27272A',
    borderColor: '#FAFAFA',
  },
  typeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  activeTypeLabel: {
    color: '#FAFAFA',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#1A1A1E',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    color: '#FAFAFA',
    fontSize: 15,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1E',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FAFAFA',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#FAFAFA',
  },
  colorPalette: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeColorCircle: {
    borderWidth: 2.5,
    borderColor: '#FAFAFA',
  },
  colorCheck: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#F43F5E',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
  },
  submitButton: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  submitText: {
    color: '#09090B',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
