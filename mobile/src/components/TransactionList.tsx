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

  const formatAmount = (tx: Transaction) => {
    const isIncome = tx.type === 'income';
    const prefix = isIncome ? '+' : '-';
    return `${prefix}€${tx.amount.toLocaleString('el-GR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('el-GR', { day: 'numeric', month: 'short' });
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
            <Text style={[styles.seeAllText, { color: theme.textPrimary }]}>Όλες ›</Text>
          </TouchableOpacity>
        )}
      </View>

      {transactions.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Δεν υπάρχουν συναλλαγές ακόμα</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Η πρόσφατη δραστηριότητα θα εμφανιστεί εδώ.</Text>
        </View>
      ) : (
        <View style={[styles.listCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
          {transactions.map((tx, index) => {
            const isIncome = tx.type === 'income';
            const isLast = index === transactions.length - 1;
            const initialTag = (tx.category_name || tx.description || 'Γ')
              .trim()
              .slice(0, 1)
              .toUpperCase();

            return (
              <TouchableOpacity
                key={tx.id}
                style={[styles.txRow, !isLast && [styles.rowDivider, { borderBottomColor: theme.hairlineFaint }]]}
                activeOpacity={0.7}
                onPress={() => onSelectTransaction?.(tx)}
              >
                {/* Category Icon Badge */}
                <View
                  style={[
                    styles.categoryBadge,
                    {
                      backgroundColor: isIncome ? theme.emeraldBg : theme.crimsonBg,
                      borderColor: isIncome ? theme.emeraldBorder : theme.crimsonBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryBadgeText,
                      { color: isIncome ? theme.emerald : theme.crimson },
                    ]}
                  >
                    {initialTag}
                  </Text>
                </View>

                {/* Description & Sub-spec */}
                <View style={styles.txDetails}>
                  <Text style={[styles.txDescription, { color: theme.textPrimary }]} numberOfLines={1}>
                    {tx.description || 'Συναλλαγή'}
                  </Text>
                  <Text style={[styles.txMeta, { color: theme.textSecondary }]} numberOfLines={1}>
                    {tx.category_name || 'Γενικά'} • {tx.account_name || 'Λογαριασμός'} • {formatDate(tx.date)}
                  </Text>
                </View>

                {/* Amount */}
                <Text
                  style={[
                    styles.txAmount,
                    { color: isIncome ? theme.emerald : theme.crimson },
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
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 18,
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
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    marginTop: 4,
  },
  listCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowDivider: {
    borderBottomWidth: 1,
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
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    fontWeight: '800',
  },
  txDetails: {
    flex: 1,
    paddingRight: 8,
  },
  txDescription: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  txMeta: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
