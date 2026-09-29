import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '../types';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';

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
  const { theme } = useTheme();

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('el-GR', { day: 'numeric', month: 'short' });
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Πρόσφατες Συναλλαγές</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
            <Text style={[styles.seeAllText, { color: theme.textSecondary }]}>Όλες ›</Text>
          </TouchableOpacity>
        )}
      </View>

      {transactions.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Δεν υπάρχουν συναλλαγές ακόμα</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Η πρόσφατη δραστηριότητα θα εμφανιστεί εδώ.</Text>
        </View>
      ) : (
        <View style={[styles.ledgerCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
          {transactions.map((tx, index) => {
            const isIncome = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';
            const isLast = index === transactions.length - 1;

            return (
              <TouchableOpacity
                key={tx.id}
                style={[
                  styles.ledgerRow,
                  !isLast && { borderBottomWidth: 1, borderBottomColor: theme.hairlineFaint },
                ]}
                activeOpacity={0.6}
                onPress={() => onSelectTransaction?.(tx)}
              >
                {/* Type indicator dot */}
                <View style={[
                  styles.typeDot,
                  { backgroundColor: isIncome ? theme.emerald : isTransfer ? theme.textMuted : theme.crimson },
                ]} />

                {/* Description + metadata inline */}
                <View style={styles.ledgerMiddle}>
                  <Text style={[styles.ledgerTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                    {tx.description || 'Συναλλαγή'}
                  </Text>
                  <Text style={[styles.ledgerMeta, { color: theme.textMuted }]} numberOfLines={1}>
                    {tx.category_name || 'Γενικά'} · {tx.account_name || '—'} · {formatDate(tx.date)}
                  </Text>
                </View>

                {/* Amount */}
                <Text style={[
                  styles.ledgerAmount,
                  { color: isIncome ? theme.emerald : isTransfer ? theme.textSecondary : theme.crimson },
                ]}>
                  {isIncome ? '+' : '−'}€{tx.amount.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyTitle: {
    fontFamily: fonts.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  emptySubtext: {
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  // ─── Continuous Ledger ───
  ledgerCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
    flexShrink: 0,
  },
  ledgerMiddle: {
    flex: 1,
    paddingRight: 10,
  },
  ledgerTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    fontWeight: '600',
  },
  ledgerMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 2,
  },
  ledgerAmount: {
    fontFamily: fonts.heading,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
    flexShrink: 0,
  },
});
