import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { DotsIcon } from './VectorIcons';

interface BalanceCardProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  onAddTransaction: () => void;
  onOptionsPress?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  totalBalance,
  monthlyIncome,
  monthlyExpense,
  onAddTransaction,
  onOptionsPress,
}) => {
  const formatCurrency = (val: number) => {
    return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <View style={styles.card}>
      {/* Eyebrow */}
      <Text style={styles.eyebrow}>NET BALANCE</Text>

      {/* Giant Monospace Tabular Balance */}
      <Text style={styles.balance}>{formatCurrency(totalBalance)}</Text>

      {/* Cashflow Row: Side-by-side compact monospace split */}
      <View style={styles.cashflowRow}>
        <View style={styles.cashflowItem}>
          <Text style={styles.cashflowLabel}>INFLOW</Text>
          <Text style={[styles.cashflowValue, { color: colors.inflow }]}>
            +{formatCurrency(monthlyIncome)}
          </Text>
        </View>

        <View style={styles.cashflowDivider} />

        <View style={styles.cashflowItem}>
          <Text style={styles.cashflowLabel}>OUTFLOW</Text>
          <Text style={[styles.cashflowValue, { color: colors.outflow }]}>
            -{formatCurrency(monthlyExpense)}
          </Text>
        </View>
      </View>

      {/* Action Row: [ + Log Transaction ] and [ ... ] */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={onAddTransaction}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryActionText}>+ Log Transaction</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionsButton}
          onPress={onOptionsPress}
          activeOpacity={0.7}
        >
          <DotsIcon color="#FAFAFA" size={18} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  eyebrow: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 6,
  },
  balance: {
    fontFamily: 'monospace',
    fontSize: 34,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
    marginBottom: 16,
  },
  cashflowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F0F11',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    marginBottom: 16,
  },
  cashflowItem: {
    flex: 1,
  },
  cashflowLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 2,
  },
  cashflowValue: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  cashflowDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginHorizontal: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryActionButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#09090B',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  optionsButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#1E1E22',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
