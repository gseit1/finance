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
  '#0A0A0A', // Pure Obsidian
  '#27272A', // Graphite
  '#52525B', // Zinc
  '#71717A', // Muted Slate
  '#059669', // Emerald
  '#10B981', // Mint
  '#E11D48', // Crimson
  '#0284C7', // Slate Cyan
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    maxHeight: '88%',
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
    marginBottom: 4,
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
    fontSize: 13,
    fontWeight: '600',
  },
  inputLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#71717A',
    marginBottom: 8,
    marginTop: 14,
    textTransform: 'uppercase',
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
    backgroundColor: '#F4F4F5',
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  activeTypePill: {
    backgroundColor: '#0A0A0A',
    borderColor: '#0A0A0A',
  },
  typeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  typeLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    fontWeight: '600',
    color: '#71717A',
  },
  activeTypeLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textInput: {
    fontFamily: fonts.body,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    color: '#0A0A0A',
    fontSize: 15,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  currencyPrefix: {
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '800',
    color: '#0A0A0A',
    marginRight: 6,
  },
  amountInput: {
    fontFamily: fonts.heading,
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: '#0A0A0A',
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
    borderColor: '#0A0A0A',
  },
  colorCheck: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontFamily: fonts.bodyMedium,
    color: '#E11D48',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
  },
  submitButton: {
    backgroundColor: '#0A0A0A',
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  submitText: {
    fontFamily: fonts.bodyBold,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
