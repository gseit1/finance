import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Budget } from '../types';

interface SpendingBreakdownProps {
  budgets: Budget[];
  onOpenSetBudget?: (categoryId?: string) => void;
}

export const SpendingBreakdown: React.FC<SpendingBreakdownProps> = ({
  budgets,
  onOpenSetBudget,
}) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Budget Allocations</Text>
        <TouchableOpacity
          onPress={() => onOpenSetBudget?.()}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.actionLink}>+ Set Limit</Text>
        </TouchableOpacity>
      </View>

      {budgets.length === 0 ? (
        <TouchableOpacity
          style={styles.emptyCard}
          onPress={() => onOpenSetBudget?.()}
          activeOpacity={0.75}
        >
          <Text style={styles.emptyTitle}>No Active Limits</Text>
          <Text style={styles.emptySubtext}>
            Tap to set monthly spending limits for your categories
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.cardContainer}>
          {budgets.map((b, index) => {
            const percentage = Math.min((b.spent / b.amount) * 100, 100);
            const isCritical = b.spent / b.amount >= 0.9;
            const isLast = index === budgets.length - 1;

            return (
              <TouchableOpacity
                key={b.id}
                style={[styles.budgetItem, !isLast && styles.itemDivider]}
                onPress={() => onOpenSetBudget?.(b.category_id)}
                activeOpacity={0.7}
              >
                <View style={styles.specRow}>
                  <View style={styles.nameGroup}>
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: b.color || '#0A0A0A' },
                      ]}
                    />
                    <Text style={styles.categoryName}>{b.category_name}</Text>
                  </View>
                  <Text style={styles.amountFigures}>
                    <Text style={isCritical ? styles.overAmount : styles.spentAmount}>
                      €{b.spent.toLocaleString()}
                    </Text>{' '}
                    <Text style={styles.capDivider}>/</Text> €{b.amount.toLocaleString()}
                  </Text>
                </View>

                {/* Smooth Progress Track */}
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${percentage}%`,
                        backgroundColor: isCritical ? '#E11D48' : '#0A0A0A',
                      },
                    ]}
                  />
                </View>
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
    paddingTop: 8,
    paddingBottom: 20,
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
  actionLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A0A0A',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
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
    textAlign: 'center',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  budgetItem: {
    paddingVertical: 12,
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  amountFigures: {
    fontSize: 13,
    color: '#6B7280',
  },
  capDivider: {
    color: '#D1D5DB',
  },
  spentAmount: {
    color: '#111827',
    fontWeight: '700',
  },
  overAmount: {
    color: '#EF4444',
    fontWeight: '700',
  },
  track: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
