import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onSelectTransaction?: (tx: Transaction) => void;
  onSeeAll?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onSelectTransaction,
  onSeeAll,
}) => {
  const formatAmount = (tx: Transaction) => {
    const isIncome = tx.type === 'income';
    const prefix = isIncome ? '+' : '-';
    return `${prefix}€${tx.amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>See All ›</Text>
          </TouchableOpacity>
        )}
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Transactions Yet</Text>
          <Text style={styles.emptySubtext}>Your recent activity will appear here.</Text>
        </View>
      ) : (
        <View style={styles.listCard}>
          {transactions.map((tx, index) => {
            const isIncome = tx.type === 'income';
            const isLast = index === transactions.length - 1;
            const initialTag = (tx.category_name || tx.description || 'G')
              .trim()
              .slice(0, 1)
              .toUpperCase();

            return (
              <TouchableOpacity
                key={tx.id}
                style={[styles.txRow, !isLast && styles.rowDivider]}
                activeOpacity={0.7}
                onPress={() => onSelectTransaction?.(tx)}
              >
                {/* Micro Category Icon Badge */}
                <View
                  style={[
                    styles.categoryBadge,
                    {
                      backgroundColor: isIncome ? '#ECFDF5' : '#FFF1F2',
                      borderColor: isIncome ? '#A7F3D0' : '#FECDD3',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryBadgeText,
                      { color: isIncome ? '#059669' : '#E11D48' },
                    ]}
                  >
                    {initialTag}
                  </Text>
                </View>

                {/* Description & Sub-spec */}
                <View style={styles.txDetails}>
                  <Text style={styles.txDescription} numberOfLines={1}>
                    {tx.description || 'Transaction'}
                  </Text>
                  <Text style={styles.txMeta} numberOfLines={1}>
                    {tx.category_name || 'General'} • {tx.account_name || 'Account'} • {formatDate(tx.date)}
                  </Text>
                </View>

                {/* Amount */}
                <Text
                  style={[
                    styles.txAmount,
                    isIncome ? styles.inflowAmount : styles.outflowAmount,
                  ]}
                >
                  {formatAmount(tx)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A0A0A',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A0A0A',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 4,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
  },
  categoryBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryBadgeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  txDetails: {
    flex: 1,
    paddingRight: 8,
  },
  txDescription: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0A0A',
    letterSpacing: -0.2,
  },
  txMeta: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  inflowAmount: {
    color: '#059669',
  },
  outflowAmount: {
    color: '#E11D48',
  },
});
