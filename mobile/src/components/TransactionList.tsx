import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onSelectTransaction?: (tx: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onSelectTransaction,
}) => {
  const formatAmount = (tx: Transaction) => {
    const prefix = tx.type === 'income' ? '+' : '-';
    return `${prefix}$${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>NO ACTIVITY RECORDED</Text>
        <Text style={styles.emptySubtitle}>Log your first transaction above.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>RECENT ACTIVITY</Text>

      {transactions.map((tx, index) => {
        const isIncome = tx.type === 'income';
        const isLast = index === transactions.length - 1;

        return (
          <TouchableOpacity
            key={tx.id}
            style={[styles.txRow, !isLast && styles.itemDivider]}
            activeOpacity={0.7}
            onPress={() => onSelectTransaction?.(tx)}
          >
            {/* Minimal Monochrome Container */}
            <View style={styles.iconContainer}>
              <Text style={styles.iconLetter}>
                {(tx.category_name || 'TX').slice(0, 1).toUpperCase()}
              </Text>
            </View>

            {/* Details */}
            <View style={styles.detailsContainer}>
              <Text style={styles.description} numberOfLines={1}>
                {tx.description}
              </Text>
              <Text style={styles.metaRow}>
                {tx.category_name || 'General'} • {tx.account_name || 'Account'} • {formatDate(tx.date)}
              </Text>
            </View>

            {/* Stark Tabular Figure */}
            <Text
              style={[
                styles.amount,
                { color: isIncome ? colors.inflow : '#FAFAFA' },
              ]}
            >
              {formatAmount(tx)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 40,
  },
  eyebrow: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 10,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconLetter: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    color: '#FAFAFA',
  },
  detailsContainer: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FAFAFA',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  metaRow: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: colors.textMuted,
  },
  amount: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginLeft: 8,
  },
  emptyContainer: {
    marginHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
