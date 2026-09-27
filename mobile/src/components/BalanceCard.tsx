import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors } from '../theme/colors';

interface BalanceCardProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  onAddTransaction: () => void;
  onOptionsPress?: () => void;
}

const MONO_FONT = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export const BalanceCard: React.FC<BalanceCardProps> = ({
  totalBalance,
  monthlyIncome,
  monthlyExpense,
  onAddTransaction,
  onOptionsPress,
}) => {
  // Strict precision euro formatting
  const formatBigBalance = (val: number) => {
    const isNeg = val < 0;
    const absVal = Math.abs(val);
    const formatted = absVal.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${isNeg ? '-' : ''}€${formatted}`;
  };

  const formatFlow = (val: number, isIncome: boolean) => {
    const absVal = Math.abs(val);
    const formatted = absVal.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${isIncome ? '+' : '-'}€${formatted}`;
  };

  return (
    <View style={styles.ledgerSection}>
      {/* Monospace Eyebrow */}
      <Text style={styles.eyebrow}>// 01. NET LIQUIDITY POSITION</Text>

      {/* Massive Tabular Monospace Balance + Inline Currency Tag */}
      <View style={styles.valueRow}>
        <Text style={styles.balanceValue} numberOfLines={1} adjustsFontSizeToFit>
          {formatBigBalance(totalBalance)}
        </Text>
        <Text style={styles.currencyTag}>EUR</Text>
      </View>

      {/* Cashflow Dual Matrix (2-column rule-divided strip) */}
      <View style={styles.matrixStrip}>
        <View style={styles.matrixCol}>
          <Text style={styles.matrixLabel}>INFLOW (24H)</Text>
          <Text style={[styles.matrixValue, { color: colors.inflow }]}>
            {formatFlow(monthlyIncome, true)}
          </Text>
        </View>

        <View style={styles.matrixDivider} />

        <View style={[styles.matrixCol, styles.matrixColRight]}>
          <Text style={styles.matrixLabel}>OUTFLOW (24H)</Text>
          <Text style={[styles.matrixValue, { color: colors.outflow }]}>
            {formatFlow(monthlyExpense, false)}
          </Text>
        </View>
      </View>

      {/* Tactile Action Triggers */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={onAddTransaction}
          activeOpacity={0.88}
        >
          <Text style={styles.primaryActionText}>[ + RECORD ENTRY ]</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onOptionsPress}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>···</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ledgerSection: {
    backgroundColor: '#080808',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(39, 39, 42, 0.7)', // border-zinc-800/80
  },
  eyebrow: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#71717A', // text-zinc-500
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginVertical: 4,
  },
  balanceValue: {
    fontFamily: MONO_FONT,
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.5,
    fontVariant: ['tabular-nums'],
  },
  currencyTag: {
    fontFamily: MONO_FONT,
    fontSize: 13,
    fontWeight: '700',
    color: '#71717A', // text-zinc-500
    letterSpacing: 1,
  },
  matrixStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(39, 39, 42, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(39, 39, 42, 0.5)',
  },
  matrixCol: {
    flex: 1,
    paddingRight: 12,
  },
  matrixColRight: {
    paddingRight: 0,
    paddingLeft: 12,
  },
  matrixDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#27272A', // divide-zinc-800
  },
  matrixLabel: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    letterSpacing: 1,
    color: '#71717A', // text-zinc-500
    fontWeight: '700',
    marginBottom: 3,
  },
  matrixValue: {
    fontFamily: MONO_FONT,
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  primaryActionButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12, // rounded-xl
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    fontFamily: MONO_FONT,
    color: '#080808',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: 12, // rounded-xl
    backgroundColor: '#18181B', // bg-zinc-900
    borderWidth: 1,
    borderColor: '#3F3F46', // border-zinc-700
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: MONO_FONT,
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 22,
  },
});
